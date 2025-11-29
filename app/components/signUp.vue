<script setup lang="ts">
import {ref, computed} from 'vue';
import {z} from 'zod';
import {auth} from "~/composables/auth";
import {generalUses} from '~/composables/generalUses';
import type {FormSubmitEvent} from '#ui/types';

const {
  baitField,
  email,
  password,
  allowedDomains,
  verificationStatus,
  sentPin,
  verificationPin,
  checkEmail,
  submitPin,
  firstOutput,
  secOutput,
  currentPage,
  displayName,
  usernameID,
  degree,
  alumniBool,
  loadingSecondary,
  signUp,
  checkUsername
} = auth();

const loadingSignup = ref<boolean>(false);

type Schema = z.output<typeof schema>


async function onSubmit(event: FormSubmitEvent<Schema>) {
  loadingSignup.value = true
  console.log("Submitted")
  console.log("Verification status:", verificationStatus.value)
  if (verificationStatus.value) {
    console.log("Entering here,")
    await signUp()
    loadingSignup.value = false;
  }
  await submitPin()

}

async function onError(event) {
  console.log(event?.errors)
  if (event?.errors?.[0]?.name) {
    const element = document.getElementById(event.errors[0].name)
    element?.focus()
    element?.scrollIntoView({behavior: 'smooth', block: 'center'})
  }
}

const {degrees} = generalUses();
const show = ref<boolean>(false)
const chosenDomain = computed(() => {
  return email.value?.split('@').pop()?.toLowerCase() ?? '';
})


const schema = z.object({
  displayName: z.string().trim().min(1, 'Please enter a display name'),
  usernameID: z.string().trim().min(1, "Please enter your user ID").regex(/^\S+$/, "Username cannot contain spaces"),
  email: z.string().trim().email('Invalid email'),
  password: z
      .string().trim().min(8, 'Password must be at least 8 characters, contain at least one uppercase and lowercase letter, and one number')
      .max(64, 'Password must not exceed 64 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
  ,
  degree: z.string().trim().optional(),
  alumni: z.boolean().optional(),
})

const emailSchema = z.object({
  email: z.string().email().min(1, 'Invalid Email')
})

const step = ref<number>(1);

const sendPin = async () => {
  sentPin.value = true
  await checkEmail()
}

function onCreate(item: string) {
  degrees.value.push(item)
  degree.value = item
}

const usernameValid = ref<boolean | null>(null)

const sendCheckUsername = async () => {
  const response = await checkUsername(usernameID.value);
  usernameValid.value = response;
}
</script>

<template>
  <div class="w-full">
    <div>
      <section v-if="currentPage === 0">
        <UCard :ui="{root:`bg-transparent ring-0`}">

          <p class="text-xl font-bold text-center playwrite-au-sa mb-4">Verify your email</p>

          <section class="space-y-2">
            <UForm :state="{ email }" :schema="emailSchema" @submit="sendPin">
              <UFormField :label="'Student Email'">
                <div class="grid space-y-4">

                  <UInput icon="lucide:at-sign" class="w-full" color="neutral" :ui="{ base: `text-base` }"
                          :disabled="verificationStatus" placeholder="2402670@sit.singaporetech.edu.sg" id="email" name="email" type="text" v-model="email"
                          autocomplete="email">
                  </UInput>
                  <UButton block :color="allowedDomains?.includes(chosenDomain) ? 'secondary' : 'neutral'"
                           :icon="allowedDomains?.includes(chosenDomain) ? 'lucide:check' : 'lucide:x'"
                           :disabled="(!allowedDomains?.includes(chosenDomain)) || verificationStatus || email?.length < 1"
                           class="whitespace-nowrap rounded" type="submit">
                    Get Pin
                  </UButton>

                  <UPopover>
                    <UButton class="!px-0" icon="lucide:scan-search" label="Click to view permitted student domains"
                             variant="link" color="neutral">
                    </UButton>
                    <template #content>
                      <UCard>
                        <ul class="text-sm space-y-3 list-disc">
                          <li v-for="studentDomains in allowedDomains">
                            {{ studentDomains }}
                          </li>
                        </ul>
                      </UCard>
                    </template>
                  </UPopover>
                </div>

              </UFormField>


            </UForm>

            <UCard v-if="sentPin" class="animate-fadein">
              <template #header>
                <p class="text-lg font-semibold">Enter the pin sent to your email</p>
                <p class="text-sm">Please check your spam folder if you do not see it.</p>
              </template>
              <template #default>
                <UFormField label="Input Pin" :ui="{ label: `mx-auto` }" class="text-center">
                  <UPinInput :color="verificationStatus ? 'secondary' : 'neutral'" :highlight="verificationStatus"
                             v-model="verificationPin" :disabled="verificationStatus" otp :length="6" type="number">
                  </UPinInput>
                </UFormField>
              </template>

              <template #footer>
                <UButton :disabled="verificationPin?.length != 6 || verificationStatus" block label="Verify Pin"
                         :loading="loadingSecondary" icon="lucide:check-circle" color="secondary" variant="subtle"
                         @click="submitPin()"></UButton>
              </template>
            </UCard>
            <UAlert class="animate-fadein" v-if="firstOutput?.details?.message && !secOutput"
                    :title="firstOutput.details.message" icon="lucide:alert-circle" variant="subtle" color="warning">
            </UAlert>
            <UAlert class="animate-fadein" v-if="(secOutput && secOutput?.attempts < 5) || secOutput?.success"
                    variant="subtle" :icon="secOutput?.success ? 'lucide:check-circle' : 'lucide:x'"
                    :title="secOutput?.success ? 'Successfully Validated' : 'Incorrect Pin'"
                    :color="secOutput?.success ? 'secondary' : 'error'"
                    :description="secOutput?.success ? '' : `${5 - secOutput?.attempts} attempts remaining.`"/>
            <UAlert v-if="secOutput && secOutput.attempts >= 5" icon="lucide:flag" color="error" variant="subtle"
                    title="Please try again later"
                    description="You have inputted the wrong verification pin too many times. Please try again in 1 day.">
            </UAlert>
            <section v-if="sentPin" class="flex gap-3 items-center mt-4">
              <UIcon name="lucide:help-circle" class="dark:text-white"/>
              <p class="text-sm text-center font-medium dark:text-white">Can't find the email? Check your junk or spam
                folders.
              </p>
            </section>


          </section>
          <template #footer v-if="verificationStatus">
            <UButton v-if="verificationStatus" @click="currentPage++" icon="lucide:circle-arrow-right" color="neutral"
                     :disabled="!verificationStatus" label="Next" variant="solid" class="rounded-md">
            </UButton>
          </template>
        </UCard>

      </section>
      <section v-if="currentPage === 1">
        <UCard class="ring-0 lg:max-w-lg w-full h-fit my-auto mx-auto animate-fadein">

          <UForm :schema="schema" :state="{ displayName, email, password, degree, usernameID }" class="space-y-6"
                 @submit="onSubmit" @error="onError">
            <UInput v-model="baitField" name="username" class="hidden" autocomplete="off"/>
            <UFormField label="Display Name" id="displayName" name="displayName" help="You can change this later.">
              <UInput v-model="displayName" icon="lucide:user" class="w-full" color="neutral" placeholder="Haagen"/>
            </UFormField>
            <UFormField label="Username ID" id="usernameID" name="usernameID" help="You cannot change this!">
              <UFieldGroup class="w-full">
                <UInput v-model="usernameID" icon="lucide:at-sign" class="w-full" color="neutral"
                        placeholder="haagen01"/>
                <UButton @click="sendCheckUsername()" label="Check" color="neutral" variant="soft"></UButton>
              </UFieldGroup>
              <USeparator :icon="usernameValid ? 'lucide:check' : 'lucide:octagon-alert'" class="mt-3"></USeparator>
              <UAlert :ui="{ root: `py-1` }" variant="soft" v-if="usernameValid != null"
                      :color="usernameValid ? 'primary' : 'error'"
                      :title="usernameValid ? 'This username is available!' : 'This username is already in use!.'"></UAlert>

            </UFormField>
            <!-- Email (hidden but kept for state) -->
            <UFormField name="email" class="hidden">
              <UInput v-model="email" disabled placeholder="johnsmith@gmail.com" type="email"/>
            </UFormField>

            <!-- Password & DOB -->
            <div class="grid gap-4 md:grid-cols-2 w-full">
              <UFormField label="Password" name="password" id="password" class="col-span-2">
                <UInput v-model="password" class="w-full" :type="show ? 'text' : 'password'" placeholder="Password"
                        color="neutral" :ui="{ trailing: 'pe-1' }">
                  <template #trailing>
                    <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                             :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show"
                             aria-controls="password" @click="show = !show"/>
                  </template>
                </UInput>
              </UFormField>

            </div>

            <div class="space-y-4">
              <UFormField id="degree" label="Degree" name="degree"
                          help="Type your degree directly into the search bar to add it.">
                <USelectMenu create-item @create="onCreate" :items="degrees" class="w-full" color="neutral"
                             v-model="degree">
                </USelectMenu>
              </UFormField>


            </div>

            <!-- Submit Button -->

            <UButton type="submit" :loading="loadingSignup" color="neutral" block size="lg" class="mt-4">
              Sign up
            </UButton>
          </UForm>
        </UCard>

      </section>


    </div>
  </div>
</template>

<style scoped></style>