<template>
  <nav class="flex flex-col space-y-2 sticky top-20">

    <UButton v-for="item in navItems" :key="item.label" :variant="item.trueLabel == $route.name ? 'soft' : 'ghost'"
      :to="item.link" color="neutral" class="justify-start h-10 w-11 md:w-48 rounded-full md:rounded-full px-4">
      <UIcon :name="item.icon" class="size-5 flex-shrink-0 md:mr-3" />
      <span class="hidden md:inline-block font-semibold text-lg capitalize">{{ item.label }}</span>
    </UButton>

  </nav>

  <UModal v-model:open="authModalOpen" title="Sign up / Log in" description="Get access to posting on Haagen.">
    <template #body>

      <section v-if="!signState">
        <sign-in />
      </section>
      <section v-else>
        <sign-up />
      </section>
    </template>
    <template #footer>
      <section v-if="!signState">
        <p class="mx-auto text-center text-sm/6 text-gray-400">
          Not a member?
          <span @click="modSignState" class="font-semibold text-indigo-400 hover:text-indigo-300">Sign up for
            free</span>
        </p>
      </section>
      <section v-else-if="signState">
        <p class="mx-auto text-center text-sm/6 text-gray-400">
          Already have an account?
          <span @click="modSignState" class="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</span>
        </p>
      </section>

    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import SignIn from "~/components/signIn.vue";
import { auth } from "~/composables/auth";
import { ref, onMounted } from "vue";
const { fetchAttributes, currentUser, initiateUser } = auth();

onMounted(async () => {
  await fetchAttributes();
  await initiateUser();
})
const signState = ref<boolean>(true);
const authModalOpen = ref<boolean>(false);

const modSignState = () => {
  signState.value = !signState.value;
}
const openAuthModal = () => {
  authModalOpen.value = true;
}

const isDark = useDark()
const toggleDark = useToggle(isDark)

interface navItem {
  label: string,
  icon: string,
  link: string,
  trueLabel: string
}

const navItems = ref<navItem[]>([
  { label: 'home', icon: 'lucide:home', link: '/', trueLabel: 'index' },
  // { label: 'Professors', icon: 'lucide:star', link: 'professors', trueLabel: 'professors' },
  // { label: 'profile', icon: 'lucide:user', link: '/', trueLabel: 'profile' },
])
</script>

<style scoped></style>