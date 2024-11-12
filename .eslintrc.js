module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off', // Se preferisci non avere questa regola
    'prettier/prettier': [
      'warn',
      {
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.jsx', '.json', '.vue'],
      },
    },
  },
}
