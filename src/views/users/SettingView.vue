<template>
  <div class="p-4 md:p-6 lg:p-8 transition-all duration-300">
    <h1 class="text-3xl font-bold mb-6 text-primary">
      {{ $t('pages.settings.title') }}
    </h1>
    <form @submit.prevent="saveChanges" class="space-y-6">
      <Card
        class="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.settings.personalInfo') }}
          </h2>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="username">
                {{ $t('pages.settings.username') }}
              </label>
              <InputText
                id="username"
                v-model="username"
                class="w-full transition-all duration-300"
                :class="{
                  'p-invalid': v$.username.$invalid && v$.username.$dirty,
                  'border-red-500': v$.username.$invalid && v$.username.$dirty,
                }"
                aria-describedby="username-help"
              />
              <small
                id="username-help"
                class="p-error text-sm transition-all duration-300"
                v-if="v$.username.$invalid && v$.username.$dirty"
              >
                {{
                  $t('validation.required', {
                    field: $t('pages.settings.username'),
                  })
                }}
              </small>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="email">
                {{ $t('pages.settings.email') }}
              </label>
              <InputText
                id="email"
                v-model="email"
                :disabled="true"
                class="w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card
        class="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <template #title>
          <h2 class="text-xl font-semibold">
            {{ $t('pages.settings.preferences') }}
          </h2>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="startDay">
                {{ $t('pages.settings.startDay') }}
              </label>
              <Select
                id="startDay"
                v-model="selectedStartDay"
                :options="dayOptions"
                option-label="name"
                option-value="value"
                class="w-full"
              />
              <small class="block mt-1 text-gray-500 text-sm">
                {{ $t('pages.settings.startDayDescription') }}
              </small>
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="currency">
                {{ $t('pages.settings.currency') }}
              </label>
              <Select
                id="currency"
                v-model="currency"
                :options="currencyOptions"
                option-label="name"
                option-value="code"
                class="w-full"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="language">
                {{ $t('pages.settings.language') }}
              </label>
              <Select
                id="language"
                v-model="language"
                :options="languageOptions"
                option-label="name"
                option-value="code"
                class="w-full"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium" for="dateFormat">
                {{ $t('pages.settings.dateFormat') }}
              </label>
              <Select
                id="dateFormat"
                v-model="dateFormat"
                :options="dateFormatOptions"
                option-label="name"
                option-value="value"
                class="w-full"
              />
            </div>
            <div class="col-span-2 space-y-2">
              <label
                class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer group"
              >
                <div class="flex items-center space-x-3">
                  <i
                    class="pi pi-bell text-xl text-primary-500 dark:text-primary-400 group-hover:animate-bounce"
                  ></i>
                  <div>
                    <span class="font-medium">{{
                      $t('pages.settings.notify')
                    }}</span>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {{ $t('pages.settings.notifyDescription') }}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  v-model="notify"
                  @change="handleNotificationChange"
                />
              </label>
              <transition name="fade">
                <p
                  v-if="notificationChanged"
                  class="text-sm text-primary-500 dark:text-primary-400"
                >
                  {{
                    notify
                      ? $t('pages.settings.notificationsEnabled')
                      : $t('pages.settings.notificationsDisabled')
                  }}
                </p>
              </transition>
            </div>
          </div>
        </template>
      </Card>

      <div class="flex justify-end space-x-4">
        <Button
          type="button"
          :label="$t('common.cancel')"
          class="p-button-secondary custom-secondary-button"
          @click="resetForm"
        />
        <Button
          type="submit"
          :label="$t('common.saveChanges')"
          icon="pi pi-check"
          :disabled="v$.$invalid"
          :loading="isSaving"
        />
      </div>
    </form>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useToastManager } from '@/utils/toastManager'

import {
  currencyOptions,
  languageOptions,
  dateFormatOptions,
} from '@/utils/types'
import { displayDate } from '@/types/user'

const authStore = useAuthStore()
const { appUser } = storeToRefs(authStore)
const { t } = useI18n()
const toastManager = useToastManager()

const username = ref('')
const email = ref('')
const selectedStartDay = ref<number>(1)
const currency = ref('')
const language = ref('')
const notify = ref(false)
const dateFormat = ref<displayDate>('dd/mm/yyyy')
const isSaving = ref(false)

type UpdateLanguageFunction = (newLanguage: string) => void

const rules = {
  username: { required },
}

const notificationChanged = ref(false)

const handleNotificationChange = () => {
  notificationChanged.value = true
  setTimeout(() => {
    notificationChanged.value = false
  }, 3000)
}

const v$ = useVuelidate(rules, { username })

const dayOptions = computed(() =>
  Array.from({ length: 28 }, (_, i) => ({
    name: t('pages.settings.days.day', { day: i + 1 }),
    value: i + 1,
  }))
)
// Inject the updateLanguage function from the parent component
const updateLanguage = inject('updateLanguage') as
  | UpdateLanguageFunction
  | undefined
const originalLanguage = ref('')

onMounted(async () => {
  if (!appUser.value) {
    await authStore.checkAuth()
  }
  if (appUser.value) {
    loadUserSettings()
    originalLanguage.value = appUser.value.language
  }
})

const loadUserSettings = () => {
  if (appUser.value) {
    username.value = appUser.value.username
    email.value = appUser.value.email
    selectedStartDay.value = appUser.value.start_month
    currency.value = appUser.value.currency
    language.value = appUser.value.language
    notify.value = appUser.value.notify
    dateFormat.value = appUser.value.date_format as displayDate
  }
}

const resetForm = () => {
  loadUserSettings()
  v$.value.$reset()
}

const saveChanges = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  if (appUser.value) {
    try {
      isSaving.value = true
      await authStore.updateUser(appUser.value.id, {
        username: username.value,
        start_month: selectedStartDay.value,
        currency: currency.value,
        language: language.value,
        notify: notify.value,
        date_format: dateFormat.value,
      })

      // Apply language change only if it has changed
      if (language.value !== originalLanguage.value && updateLanguage) {
        updateLanguage(language.value)
        originalLanguage.value = language.value
      }

      toastManager.showSuccess('pages.settings.saveSuccess')
    } catch (error) {
      console.error('Error updating user settings:', error)
      toastManager.showError('pages.settings.saveError')
    } finally {
      isSaving.value = false
    }
  }
}
</script>

<style scoped>
.p-card {
  @apply bg-white dark:bg-gray-800 transition-colors duration-300;
}

.p-inputtext,
.p-dropdown {
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300;
}

.p-checkbox .p-checkbox-box {
  @apply bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 transition-colors duration-300;
}

.p-checkbox .p-checkbox-box.p-highlight {
  @apply bg-primary-500 border-primary-500;
}

.text-primary {
  @apply text-primary-500 dark:text-primary-400;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}
.animate-bounce {
  animation: bounce 0.5s ease-in-out;
}
</style>
