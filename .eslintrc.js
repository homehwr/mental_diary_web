module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    // ========== 禁用不必要的规则 ==========
    // Vue相关
    'vue/multi-word-component-names': 'off',          // 组件名不需要强制多单词
    'vue/html-self-closing': 'off',                   // 允许自闭合标签
    'vue/singleline-html-element-content-newline': 'off', // 单行元素内容不需要换行
    'vue/max-attributes-per-line': 'off',             // 不限制每行属性数量
    'vue/html-indent': 'off',                         // 关闭HTML缩进检查
    'vue/require-default-prop': 'off',                // 不要求prop默认值
    
    // JavaScript相关
    'no-unused-vars': 'warn',                         // 未使用变量改为警告
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 开发环境允许console
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 开发环境允许debugger
    'no-empty': ['error', { 'allowEmptyCatch': true }], // 允许空catch块
    'no-extra-semi': 'off',                           // 允许不必要的分号
    'prefer-const': 'warn',                           // const提示改为警告
    'quotes': ['warn', 'single'],                     // 引号类型改为警告
    'semi': ['warn', 'never'],                        // 分号使用改为警告
    'no-console': 'off' // 完全禁用
  }
}
