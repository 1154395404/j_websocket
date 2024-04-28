// .commitlintrc.js
/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
  },
  prompt: {
    // 使用你的别名配置
    alias: { fd: 'docs: fix typos' },
    // 更新 messages 以匹配提供的文本
    messages: {
      type: '请选择提交类型(必填)',
      scope: '请输入文件修改范围(可选)',
      customScope: '请输入文件修改范围(可选)',
      subject: '请简要描述提交(必填)',
      body: '请输入详细描述(可选). Use "|" to break new line:',
      breaking: '列出任何BREAKING CHANGES(可选). Use "|" to break new line:',
      footerPrefixesSelect: '选择此变更关闭的ISSUE类型 (optional):',
      customFooterPrefix: '请输入ISSUES前缀:',
      footer: '请输入要关闭的issue(可选). E.g.: #31, #34:',
      confirmCommit: '确定提交此说明吗？',
    },
    // 更新 types 以匹配提供的设置，并适当调整格式
    types: [
      { value: 'feat', name: '✨ feat:     新功能' },
      { value: 'fix', name: '🐛 fix:      修复bug' },
      { value: 'build', name: '📦️ build:    打包' },
      { value: 'perf', name: '⚡️ perf:     性能优化' },
      { value: 'release', name: '🎉 release:  发布正式版' },
      { value: 'style', name: '💄 style:    代码的样式美化' },
      { value: 'refactor', name: '♻️  refactor: 重构' },
      { value: 'docs', name: '✏️  docs:     文档变更' },
      { value: 'test', name: '✅ test:     测试' },
      { value: 'revert', name: '⏪️ revert:   回退' },
      { value: 'chore', name: '🚀 chore:    构建/工程依赖/工具' },
      {
        value: ':construction_worker: ci',
        name: '👷 ci:       CI related changes',
      },
    ],
    // 应用你的其他设置
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: ['body', 'footer'], // 根据你的需求跳过问题
    issuePrefixes: [
      { value: 'closed', name: 'closed:   ISSUES has been processed' },
    ],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: 72, // 这里与之前配置不同，默认是 Infinity
    maxSubjectLength: 72, // 应用subjectLimit 设置
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
}
