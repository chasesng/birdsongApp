<template>
  <UApp>
    <title>HaagenSpace</title>
    <navbar @log-out="logout()" @toggle-menu="handleToggleMenu"/>
    <div v-if="router.fullPath != '/signup' && router.fullPath != '/login'"
         class="bg-white lg:px-4 dark:bg-[#020202] min-h-screen h-fit pt-6">
      <div class="flex gap-2 h-full justify-center">
        <div v-if="sidebarVisible" class="hidden lg:block pr-2 min-h-2 text-nowrap">
          <sidebar/>
        </div>
        <section class="lg:w-2/6 lg:min-w-3xl w-full rounded-lg clash-grotesk lg:px-12">
          <div class="border-x-[1px] dark:border-gray-900 border-gray-200">
<!--            <UTabs size="xl" v-if="router.fullPath === '/'" :items="items" variant="link" :ui="{ trigger: 'grow' }"-->
<!--                   class="gap-4 w-full h-fit border-x-[1px] dark:border-gray-900 border-gray-200" color="secondary"/>-->
            <UMain>
              <NuxtLayout>
                <NuxtPage/>

              </NuxtLayout>
            </UMain>
          </div>
        </section>

        <div class="lg:w-1/6 hidden lg:block min-h-screen rounded-lg ">
          <right-sidebar/>
        </div>
      </div>
    </div>

    <div v-else>
      <NuxtPage/>
    </div>
    <footerBar></footerBar>
  </UApp>
</template>

<script setup lang="ts">
import navbar from './components/navbar.vue';
import sidebar from './components/sidebar.vue';
import footerBar from './components/footer.vue';
import {auth} from '~/composables/auth';
import RightSidebar from "~/components/rightSidebar.vue";
import {ref, onMounted} from 'vue';
import type {TabsItem} from '@nuxt/ui'

const {fetchAttributes, initiateUser, logout} = auth();

const router = useRouter().currentRoute;
const sidebarVisible = ref<boolean>(true);
const handleToggleMenu = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const items = [
  {
    label: 'For you',
  },
  {
    label: 'Following',
  }
] satisfies TabsItem[];


onMounted(async () => {
  await initiateUser();
  await fetchAttributes(true);
})
</script>

<style scoped></style>
