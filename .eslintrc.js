module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  root: true, //This ensures that the current ESLint configuration is the "root" configuration, meaning ESLint will not look for any other configurations in parent directories.
  env: {
    node: true, //Specifies that the code is expected to run in a Node.js environment, enabling global Node.js variables like process, Buffer, etc.
    jest: true, //Enables Jest-specific global variables like test, expect, etc. This is useful if you're using Jest for testing in your project.
  },
  ignorePatterns: ['.eslintrc.js'], // This tells ESLint to ignore the .eslintrc.js file itself when linting.
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 120, //Sets the maximum line length to 120 characters. If any line exceeds this, Prettier will attempt to break it into multiple lines.
        singleQuote: true, //Forces the use of single quotes (') for strings instead of double quotes (")
        trailingComma: 'all', //Ensures that trailing commas are added wherever possible
      },
    ],
    'unused-imports/no-unused-imports': 'error', // Detects and shows an error for unused imports
    'unused-imports/no-unused-vars': 'error', // Detects and shows an error for unused variables
  },
};
