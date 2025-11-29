<template>
  <div class="border-x border-gray-200 dark:border-0 lg:px-4 h-full">
    <div class="w-full sticky top-4 lg:mb-2 lg:mt-0 mt-6 dark:bg-black">
      <UButton to="/" class="text-xl" icon="lucide:arrow-left" variant="ghost" color="neutral" size="xl">
        Post
      </UButton>
    </div>
    <post
        v-if="currentPost"
        :post="currentPost"
        :logged-in-username-id="userAttributes?.authUID"
        @toggle-like="toggleLike(currentPost)"
    ></post>

    <USkeleton v-else class="w-full lg:h-40" />

    <article v-for="(comment, index) in currentComments" :key="index">
      <comment
          :owner="userAttributes?.authUID === comment?.userAuthUID"
          @refresh-comments="fetchComments()"
          :comment="comment"
      ></comment>
    </article>

    <section v-if="currentComments?.length === 0" class="my-2 px-4">
      <UAlert
          variant="subtle"
          color="secondary"
          title="No replies yet, leave one below?"
          icon="lucide:message-circle-question-mark"
      ></UAlert>
    </section>

    <div v-if="userAttributes" class="flex-shrink-0 flex lg:gap-3 pl-2 lg:pb-0 pb-24 mt-4">
      <div
          :style="{ backgroundColor: userAttributes?.profileColor }"
          class="flex-shrink-0 size-10 rounded-full text-white flex items-center justify-center font-semibold"
      >
        {{ getInitials(userAttributes?.displayName) }}
      </div>

      <section
          v-if="Object.keys(userAttributes)?.length > 0"
          class="w-full lg:px-0 px-2 lg:flex flex-col lg:flex-row lg:items-center gap-3"
      >
        <UTextarea
            :maxlength="replyLength"
            v-model="userComment"
            :ui="{ base: `lg:text-base text-lg` }"
            variant="none"
            color="neutral"
            class="w-4/5"
            placeholder="Enter a reply to this post..."
        ></UTextarea>
          <UButton @click="sendComment()" color="secondary" label="Reply" class="rounded-full" :disabled="!checkReplyLength"></UButton>
<!--        <article-->
<!--            @click="sendComment()"-->
<!--            class="transition-all py-2 px-6 flex-shrink-0 rounded-2xl flex justify-center items-center w-fit ml-auto"-->
<!--            :class="[-->
<!--            checkReplyLength-->
<!--              ? 'dark:bg-white bg-black dark:text-black text-white hover:scale-105 cursor-pointer'-->
<!--              : 'dark:bg-gray-700 bg-gray-300 cursor-not-allowed'-->
<!--          ]"-->
<!--        >-->
<!--          <p class="font-semibold">Reply</p>-->
<!--        </article>-->
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { auth } from '~/composables/auth';
import { feedPostData } from '~/composables/feedPostsData.js';
import { generalUses } from '~/composables/generalUses';

const { getInitials } = generalUses();
const { userAttributes } = auth();
const { posts, getSinglePost, getPostComments, submitComment, likePost, unlikePost, currentPostIndex } = feedPostData();

const route = useRoute();
const currentPost = ref<any>(null);
const currentComments = ref<any[]>([]);
const userComment = ref('');
const replyLength = 220;

const checkReplyLength = computed(() => {
  const length = userComment.value.trim().length;
  return length > 0 && length <= replyLength;
});
const toggleLike = async (post: any) => {
  if (!post || !userAttributes.value?.authUID) return;

  const originallyLiked = post.has_liked;
  post.has_liked = !originallyLiked;
  post.likes_count += post.has_liked ? 1 : -1;

  try {
    if (post.has_liked) {
      await likePost(post.post_id);
    } else {
      await unlikePost(post.post_id);
    }
  } catch (err) {
    console.error('Like/unlike failed:', err);
    // rollback
    post.has_liked = originallyLiked;
    post.likes_count += originallyLiked ? 1 : -1;
  }
};
const fetchComments = async () => {
  currentComments.value = await getPostComments(route.params.postId);
};

const sendComment = async () => {
  console.log("Attempting to send comment")
  if (!checkReplyLength.value) return;
  await submitComment(route.params.postId, userComment.value.trim());
  userComment.value = '';
  await refreshPost()
  await fetchComments();
};
const refreshPost = async () => {
  await getSinglePost(route.params.postId, true);
  currentPost.value = posts.value[currentPostIndex.value];

}
onMounted(async () => {
  const postId = Number(route.params.postId);
  const existingIndex = posts.value.findIndex((p) => p.post_id === postId);
  if (existingIndex !== -1) {
    currentPostIndex.value = existingIndex;
    currentPost.value = posts.value[existingIndex];
  } else {
    const fetched = await getSinglePost(postId);
    if (fetched) {
      currentPost.value = fetched;
      posts.value.push(fetched);
      currentPostIndex.value = posts.value.length - 1;
    }
  }

  await fetchComments();
});
</script>


