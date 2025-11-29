<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {professorData} from '~/composables/professorData';

const {getSchools, schools} = professorData();
const searchQuery = ref<string>('')

onMounted(async () => {
  await getSchools();
})

const results = computed(() => {
  return schools.value.filter(sch => sch?.schoolName.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
</script>

<template>
  <div class="flex flex-col h-full">

    <div class="flex items-center w-full px-4 py-8 dark:bg-accented/60">
      <section class="w-1/4 flex-shrink-0">
        <UColorModeImage
            light="/images/haagen-blk.png"
            dark="/images/haagen-white.png" class="lg:w-1/2 mx-auto"/>
      </section>
      <section class="w-3/4 mx-auto dark:bg-white bg-black/10 p-2 rounded-full">
        <UInput v-model="searchQuery" placeholder="Your School" icon="lucide:school" color="neutral" class="h-full w-full"
                :ui="{base:`focus:bg-transparent hover:bg-transparent text-lg lg:text-base dark:placeholder:text-gray-500 dark:text-black`, leadingIcon: 'dark:text-gray-500'}"
                variant="ghost"></UInput>

      </section>
    </div>
    <div id="allSchools">
      <UCard class="cursor-pointer" :ui="{root:`rounded-none hover:scale-[101%] transition-all hover:bg-accented/50`, body:`flex gap-6 text-black items-center`}"  v-for="(school, index) in results" :key="index">
        <NuxtImg class="w-28 flex-shrink-0" :src="school?.imageURL"></NuxtImg>
        <p class="text-2xl font-medium">{{school.schoolName}}</p>
      </UCard>
    </div>


  </div>

</template>

<style scoped>
</style>
