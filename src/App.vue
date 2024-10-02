<template>
  <router-view></router-view>

  <Toast />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.checkAuth()
})
</script>
