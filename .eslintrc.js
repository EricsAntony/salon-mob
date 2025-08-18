module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    // Boilerplate screens use inline styles for brevity
    'react-native/no-inline-styles': 'off',
    // React 17+ JSX transform
    'react/react-in-jsx-scope': 'off',
  },
};
