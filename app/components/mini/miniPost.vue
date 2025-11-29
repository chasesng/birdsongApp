<script setup lang="ts">
import {generalUses} from "~/composables/generalUses";

const {timeAgo} = generalUses();
const props = defineProps({
  post: Object
})
</script>

<template>
  <div>
    <p class="text-lg font-semibold">{{ post?.content }}</p>
    <section class="flex gap-2 items-center">
      <p>{{ timeAgo(post?.created_at) }}</p>

      <UBadge color="neutral" size="sm" :label="post?.posttype"></UBadge>

    </section>
  </div>

</template>

<style scoped>

</style>