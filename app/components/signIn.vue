<script setup lang="ts">
import {auth} from '~/composables/auth';
import {z} from 'zod'
import type {FormSubmitEvent} from '#ui/types/form';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
})
const {email, password, loading, login, errorMsg} = auth();

async function onSubmit(event: FormSubmitEvent<{ email: string }>) {
  try {
    await login();
  } catch (e) {
    console.error(e);
  }
}

</script>

<template>
  <UCard :ui="{root:`bg-transparent ring-0`}">
    <p class="text-xl font-bold text-center playwrite-au-sa mb-4">Sign In</p>
    <section>
      <UForm :schema="schema" :state="{email}" method="POST" class="space-y-6" @submit="onSubmit">
        <UFormField label="Email" name="email" type="email">
          <UInput leading-icon="lucide:mail" v-model="email" placeholder="240xxxx@sit.singaporetech.edu.sg" id="email"
                  type="email" name="email" required autocomplete="email" color="neutral"
                  size="lg" :ui="{root: 'w-full', base: 'lg:text-base text-lg'}"/>
        </UFormField>
        <UFormField label="Password" name="password" type="password">
          <UInput leading-icon="lucide:key" placeholder="••••••••" type="password" v-model="password" id="password"
                  name="password" required color="neutral" size="lg"
                  :ui="{root: 'w-full', base: 'lg:text-base text-lg'}"/>
        </UFormField>
        <UButton label="Sign In" color="secondary" block type="submit" :loading="loading"/>
        <USeparator></USeparator>
        <UAlert v-if="errorMsg" variant="subtle" color="warning" :title="errorMsg" icon="lucide:alert-circle"
                class="mt-3 animate-fadein ease-in-out"></UAlert>
        <ULink>Forgotten Password?</ULink>
      </UForm>


    </section>
  </UCard>
</template>

<style scoped>

</style>