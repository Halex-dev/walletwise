<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto px-6 py-3">
        <router-link
          :to="{ name: 'Home' }"
          class="text-xl font-semibold text-gray-800 dark:text-white"
        >
          WalletWise
        </router-link>
      </nav>
    </header>
    <main class="container mx-auto px-6 py-8">
      <router-view></router-view>
    </main>
  </div>
</template>
