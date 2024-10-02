import { ref, watch } from 'vue'

export function useTheme() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  watch(isDark, (newValue) => {
    document.documentElement.classList.toggle('dark', newValue)
    document.documentElement.classList.toggle('darkManager', newValue)
  })

  return { isDark, toggleTheme }
}
