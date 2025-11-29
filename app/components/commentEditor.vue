<script setup lang="ts">
import { ref, computed } from 'vue'
import { feedPostData } from "~/composables/feedPostsData";
import { generalUses } from "~/composables/generalUses";
import quillEditor from './quillEditor.vue';
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import type { createPostTemplate } from "~/composables/feedPostsData";

const { createPost } = feedPostData();
const { labels } = generalUses();

const MAX_CHARS = 220
const loading = ref<boolean>(false);

const anonymousPost = ref(false)

// const plainText = computed(() => {
//   const div = document.createElement('div')
//   div.innerHTML = postContent.value || ''
//   return div.textContent || ''
// })
//
// const remaining = computed(() => MAX_CHARS - plainText.value.length)
const canPost = computed(() => postContent.value.trim().length > 0 && postContent.value.length <= MAX_CHARS)


const postContent = ref<string>('');
const postType = ref<string>('Question');
const postPrep = computed<createPostTemplate>(() => {
  return {
    pContent: postContent.value,
    postType: postType.value,
  }
})

const schema = z.object({
  postContent: z.string().min(10, "Minimum character count of 10 to post."),
  postType: z.string().min(1)
});

async function onSubmit(event: FormSubmitEvent<{ content: string }>) {
  try {
    loading.value = true;
    await createPost(postPrep.value)
  } catch (e) {
    console.error(e);
  }
}

</script>

<template>
  <section class="bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
    <div class="flex gap-3">
      <!-- Avatar / placeholder -->
      <div class="flex-shrink-0">
        <div
            class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
          CS
        </div>
      </div>
      <UForm class="w-full" :schema="schema" :state="{ postContent, postType }" @submit="onSubmit">
        <UFormField name="postContent">
          <quillEditor v-model="postContent"/>
        </UFormField>


        <div class="mt-3 flex flex-col w-full sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center justify-between sm:justify-end gap-3 w-full">
            <div class="text-sm text-slate-500 dark:text-slate-400 mr-3 min-w-24">
              <span :class="[{ 'text-red-500': remaining < 0 }, 'font-medium']">{{ remaining }}</span>
              <span class="ml-1">chars</span>
            </div>
            {{ postContent}}
            <UButton variant="solid" :disabled="!canPost" type="submit"
                     class="ml-auto rounded-full text-sm font-semibold" color="secondary">Reply
            </UButton>
          </div>
        </div>
      </UForm>
    </div>
  </section>
</template>

<style scoped>
textarea:focus {
  outline: none;
}
</style>