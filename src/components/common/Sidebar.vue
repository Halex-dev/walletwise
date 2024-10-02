<template>
  <aside :class="['bg-indigo-700 text-white', collapsed ? 'w-20' : 'w-64']">
    <div class="flex items-center justify-between p-4">
      <h1 v-if="!collapsed" class="text-2xl font-semibold">WalletWise</h1>
      <button
        @click="$emit('toggle')"
        class="p-2 rounded-md hover:bg-indigo-600"
      >
        <i :class="['pi', collapsed ? 'pi-angle-right' : 'pi-angle-left']"></i>
      </button>
    </div>
    <nav>
      <ul>
        <li v-for="item in menuItems" :key="item.to">
          <router-link
            :to="item.to"
            class="flex items-center p-4 hover:bg-indigo-600"
            :class="{ 'justify-center': collapsed }"
          >
            <i :class="['pi', item.icon, 'mr-2']"></i>
            <span v-if="!collapsed">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

interface MenuItem {
  label: string
  icon: string
  to: string
}

defineProps({
  menuItems: {
    type: Array as PropType<MenuItem[]>,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle'])
</script>
