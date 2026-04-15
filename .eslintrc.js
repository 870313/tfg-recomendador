module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react-native/all'],
  plugins: ['react-native'],
  ignorePatterns: ['ui/'], // Ignora la carpeta ui
  rules: {
    'react-native/no-color-literals': 'off',
    'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'no-undef': 'error',
  },
};
