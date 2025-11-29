<script setup lang="ts">
import post from "~/components/post.vue";
import textEditor from "~/components/textEditor.vue";
import {redis} from "~/composables/redis";
import {feedPostData} from "~/composables/feedPostsData";
import {useScrollToBottom} from "~/composables/useScrollToBottom";
import {onMounted, ref, watch, nextTick} from "vue";
import {useScrollStore} from "@/composables/useScrollStore";
import {auth} from "~/composables/auth";

const {getKey, setKey} = redis();
const {posts, fetchPosts, fetchNewPosts, nextBefore, loading, checkPostsCount, mergePostsUnique} = feedPostData();
const scrollStore = useScrollStore();
const {userAttributes, currentUser} = auth();

const mobilePostVisible = ref<boolean>(false);
const textareaRef = ref<any>(null);
const loadingPosts = ref<boolean>(false);
const loadNextPage = async () => {
  if (loading.value || !nextBefore.value) return;
  await fetchPosts(userAttributes.value?.authUID ?? null, 20); // 20 posts per batch
};

const refreshNewPosts = async () => {
  if (loading.value) return;
  await fetchNewPosts(userAttributes.value?.authUID ?? null);
};

const redirectPost = (userId: string, postId: number) => {
  scrollStore.save(location.pathname);
  navigateTo(`/${userId}/${postId}`);
};

const openMobilePost = () => {
  if (currentUser.value?.access_token) {
    mobilePostVisible.value = true;
  } else {
    window.location.href = '/signup';
  }
};


const valKeeper = ref<object>({});
const getValKeeper = async () => {
  valKeeper.value = await getKey()
}


watch(mobilePostVisible, async (val) => {
  if (val) {
    await nextTick();
    const root = textareaRef.value?.$el ?? textareaRef.value;
    const el = root?.querySelector ? root.querySelector("textarea") : root;
    el?.focus?.();
  }
});


onMounted(async () => {
  await checkPostsCount();
  if ((posts.value?.length ?? 0) === 0) {
    loadingPosts.value = true
    await fetchPosts(currentUser?.value?.user ? currentUser?.value?.user?.id : null, 20);
    loadingPosts.value = false;
  }
  scrollStore.restore(location.pathname);
});

useScrollToBottom(loadNextPage, {threshold: 80});
</script>


<template>
<!--  <UFieldGroup>-->
<!--    <UButton color="neutral" @click="setKey()" label="Set Key / Increment"></UButton>-->
<!--    <UButton color="neutral" @click="getValKeeper()" label="Keeper Store"></UButton>-->
<!--  </UFieldGroup>-->
<!--  <pre>-->
<!--  {{ valKeeper }}-->

<!--</pre>-->
  <USlideover v-model:open="mobilePostVisible">
    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-end px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <UButton
              @click="mobilePostVisible = false" variant="ghost" color="neutral" icon="lucide:x" size="lg"
              class="!p-2"/>
        </div>
        <div class="flex-1 overflow-hidden">

          <textEditor @refresh-posts="refreshNewPosts()" @close-mobile-slideover="mobilePostVisible = false"
                      :is-logged-in="currentUser?.access_token != null" :user-initials="userAttributes?.displayName"
                      :user-profile-color="userAttributes?.profileColor"/>
        </div>
      </div>
    </template>
  </USlideover>

  <article @click="openMobilePost()" id="newButton"
           class="lg:hidden fixed bottom-20 right-4 z-20 flex text-white justify-center items-center rounded-full !size-14 bg-secondary-400">
    <UIcon name="lucide:plus" class="size-2/5"></UIcon>
  </article>

  <section class="lg:block hidden">
    <textEditor @refresh-posts="refreshNewPosts()"
                :is-logged-in="currentUser?.access_token != null" :user-initials="userAttributes?.displayName"
                :user-profile-color="userAttributes?.profileColor"/>
  </section>


  <div v-if="posts?.length > 0" class="pb-24 lg:-mt-0 -mt-4">
    <section v-if="!loadingPosts" v-for="post in posts" :key="post.id"
             class="cursor-pointer border-b dark:border-b-gray-900 border-b-gray-200">

      <post v-if="post" :logged-in-username-id="userAttributes?.usernameID" :post="post"
            @click-post="redirectPost(post?.usernameid, post?.post_id)"/>
    </section>
    <div v-if="posts?.length === 0 && !loadingPosts" class="p-6 text-center text-gray-500">No posts yet</div>
  </div>
  <section v-if="loadingPosts" class="grid gap-1">
    <USkeleton class="w-full min-h-32"></USkeleton>
    <USkeleton class="w-full min-h-32"></USkeleton>
    <USkeleton class="w-full min-h-32"></USkeleton>
    <USkeleton class="w-full min-h-32"></USkeleton>
    <USkeleton class="w-full min-h-32"></USkeleton>
  </section>

</template>
