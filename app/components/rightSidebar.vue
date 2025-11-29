<script setup lang="ts">
import { ref, computed } from 'vue';
import { programmes } from "~/composables/programmes";
import MiniPost from "~/components/mini/miniPost.vue";

const { allProgrammes } = programmes();
const postDemo = ref({
  "post_id": 5,
  "content": "testing testing\n",
  "posttype": "Help",
  "created_at": "2025-09-18T07:18:45.3083+00:00",
  "user_id": 2,
  "email": "2402671@smu.edu.sg",
  "usernameid": "candy",
  "displayname": "Candy Tam",
  "profilecolor": "blueToPink",
  "comments_count": 0
});
</script>

<template>
  <!--  <div class="flex flex-col space-y-2 sticky top-20">-->
  <!--    <UInput placeholder="Search" icon="lucide:search" color="neutral" size="xl" class="w-full mb-4"-->
  <!--      :ui="{ base: `rounded-full` }" />-->
  <!--    <UCard :ui="{ body: 'space-y-6' }" class="mb-2">-->
  <!--      <template #header>-->
  <!--        <p class="capitalize font-bold text-xl">Trending Posts</p>-->
  <!--      </template>-->
  <!--      <template #default>-->
  <!--        <mini-post :post="postDemo"></mini-post>-->
  <!--        <mini-post :post="postDemo"></mini-post>-->
  <!--      </template>-->
  <!--    </UCard>-->
  <!--    -->
  <!--  </div>-->


</template>

<style scoped></style>