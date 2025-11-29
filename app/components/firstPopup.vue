<template>
  <UCard v-if="openTicket" :ui="{body:'flex items-center h-full'}"
         class="items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-fit h-64 w-fit bg-gray-100/10 rounded-sm">
    <template #default>
      <div class="outline-dotted w-fit p-8 flex items-center h-full">
        <section class="h-fit leading-8">
          <p class="text-2xl playwrite-au-sa font-semibold">Welcome to Birdsong</p>
          <p class="text-base font-light">A board for SIT Students to ask questions and rate their professors.</p>
        </section>
        <section class="-rotate-90 text-xl flex flex-col">
          <p>ONE TICKET</p>
          <p class="text-sm">Non-refundable</p>
        </section>

      </div>
      <UIcon @click="closeTicket()" name="lucide:x" class="size-6 self-start ml-6 hover:text-red-500/50 transition-all"></UIcon>

    </template>


  </UCard>
</template>

<script setup lang="ts">
const openTicket = ref(true);
const closeTicket = () => {
  openTicket.value = false;
}
</script>

<style scoped>

</style>