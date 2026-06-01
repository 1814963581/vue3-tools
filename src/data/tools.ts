export interface Tool {
  id: number
  iconName: string
  title: string
  description: string
  tags: string[]
  category: string
  component?: string
}

export const tools: Tool[] = [
  {
    id: 1,
    iconName: 'camera',
    title: '证件照制作',
    description: '在线制作各种尺寸证件照，更换背景底色',
    tags: ['照片', '证件'],
    category: '生活工具',
    component: 'PhotoMaker'
  },
  {
    id: 2,
    iconName: 'convert',
    title: '图片格式转换',
    description: 'JPG、PNG、WEBP、BMP 图片格式互转，支持质量调节',
    tags: ['图片', '格式转换'],
    category: '设计工具',
    component: 'ImageConverter'
  },
  {
    id: 3,
    iconName: 'document',
    title: '文档格式转换',
    description: 'PDF 和 Word 文档格式互转工具',
    tags: ['文档', '格式转换'],
    category: '文档工具',
    component: 'DocumentConverter'
  },

  {
    id: 5,
    iconName: 'image',
    title: '图片压缩',
    description: '批量压缩图片，支持多种格式和质量调节',
    tags: ['图片', '优化'],
    category: '设计工具',
    component: 'ImageCompressor'
  },
  {
    id: 6,
    iconName: 'palette',
    title: '颜色转换器',
    description: 'HEX、RGB、HSL 颜色格式快速转换，支持渐变生成',
    tags: ['设计', '颜色'],
    category: '设计工具',
    component: 'ColorConverter'
  },
  {
    id: 7,
    iconName: 'edit',
    title: 'Markdown编辑器',
    description: '实时预览Markdown文档，支持多种主题导出',
    tags: ['写作', '文档'],
    category: '文档工具',
    component: 'MarkdownEditor'
  },
  {
    id: 8,
    iconName: 'lock',
    title: '密码生成器',
    description: '自定义规则生成安全密码，支持批量创建',
    tags: ['安全', '密码'],
    category: '安全工具',
    component: 'PasswordGenerator'
  },
  {
    id: 9,
    iconName: 'file',
    title: 'JSON格式化',
    description: 'JSON数据美化、压缩、验证和类型转换',
    tags: ['开发', '数据'],
    category: '开发工具',
    component: 'JsonFormatter'
  },
  {
    id: 10,
    iconName: 'target',
    title: '正则表达式',
    description: '可视化正则测试器，实时匹配和分组',
    tags: ['开发', '正则'],
    category: '开发工具',
    component: 'RegexTester'
  },
  {
    id: 11,
    iconName: 'clipboard',
    title: '剪贴板历史',
    description: '管理剪贴板记录，快速复制历史内容',
    tags: ['效率', '管理'],
    category: '效率工具',
    component: 'ClipboardHistory'
  },
  {
    id: 12,
    iconName: 'clock',
    title: '倒计时器',
    description: '多功能倒计时和闹钟，支持自定义音效',
    tags: ['时间', '提醒'],
    category: '生活工具',
    component: 'CountdownTimer'
  },
  {
    id: 13,
    iconName: 'ruler',
    title: '单位换算器',
    description: '长度、面积、体积、重量、温度、速度、数据存储等单位换算',
    tags: ['计算', '换算'],
    category: '效率工具',
    component: 'UnitConverter'
  },
  {
    id: 14,
    iconName: 'shield',
    title: 'Base64 编解码',
    description: 'Base64 编码和解码工具，支持中文',
    tags: ['编码', '开发'],
    category: '开发工具',
    component: 'Base64Codec'
  },
  {
    id: 15,
    iconName: 'barChart',
    title: '字数统计',
    description: '实时统计字符数、词数、句数、段落数，估算阅读时间',
    tags: ['文字', '统计'],
    category: '文字工具',
    component: 'WordCounter'
  },
  {
    id: 16,
    iconName: 'base64',
    title: 'Base64 图片工具',
    description: '图片与 Base64 编码互转，支持一键复制和下载',
    tags: ['图片', '编码'],
    category: '开发工具',
    component: 'Base64ImageTool'
  }
]

export const categories = ['全部', ...Array.from(new Set(tools.map(t => t.category)))]