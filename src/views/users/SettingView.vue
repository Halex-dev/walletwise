<template>
  <div class="p-4 md:p-6 lg:p-8">
    <h1 class="text-2xl font-bold mb-6">{{ $t('pages.settings.title') }}</h1>
    <Card class="mb-4">
      <template #title>
        {{ $t('pages.settings.personalInfo') }}
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="username">
              {{ $t('pages.settings.username') }}
            </label>
            <InputText id="username" v-model="username" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="email">
              {{ $t('pages.settings.email') }}
            </label>
            <InputText
              id="email"
              v-model="email"
              :disabled="true"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <Card class="mb-4">
      <template #title>
        {{ $t('pages.settings.preferences') }}
      </template>
      <template #content>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="startDay">
            {{ $t('pages.settings.startDay') }}
          </label>
          <Select
            id="startDay"
            v-model="selectedStartDay"
            :options="dayOptions"
            option-label="name"
            option-value="value"
            class="w-full md:w-64"
          />
          <small class="block mt-1 text-gray-500">
            {{ $t('pages.settings.startDayDescription') }}
          </small>
        </div>
      </template>
    </Card>

    <div class="flex justify-end">
      <Button
        :label="$t('pages.settings.saveChanges')"
        icon="pi pi-check"
        @click="saveChanges"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { userService } from '@/services/supabase/user'

const authStore = useAuthStore()
const { appUser } = storeToRefs(authStore)
const { t } = useI18n()

const username = ref('')
const email = ref('')
const selectedStartDay = ref<number>(1)

const dayOptions = computed(() =>
  Array.from({ length: 28 }, (_, i) => ({
    name: t('pages.settings.days.day', { day: i + 1 }),
    value: i + 1,
  }))
)

onMounted(async () => {
  if (!appUser.value) {
    await authStore.checkAuth()
  }

  if (appUser.value) {
    username.value = appUser.value.username
    email.value = appUser.value.email
    selectedStartDay.value = appUser.value.start_month
  }
})

const saveChanges = async () => {
  if (appUser.value) {
    await userService.updateUser(appUser.value.id, {
      username: username.value,
      start_month: selectedStartDay.value,
    })

    //aggiorno i valori per l'authstore //TODO metterlo su authstore
    appUser.value.start_month = selectedStartDay.value
    appUser.value.username = username.value

    console.log('Changes saved successfully!')
  }
  // Qui puoi aggiungere una notifica di successo se lo desideri
}
</script>
