<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"
  >
    <h1 class="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
      404 - Pagina non trovata
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      La pagina che stai cercando non esiste.
    </p>
    <router-link
      :to="{ name: 'Home' }"
      class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Torna alla Home
    </router-link>
  </div>
</template>
