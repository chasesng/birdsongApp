<template>
  <div>
    <UCard :ui="{ body: `space-y-6`, root:`bg-transparent rounded-none` }">
      <section class="flex gap-3 w-full">
        <section id="avatar" :style="{ backgroundColor: singleUser.profileColor }" :class="[
          `bg-[${singleUser.profileColor}]`,
          getInitials(String(singleUser.displayName))?.length >= 3 ? 'lg:text-sm' : 'lg:text-base text-sm',
          'capitalize rounded-full flex items-center justify-center font-semibold lg:mt-0 mt-3 size-8 lg:size-16 flex-shrink-0 text-white'
        ]">
          {{ getInitials(String(singleUser.displayName)).substring(0, 3) }}
        </section>
        <section class="flex justify-between w-full">
          <section id="nameAndDetails" class="flex flex-col gap-0">
            <p class="font-semibold text-xl">{{ singleUser?.displayName }}</p>
            <p class="text-gray-500 text-base">@{{ singleUser?.usernameID }}</p>
            <article class="flex items-center text-base gap-1 text-gray-500">
              <UIcon name="lucide:mail"></UIcon>
              <p>{{ singleUser?.email }}</p>
            </article>
          </section>
          <section v-if="!isOwner" class="grid grid-cols-2 h-fit w-fit lg:block hidden">
            <UButton variant="solid" color="neutral" label="Follow" class="rounded-full col-start-2"></UButton>
          </section>
        </section>

      </section>
      <section>
        <p class="font-semibold">{{ singleUser?.degree }}</p>
      </section>
      <section class="flex justify-end my-2 gap-2 lg:hidden">
        <UButton variant="solid" color="neutral" label="Follow" class="rounded-full col-start-2"></UButton>

      </section>
    </UCard>

    <UCard :ui="{root:`bg-transparent rounded-none`}">
      <UTabs :items="items" variant="link" :ui="{ trigger: 'grow' }" class="gap-4 w-full h-fit" color="secondary"/>

      <div id="allUserPosts"></div>

    </UCard>
  </div>

</template>

<script setup lang="ts">
import {generalUses} from '~/composables/generalUses';
import {auth} from '~/composables/auth';
import {feedPostData} from '~/composables/feedPostsData';
import {ref, onMounted, computed} from 'vue';
import type {TabsItem} from '@nuxt/ui'

const {currentUser} = auth();
const {getInitials} = generalUses();
const {getUser, singleUser, getUserPosts, singleUserPosts} = feedPostData();
const routeUser = useRoute()?.params?.user;
const isOwner = computed(() => {
  return currentUser.value?.user?.id === singleUser.value.authUID
})

const items = [
  {
    label: 'Posts',
  },
  {
    label: `Likes`
  },
  {
    label: 'Comments',
  },
  {
    label: 'Reviews'
  },


] satisfies TabsItem[];

onMounted(async () => {
  await getUser(String(routeUser));
  await getUserPosts(String(singleUser.value.authUID));
})
</script>

<style scoped></style>