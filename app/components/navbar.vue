<script setup lang="ts">
import {generalUses} from "~/composables/generalUses";
import {onMounted} from 'vue'
import {auth} from '~/composables/auth';

const {getInitials} = generalUses();
const router = useRouter().currentRoute;

const emit = defineEmits(['toggle-menu', 'log-out'])
const route = useRoute();
const {currentUser, userAttributes, getUserTesting} = auth();
const mobileLinks = computed(() => [
  {
    icon: 'material-symbols:home-outline',
    altIcon: 'material-symbols:home',
    core: '/',
    to: '/'
  },
  {
    icon: 'material-symbols:search',
    altIcon: 'material-symbols:search-check-2',
    core: '/'
  }
])

onMounted(async () =>  {
  await getUserTesting(currentUser?.access_token)
})

</script>

<template>

  <header class="sticky py-2 bg-[#F3F4F6] dark:bg-gray-950 top-0 z-50 w-full border-b-gray-500 dark:border-b-gray-800">
    <div class="grid grid-cols-3 lg:hidden">
      <UPopover :ui="{ content: `grid` }" v-if="currentUser?.access_token"
                :content="{ side: 'bottom', align: 'start' }">
        <template #content>

          <UButton :to="`/${userAttributes.usernameID}`" variant="ghost" color="neutral" label="Profile"
                   icon="lucide:user"></UButton>
          <UButton @click="$emit('log-out')" variant="ghost" color="error" label="Log out" icon="lucide:log-out"
                   class="!px-3">
          </UButton>
        </template>
        <UButton variant="ghost" icon="lucide:user" color="neutral" size="lg"
                 class="ring-2 ring-gray-400 rounded-full !p-2 lg:hidden w-fit ml-4">
        </UButton>
      </UPopover>

      <ULink to="/"
             class="xl:text-lg text-base select-none col-start-2 font-bold playwrite-au-sa mx-auto w-fit text-gray-600 dark:text-gray-300 pl-2 ">
        <UColorModeImage
            light="/images/haagen-blk.png"
            dark="/images/haagen-white.png" class="h-8"/>
      </ULink>
    </div>
    <div class="lg:flex items-center justify-between lg:px-4 w-full hidden">
      <ULink to="/"
             class="xl:text-lg text-base mx-auto select-none font-bold w-fit text-gray-600 dark:text-gray-300 pl-2 ">
        <UColorModeImage
            light="/images/haagen-blk.png"
            dark="/images/haagen-white.png" class="h-8"
        />
      </ULink>

      <section class="pr-4 flex items-center gap-2">
        <UPopover :ui="{ content: `grid` }" v-if="currentUser?.access_token"
                  :content="{ side: 'bottom', align: 'start' }">
          <template #content>
            <UButton :to="`/${userAttributes.usernameID}`" variant="ghost" color="neutral" label="Profile"
                     icon="lucide:user"></UButton>
            <UButton @click="$emit('log-out')" variant="ghost" color="error" label="Log out" icon="lucide:log-out"
                     class="!px-3">
            </UButton>
          </template>

          <UButton variant="solid" icon="lucide:user" color="neutral" size="lg"
                   class="rounded-full !px-3" label="Profile" trailing-icon="lucide:chevron-down">
            <template #leading>
              <div v-if="currentUser?.access_token"
                   :style="{ backgroundColor: userAttributes?.profileColor }"
                   class="flex-shrink-0 size-6 rounded-full text-white flex items-center justify-center font-semibold"><p class="text-xs">{{ getInitials(userAttributes?.displayName) }}</p>
              </div>
            </template>
          </UButton>
        </UPopover>

        <UButton to="/signup" v-else variant="solid" icon="lucide:user" color="neutral"
                 class="ring-2 dark:ring-gray-400 rounded-full !py-1 px-4" label="Sign In"></UButton>

        <UColorModeSelect class="!px-10 rounded-full"/>
      </section>
    </div>

  </header>
  <!--  router.fullPath != '/signup' && router.fullPath != '/login'-->
  <UButton to="/signup"
           v-if="(!currentUser?.access_token) && router.fullPath != '/signup' && router.fullPath != '/login'"
           variant="soft" icon="lucide:user" color="neutral"
           class="ring-2 dark:ring-gray-400 rounded-full w-fit fixed bottom-20 left-4"
           label="Sign up / Log in"></UButton>


  <footer
      class="lg:hidden fixed bottom-0 z-20 w-full bg-white dark:bg-[#09090B] h-16 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
    <div class="grid grid-cols-4 place-items-center pt-2 pb-safe-area-inset-bottom">
      <UButton v-for="link in mobileLinks" :key="link?.to" variant="ghost" color="neutral" :to="link.to"
               class="p-3 h-12 w-12" :icon="(route.path === link.core) ? link.altIcon : link.icon"
               :ui="{ leadingIcon: 'size-7' }"/>
    </div>

  </footer>

</template>
