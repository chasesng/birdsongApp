<script setup lang="ts">
import { generalUses } from "~/composables/generalUses";
import { feedPostData } from "~/composables/feedPostsData";
import { ref, onMounted, nextTick } from 'vue'

const { likePost, unlikePost, posts, deletePost } = feedPostData();
const { getInitials, timeAgo } = generalUses();

interface user {
  id: number,
  email: string,
  usernameid: string,
  displayname: string,
  profilecolor: string
}

interface Post {
  pId: number
  courseId: number,
  created_at: string,
  pUserId: number
  profilecolor?: string
  content: string,
  usernameid: string,
  posttype: string,
  users: user,
  comments_count: number,
  likes_count: number,
  has_liked: boolean

}

const props = defineProps<{
  post: Post
  loggedInUsernameId: string
}>()


const redirectPost = (userId: string) => {
  navigateTo(`/${userId}`);
}

const isPopoverOpen = ref<boolean>(false)
const closePopover = () => {
  isPopoverOpen.value = false
}

const imageModalOpen = ref<boolean>(false);

const openImageModal = () => {
  imageModalOpen.value = !imageModalOpen.value
}

const emits = defineEmits(['click-post'])
const likeLoading = ref<boolean>(false)
const toggleLike = async (post: any) => {
  likeLoading.value = true;
  const originallyLiked = post.has_liked;

  post.has_liked = !originallyLiked;
  post.likes_count += post.has_liked ? 1 : -1;

  try {
    if (post.has_liked) {
      await likePost(post.post_id);
    } else {
      await unlikePost(post.post_id);
    }

    const idx = posts.value.findIndex(p => p.post_id === post.post_id);
    if (idx !== -1) {
      posts.value[idx].has_liked = post.has_liked;
      posts.value[idx].likes_count = post.likes_count;
    }
  } catch (err) {
    console.error("Like/unlike failed:", err);

    // rollback UI
    post.has_liked = originallyLiked;
    post.likes_count += originallyLiked ? 1 : -1;
  } finally {
    likeLoading.value = false;
  }
};

const expanded = ref<boolean>(false);
const isTruncated = ref<boolean>(false);
const contentRef = ref(null);


const isOwner = computed(() => {
  return props.loggedInUsernameId === props.post?.usernameid
})

onMounted(() => {
  nextTick(() => {
    const el = contentRef.value
    if (el.scrollHeight > el.clientHeight) {
      isTruncated.value = true
    }
  })
})
const dummyFunc = () => {
  return;
}

const prepareDelete = async (post) => {
  const response = await deletePost(post);
  if (response === 1) {
    const idx = posts.value.findIndex(p => p.post_id === post.id);
    if (idx !== -1) {
      delete posts.value[idx];
    }
  }
}

</script>
<!-- <template>
  <UBlogPost v-if="post?.user_id" :ui="{
    description: 'text-black dark:text-white',
    root: 'ring-0 border-b-1 rounded-none border-b-gray-50 shadow-sm dark:shadow-none dark:border-b-gray-800 transition-none',
    footer: 'px-7 pb-2.5 grid grid-cols-4'
  }" :authors="authors">
    <template #date>
      {{ formatDate(post.created_at) }}
    </template>
    <template #description>
      <div v-html="post.content"></div>
    </template>
    <template #badge>
      <UBadge variant="outline"
          :color="post.posttype === 'Question' ? 'secondary' : post.posttype === 'Discussion' ? 'warning' : 'neutral'"
          class="capitalize">
        <template #leading>
          <UIcon
              :name="post.posttype === 'Question' ? 'lucide:circle-question-mark' : post.posttype === 'Discussion' ? 'lucide:messages-square' : 'lucide:help-circle'"/>
        </template>
        <template #default>{{ post.posttype }}</template>
      </UBadge>
    </template>

    <template #authors>
      <div class="flex gap-4 items-center">
        <section :style="{ backgroundColor: post.profilecolor }" :class="[`bg-[${post.profilecolor}]`,
        getInitials(post.displayname)?.length >= 3 ? 'text-sm' : 'text-base',
          'capitalize rounded-full flex items-center justify-center font-semibold size-9 text-white'
        ]">
          {{ getInitials(post.displayname).substring(0, 3) }}
        </section>

        <section class="flex flex-col lg:text-sm text-xs">

          <p class="capitalize">{{ post.displayname }}
            <span class="text-gray-500 dark:text-gray-400">@{{ post.usernameid }}
          </span></p>
          <p class="text-gray-500">{{ post.email }}</p>
        </section>
      </div>
    </template>

    <template #footer>
      <UButton variant="ghost" color="neutral" :label="String(post.comments_count)" icon="lucide:message-square"
               class="w-fit"/>
      <UButton variant="ghost" :color="post?.user_liked ? 'error' : 'neutral'" :label="String(post.likes_count)" :icon="post?.user_liked ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'" class="w-fit"/>
    </template>
  </UBlogPost>
</template> -->

<!--<section class="grid gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-300">-->

<template>
  <div class="bg-white dark:bg-transparent hover:bg-accented/10" @click="() => $emit('click-post')">
    <section class="flex gap-2 p-4 lg:p-6">
      <section id="avatar" :style="{ backgroundColor: post.profilecolor }" :class="[
        `bg-[${post.profilecolor}]`,
        getInitials(post.displayname)?.length >= 3 ? 'lg:text-sm' : 'lg:text-base text-sm',
        'capitalize rounded-full flex items-center justify-center font-semibold lg:mt-0 size-10 lg:size-12 flex-shrink-0 text-white'
      ]">
        {{ getInitials(post.displayname).substring(0, 3) }}
      </section>
      <section id="nameDetails" class="grid w-full">

        <article @click.stop="redirectPost(post.usernameid)" class="flex w-full items-center h-fit pl-1 gap-2"
          :class="isOwner ? 'text-secondary-500 dark:text-secondary-400' : ''">
          <p class="font-semibold">{{ post.displayname }}</p>
          <p class="text-gray-500">@{{ post.usernameid }}</p>·
          <p class="text-gray-500">{{ timeAgo(post.created_at) }}</p>·
          <UBadge variant="soft"
            :color="post.posttype === 'Question' ? 'secondary' : post.posttype === 'Discussion' ? 'warning' : 'neutral'"
            class="capitalize w-fit h-fit">
            <template #leading>
              <UIcon
                :name="post.posttype === 'Question' ? 'lucide:circle-question-mark' : post.posttype === 'Discussion' ? 'lucide:messages-square' : 'lucide:help-circle'" />
            </template>
            <template #default>{{ post.posttype }}</template>
          </UBadge>
        </article>

        <section class="relative pl-1">
          <p ref="contentRef" :class="{ 'line-clamp-4': !expanded, 'whitespace-pre-wrap': true, 'break-words': true }"
            class="text-base">
            {{ post.content }}
          </p>
          <UButton @click.stop="dummyFunc()" v-if="isTruncated && !expanded" @click="expanded = true" variant="ghost"
            color="neutral" class="text-blue-500 mt-1">
            See more
          </UButton>
        </section>
        <NuxtImg @click.stop="openImageModal()" v-if="post?.image_url" :src="post?.image_url" class="w-1/2 rounded-lg">
        </NuxtImg>
      </section>

      <section id="options" class="w-fit ml-auto flex items-start gap-3 ">


        <UPopover :ui="{ content: `grid` }" :content="{ side: 'right' }">
          <UButton @click.stop="dummyFunc()" icon="lucide:ellipsis" color="neutral" class="!px-0 h-6 cursor-pointer"
            :ui="{ leadingIcon: 'bg-gray-500' }" variant="link"></UButton>
          <template #content>
            <UButton @click="prepareDelete(post)" v-if="isOwner" variant="ghost" color="error" icon="lucide:trash-2"
              label="Delete"></UButton>
            <UButton v-if="!isOwner" variant="ghost" color="error" icon="lucide:flag" label="Report"></UButton>
          </template>
        </UPopover>
      </section>
    </section>

    <section id="functional" class="grid grid-cols-4">
      <UButton size="xl" variant="link" color="neutral"
        :icon="post?.comments_count > 0 ? 'material-symbols:chat-bubble-rounded' : 'material-symbols:chat-bubble-outline-rounded'"
        :label="String(post?.comments_count)" />
      <UButton size="xl" :loading="likeLoading" @click.stop="toggleLike(post)" variant="link"
        :color="post.has_liked ? 'error' : 'neutral'" :label="String(post.likes_count)"
        :icon="post.has_liked ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'" class="w-fit" />
      <UPopover v-model:open="isPopoverOpen" @click.stop="dummyFunc(post)">
        <template #content>
          <UButton icon="lucide:copy" label="Copy Link" variant="link" color="neutral"></UButton>
        </template>
        <UButton @click.stop="dummyFunc(post)" variant="link" icon="lucide:link" size="sm" color="neutral"
          class="ml-auto col-start-3"></UButton>
      </UPopover>
    </section>
  </div>

  <UModal v-model:open="imageModalOpen">
    <template #content>
      <NuxtImg v-if="post?.image_url" :src="post?.image_url" class="w-full h-auto rounded-lg"></NuxtImg>
    </template>
  </UModal>
</template>


<style scoped>
/* Keep styling primarily in Tailwind; small accessible focus styles */
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
</style>