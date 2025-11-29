<template>
  <div class="bg-gray-100 dark:bg-black flex justify-center items-center h-dvh">
    <!--    <NuxtImg src="/images/godrays.png" class="absolute z-0 top-0 left-0 select-none hidden xl:block"></NuxtImg>-->

    <div class="grid xl:grid-cols-3 xl:w-3/4 w-full xl:px-0 px-3 h-fit my-auto">
      <section class="xl:block hidden col-span-2 w-fit mx-auto my-auto space-y-7">
        <UColorModeImage
            light="/images/haagen-blk.png"
            dark="/images/haagen-white.png" class="w-80 mx-auto"/>
        <p class="clash-grotesk text-lg text-center">Know what's happening.</p>
      </section>
      <section class="col-span-4 xl:col-span-1 rounded-lg z-10">
        <p class="playwrite-au-sa text-3xl xl:text-[96px] text-center xl:hidden block">Haagen</p>

        <UIcon name="picon:dog" class="size-10 ml-auto"></UIcon>

        <sign-up v-if="signState"/>
        <sign-in v-else-if="!signState"/>
        <div class="p-4">
          <section v-if="!signState">
            <p class="mx-auto text-center text-sm/6 text-gray-400">
              Not a member?
              <span @click="modSignState" class="font-semibold text-secondary-500 cursor-pointer">Sign up for
            free</span>
            </p>
          </section>
          <section v-else-if="signState">
            <p class="mx-auto text-center text-sm/6 text-gray-400">
              Already have an account?
              <span @click="modSignState" class="font-semibold text-secondary-500 cursor-pointer">Sign in</span>
            </p>
          </section>
        </div>

      </section>

    </div>
  </div>

</template>

<script setup lang="ts">
import {auth} from '~/composables/auth';
import signUp from '~/components/SignUp.vue'
import signIn from '~/components/signIn.vue';

const {currentUser} = auth();
import {ref} from "vue";

const signState = ref<boolean>(true);
const modSignState = () => {
  signState.value = !signState.value;
}
definePageMeta({
  path: "/signup"
})
</script>

<style scoped>

</style>