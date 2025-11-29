<script setup lang="ts">
import {ref, computed} from 'vue'
import {generalUses} from "~/composables/generalUses";
import {auth} from "~/composables/auth";
import {Cropper} from "vue-advanced-cropper";
import axios from 'axios';
import "vue-advanced-cropper/dist/style.css";
import { redis } from '~/composables/redis';
const toast = useToast();

const {getKey, setKey} = redis();
import {z} from 'zod';
import type {FormSubmitEvent} from '#ui/types';

const emit = defineEmits(['refresh-posts', 'close-mobile-slideover'])

const {currentUser} = auth();
const {labels, getInitials, communities} = generalUses();

const MAX_CHARS = 220
const loading = ref<boolean>(false);

const typesPostValue = ref<string>('0')
const typesPost = ([
  {
    label: `Text`,
    icon: `lucide:baseline`
  },
  {
    label: `Image`,
    icon: `lucide:camera`
  }
])

function base64ToBlob(base64Data: string) {
  const parts = base64Data.split(',');
  const meta = parts[0] || '';
  const data = parts[1] || parts[0]; // sometimes data may not include meta
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const byteString = atob(data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], {type: mime});
}

const remaining = computed(() => MAX_CHARS - postContent.value.length)
const canPost = computed(() => postContent.value.trim().length > 0 && postContent.value.length <= MAX_CHARS)

const postContent = ref<string>('');
const postType = ref<string>('Question');
const communitySelect = ref<string>('N/A')

const editImageModal = ref<boolean>(false);
const selectedFile = ref(null);
const previewImage = ref(null);
const cropperRef = ref(null);
const croppedImage = ref(null);
const loadingUpload = ref<boolean>(false)
const postAlertVisible = ref<boolean>(false);
const postAlertTitle = ref<string>('')
const props = defineProps({
  isLoggedIn: Boolean,
  userInitials: String,
  userProfileColor: String,
})


const openEditImageModal = () => {
  editImageModal.value = !editImageModal.value
}
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const files = input?.files;

  if (!files || files.length === 0) return;
  const file = files[0];
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    const res = e.target?.result;
    if (typeof res === 'string') {
      previewImage.value = res;
    } else {
      previewImage.value = '';
    }
  };

  reader.readAsDataURL(file);
  selectedFile.value = file;
};

const schema = z.object({
  postContent: z.string().min(10, "Minimum character count of 10 to post."),
  postType: z.string().min(1)
});

const getCroppedImage = () => {
  if (cropperRef.value && selectedFile.value) {
    const {canvas} = cropperRef.value.getResult();
    croppedImage.value = canvas.toDataURL("image/png");
  }
  editImageModal.value = false
};

const submitImage = async () => {
  console.log("triggered")
  const hasImage = typesPostValue.value === '1';
  if (!selectedFile.value && hasImage) {
    postAlertTitle.value = 'No image has been selected.'
    toggleVisibility();
  }
  loading.value = true;
  try {
    const title = String(postContent.value).trim();


    const formData = new FormData();
    if (hasImage) {
      getCroppedImage();
      const blob = base64ToBlob(croppedImage.value);
      formData.append('file', blob, 'post-image.png');
    }

    formData.append('text', title);
    formData.append('posttype', postType.value || 'Question');
    formData.append('hasimage', hasImage ? 'true' : 'false');

    const redisData = await getKey();
    const attempts = parseInt(redisData?.value)
    if (redisData?.success) {
      await setKey();

      toast.add({
        title: 'Please wait before posting again.',
        icon: 'lucide:clock-10',
        color: 'secondary'
      });

      return;
    }

    await setKey();


    const response = await axios.post('https://c8yjgte58i.execute-api.ap-southeast-1.amazonaws.com/default/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${currentUser.value?.access_token}`
          }
        })

    if (response.data.status === 200) {
      emit('refresh-posts');
      emit('close-mobile-slideover');
      postContent.value = '';
      croppedImage.value = null;
      selectedFile.value = null;

    } else {
      console.log(response.data)
      throw new Error('No URL returned from server');
    }
    previewImage.value = null
    selectedFile.value = null
  } catch (error) {
    console.error("Error during upload", error);
  } finally {
    loading.value = false;
  }
}

const toggleVisibility = () => {
  postAlertVisible.value = true;
  setTimeout(() => {
    postAlertVisible.value = false;
  }, 1000)
}

async function onSubmit(event: FormSubmitEvent<{ content: string }>) {
  loading.value = true;

  try {
    const hasImage = typesPostValue.value === '1';
    const text = (postContent.value || '').trim();

    // Basic validation for text-only posts
    if (!text && !hasImage) {
      alert('Post cannot be empty.');
      loading.value = false;
      return;
    }

    const formData = new FormData();
    formData.append('text', text);
    formData.append('postType', postType.value || 'Question');
    formData.append('hasImage', hasImage ? 'true' : 'false');

    // Attach image when required
    if (hasImage) {
      // prefer croppedImage, fallback to selectedFile
      if (!croppedImage.value && !selectedFile.value) {
        alert('Please select an image to post.');
        loading.value = false;
        return;
      }

      let blob = null;
      if (croppedImage.value) {
        blob = base64ToBlob(croppedImage.value);
      } else if (selectedFile.value) {
        // selectedFile likely already a File object from <input type="file">
        blob = selectedFile.value;
      }

      // Safety: ensure blob is a Blob/File
      if (!(blob instanceof Blob)) {
        console.error('file is not a Blob:', blob);
        alert('Selected image is invalid.');
        loading.value = false;
        return;
      }

      // append file (filename helps busboy)
      formData.append('file', blob, 'post-image.webp');
    }

    // Debug: inspect formData contents before sending
    // This should show file => Blob { size: ..., type: ... }
    for (const entry of formData.entries()) {
      console.log('formData entry:', entry[0], entry[1]);
    }

    const response = await axios.post(
        'https://c8yjgte58i.execute-api.ap-southeast-1.amazonaws.com/default/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.value.access_token}`,
            // DO NOT set Content-Type — axios/browser will set multipart boundary
          },
          // optional — give the request a reasonable timeout
          timeout: 30000,
        }
    );

    console.log('Response:', response.data);

    // success handling
    if (response?.data?.post) {
      emit('refresh-posts');
      emit('close-mobile-slideover');
      postContent.value = '';
      croppedImage.value = null;
      selectedFile.value = null;
    } else {
      // backend returned 200 but no post — log for debugging
      console.warn('Unexpected response, no post returned:', response.data);
      alert('Post created (no post payload returned).');
    }
  } catch (err: any) {
    // better error output: prefer server response body if present
    console.error('Error creating post:', err);
    const serverData = err?.response?.data;
    if (serverData) {
      console.error('Server response:', serverData);
      alert(serverData.error || serverData.message || 'Server error while creating post.');
    } else {
      alert(err.message || 'Unexpected error while creating post.');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UAlert class="transition-all" v-if="postAlertVisible" color="error" variant="solid" icon="lucide:alert-circle"
          :title="postAlertTitle" :ui="{root:'items-center rounded-full',title:`text-lg`}"/>
  <section class="flex flex-col h-full">
    <!-- Header with Tabs -->
    <div class="pt-4 lg:pt-6">
      <UTabs v-model="typesPostValue" :items="typesPost" variant="link" class="gap-4" color="neutral"/>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 lg:p-6">
        <div class="flex gap-3 lg:gap-4">
          <div class="flex-shrink-0">
            <div
                v-if="isLoggedIn"
                :style="{ backgroundColor: userProfileColor }"
                class="size-10 lg:size-12 rounded-full text-white flex items-center justify-center font-semibold text-sm lg:text-base shadow-sm"
            >
              {{ getInitials(userInitials) }}
            </div>
          </div>

          <!-- Text Post Form -->
          <UForm
              v-if="typesPostValue === '0'"
              class="flex-1 min-w-0"
              :schema="schema"
              :state="{ postContent, postType }"
              @submit="submitImage"
          >
            <UFormField name="postContent">
              <UTextarea
                  :disabled="loading"
                  variant="ghost"
                  :ui="{
                  base: `text-base lg:text-lg leading-relaxed resize-none hover:bg-transparent focus:bg-transparent`,
                }"
                  :maxlength="220"
                  v-model="postContent"
                  placeholder="What's on your mind?"
                  :rows="6"
                  color="neutral"
                  class="w-full"
              />
            </UFormField>

            <!-- Character Counter -->
            <div class="-mt-5 flex items-center justify-end">
              <div class="flex items-center gap-1 text-sm">
                <span
                    :class="[
                    'font-medium tabular-nums transition-colors duration-200',
                    remaining <= 0
                      ? 'text-red-500 dark:text-red-400'
                      : remaining < 50
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  ]"
                >
                  {{ remaining }}
                </span>
                <span class="text-neutral-400 dark:text-neutral-500 text-xs hidden sm:inline">
                  characters remaining
                </span>
                <span class="text-neutral-400 dark:text-neutral-500 text-xs sm:hidden">left</span>
              </div>
            </div>
          </UForm>

          <!-- Image Post Form -->
          <UForm v-else @submit="submitImage" class="flex-1 min-w-0 space-y-3">
            <UFormField name="title" id="title">
              <UInput
                  v-model="postContent"
                  placeholder="Enter a title for your post"
                  :ui="{
                  base: `text-lg lg:text-xl font-semibold`,
                  root: `w-full`
                }"
                  color="neutral"
                  variant="ghost"
                  required
              />
            </UFormField>

            <!-- Image Preview/Upload Section -->
            <section class="space-y-3">
              <NuxtImg
                  v-if="croppedImage"
                  :src="croppedImage"
                  class="w-full h-auto max-h-64 lg:max-h-80 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800"
              />

              <button
                  type="button"
                  @click="openEditImageModal()"
                  class="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors w-full lg:w-auto"
              >
                <UIcon name="lucide:image" class="size-5 text-neutral-500 dark:text-neutral-400"/>
                <p class="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {{ croppedImage ? 'Change Image' : 'Add Image' }}
                </p>
              </button>
            </section>
          </UForm>
        </div>
      </div>
    </div>

    <!-- Footer with Controls -->
    <div
        class="px-4 lg:px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div class="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
        <!-- Post Type and Community Selectors -->
        <div class="flex flex-col sm:flex-row gap-2 lg:gap-3 flex-1">
          <UFormField name="postType" class="flex-1 sm:flex-initial">
            <USelect
                variant="ghost"
                v-model="postType"
                :items="labels"
                class="w-full sm:w-48"
                color="neutral"
            />
          </UFormField>

          <UFormField name="community" class="flex-1 sm:flex-initial">
            <USelect
                variant="ghost"
                v-model="communitySelect"
                :items="communities"
                class="w-full sm:w-64"
                color="neutral"
            />
          </UFormField>
        </div>

        <UButton
            :loading="loading"
            @click="submitImage()"
            variant="solid"
            :disabled="!canPost"
            type="submit"
            class="rounded-full text-sm font-semibold dark:text-white px-8 py-2.5 w-full sm:w-auto lg:ml-auto"
            color="secondary" size="lg">Post
        </UButton>
      </div>
    </div>
  </section>

  <UModal
      :ui="{ footer: `justify-end gap-2` }"
      title="Upload Image"
      description="Upload and crop your post's image"
      v-model:open="editImageModal"
  >
    <template #body>
      <div class="space-y-4">
        <div v-if="previewImage" class="flex justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
          <Cropper
              ref="cropperRef"
              class="w-full max-w-[300px] h-[300px]"
              :src="previewImage"

              :auto-zoom="true"
              :resize-image="true"
          />
        </div>

        <div class="flex justify-center">
          <UInput
              type="file"
              variant="outline"
              accept="image/*"
              class="w-full"
              @change="handleFileChange"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" @click="editImageModal = false;previewImage = null" variant="ghost">
        Cancel
      </UButton>
      <UButton
          :loading="loadingUpload"
          color="secondary"
          class="rounded-full"
          @click="getCroppedImage()"
      >
        Confirm
      </UButton>
    </template>
  </UModal>
</template>


<style scoped>
textarea:focus {
  outline: none;
}
</style>