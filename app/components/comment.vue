<template>
  <div
      class="flex gap-4 items-start p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
    <section :style="{ backgroundColor: comment?.users?.profileColor }"
             v-if="comment.users"
             :class="[
        getInitials(comment.users.displayName)?.length >= 3 ? 'text-sm' : 'text-base',
        'capitalize rounded-full flex items-center justify-center font-semibold size-9 text-white']">
      {{ getInitials(comment.users.displayName).substring(0, 3) }}
    </section>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1 text-sm">
        <span class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ comment.users.displayName }}</span>
        <span class="text-gray-500 dark:text-gray-400">@{{ comment.users.usernameID }}</span>
        <span class="mx-1 text-gray-400">•</span>
        <span class="text-gray-500 dark:text-gray-400">{{ timeAgo(comment.created_at) }}</span>
        <section v-if="owner" class="flex gap-1 items-center">
          <span class="mx-1 text-gray-400">•</span>
          <UPopover v-model:open="isPopoverOpen" :content="{ side: 'right', align: 'start' }">
            <template #content>
              <section class="grid">
                <UButton @click="startEditing();isPopoverOpen = false" icon="lucide:edit" variant="ghost" size="sm" color="neutral"
                         label="Edit Comment"/>
                <UButton icon="lucide:trash" variant="ghost" size="sm" color="error" label="Delete"/>
              </section>
            </template>
            <UButton class="!p-0" icon="lucide:ellipsis" color="neutral" variant="ghost"></UButton>

            <p v-if="comment?.edited" class="text-xs dark:text-gray-300">(Edited)</p>
          </UPopover>
        </section>


      </div>
      <div v-if="!editingCommentVisible"
           class="mt-1 text-gray-800 dark:text-gray-200 text-base leading-6 whitespace-pre-wrap">
        {{ comment.cContent }}
      </div>
      <div v-if="editingCommentVisible" class="mt-1">
        <UTextarea variant="ghost" v-model="editingCommentContent" class="w-full" :rows="2" :ui="{base:`text-lg lg:text-base`}" placeholder="Edit your reply"
                   color="neutral"></UTextarea>
        <section class="h-fit w-full flex justify-end gap-2 mt-1">
          <UButton @click="closeEditing()" variant="ghost" label="Cancel" color="neutral"></UButton>
          <UButton @click="saveEditing()" variant="solid" color="neutral" label="Save Changes"></UButton>
        </section>

      </div>
    </div>

  </div>
  <UModal :ui="{body: `flex justify-end gap-3`}" v-model:open="saveConfirmModal" title="Save Changes?"
          description="You will be updating your comment.">
    <template #body>
      <UButton @click="saveConfirmModal =false" variant="ghost" label="Cancel" color="neutral"></UButton>
      <UButton @click="confirmUpdate()" variant="solid" label="Confirm" color="neutral"></UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import {feedPostData} from "~/composables/feedPostsData";
import {generalUses} from "~/composables/generalUses";

const emit = defineEmits(['refresh-comments'])
const isPopoverOpen = ref<boolean>(false)
const {editComment} = feedPostData();
const saveConfirmModal = ref<boolean>(false);
const {getInitials, timeAgo} = generalUses();
const editingCommentContent = ref<string>('')
const editingCommentVisible = ref<boolean>(false);
const startEditing = () => {
  editingCommentVisible.value = true;
  editingCommentContent.value = props.comment.cContent;
}
const closeEditing = () => {
  editingCommentVisible.value = false;
  editingCommentContent.value = '';
}

const saveEditing = () => {
  saveConfirmModal.value = true;
  return;
}

const confirmUpdate = async () => {
  await editComment(props.comment?.id, editingCommentContent.value);
  closeEditing();
  saveConfirmModal.value = false;
  emit('refresh-comments');
  return;
}
const props = defineProps<{
  comment: {
    id: number
    created_at: string
    cContent: string
    userId: number
    postId: number
    edited: boolean,
    users: {
      id: number
      email: string
      usernameID: string
      displayName: string
      profileColor: string
    }
  },
  owner: boolean
}>()
</script>
