export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        React: 'writable',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          tsx: true,
        },
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      react: require('eslint-plugin-react'),
    },
    rules: {
      'prettier/prettier': 'warn',
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전에 맞게 자동 감지
      },
    },
  },
  eslintConfigPrettier,
];
