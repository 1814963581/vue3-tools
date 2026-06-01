# 效率工具平台

[![CI/CD](https://github.com/1814963581/vue3-tools/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/1814963581/vue3-tools/actions)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个现代化的在线工具集合平台，基于 Vue 3 + Vite + TypeScript 构建，提供 15 款实用工具，无需安装，开箱即用。

## 在线演示

[在线体验](https://1814963581.github.io/vue3-tools/)

## 工具列表

### 设计工具

| 工具 | 描述 |
|------|------|
| 图片格式转换 | JPG、PNG、WEBP、BMP 图片格式互转，支持质量调节 |
| 图片压缩 | 批量压缩图片，支持多种格式和自定义质量参数 |
| 颜色转换器 | HEX、RGB、HSL 颜色格式快速转换，支持渐变生成 |

### 文档工具

| 工具 | 描述 |
|------|------|
| 文档格式转换 | PDF 与 Word 文档格式互转 |
| Markdown 编辑器 | 实时预览 Markdown 文档，支持多种主题样式导出 |

### 开发工具

| 工具 | 描述 |
|------|------|
| JSON 格式化 | JSON 数据美化、压缩、验证和类型转换 |
| 正则表达式 | 可视化正则测试器，实时匹配和分组高亮 |
| Base64 编解码 | 文本 Base64 编码和解码，支持中文字符 |
| Base64 图片工具 | 图片与 Base64 编码互转，支持一键复制和下载 |

### 效率工具

| 工具 | 描述 |
|------|------|
| 剪贴板历史 | 管理剪贴板记录，快速复制历史内容 |
| 单位换算器 | 长度、面积、体积、重量、温度、速度、数据存储等换算 |

### 生活工具

| 工具 | 描述 |
|------|------|
| 证件照制作 | 在线制作各种尺寸证件照，智能识别并更换背景底色 |
| 倒计时器 | 多功能倒计时和闹钟，支持自定义音效 |

### 安全工具

| 工具 | 描述 |
|------|------|
| 密码生成器 | 自定义规则生成强密码，支持批量创建 |

### 文字工具

| 工具 | 描述 |
|------|------|
| 字数统计 | 实时统计字符数、词数、句数、段落数，估算阅读时间 |

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue 3 (Composition API) | 3.4 |
| 构建工具 | Vite | 5.1 |
| 开发语言 | TypeScript | 5.3 |
| 状态管理 | Pinia | 3.0 |
| 路由 | Vue Router | 4.3 |
| CSS 框架 | Tailwind CSS | 3.4 |
| 样式方案 | SCSS + CSS Variables | - |
| 工具库 | VueUse | 14.2 |
| PDF 处理 | pdfjs-dist + jspdf | 5.7 / 4.2 |
| Word 处理 | mammoth + docx | 1.12 / 9.6 |
| 电子表格 | xlsx | 0.18 |
| 单元测试 | Vitest + @vue/test-utils | 4.1 |
| 代码规范 | ESLint | 8.57 |
| PWA | vite-plugin-pwa | 1.2 |
| CI/CD | GitHub Actions | - |

## 项目结构

```
vue3-tools/
├── .github/workflows/          # GitHub Actions CI/CD 流水线
│   └── ci-cd.yml               # 构建、测试、部署自动化
├── public/                     # 静态资源（不经过构建处理）
│   └── favicon.svg             # 网站图标
├── src/
│   ├── assets/                 # 静态资源目录
│   ├── components/             # 组件层
│   │   ├── common/             # 基础通用组件
│   │   │   ├── AppBackground.vue   # 全局背景装饰
│   │   │   ├── Footer.vue          # 页脚组件
│   │   │   └── Header.vue          # 顶栏导航组件
│   │   ├── home/               # 首页业务组件
│   │   │   ├── HeroSection.vue     # 首页头部区域
│   │   │   ├── ToolCard.vue        # 工具卡片组件
│   │   │   └── ToolsSection.vue    # 工具列表与筛选区域
│   │   ├── icons/              # 图标组件
│   │   │   └── ToolIcons.vue       # 工具图标 SVG 组件
│   │   └── tools/              # 工具组件（16 个工具）
│   │       ├── Base64Codec.vue         # Base64 编解码
│   │       ├── Base64ImageTool.vue     # Base64 图片工具
│   │       ├── ClipboardHistory.vue    # 剪贴板历史
│   │       ├── ColorConverter.vue      # 颜色转换器
│   │       ├── CountdownTimer.vue      # 倒计时器
│   │       ├── DocumentConverter.vue   # 文档格式转换
│   │       ├── ImageCompressor.vue     # 图片压缩
│   │       ├── ImageConverter.vue      # 图片格式转换
│   │       ├── JsonFormatter.vue       # JSON 格式化
│   │       ├── MarkdownEditor.vue      # Markdown 编辑器
│   │       ├── PasswordGenerator.vue   # 密码生成器
│   │       ├── PhotoMaker.vue          # 证件照制作
│   │       ├── RegexTester.vue         # 正则表达式测试
│   │       ├── StressReliever.vue      # 解压小工具
│   │       ├── UnitConverter.vue       # 单位换算器
│   │       └── WordCounter.vue         # 字数统计
│   ├── composables/            # 组合式函数（逻辑层）
│   │   ├── useCopyToClipboard.ts   # 剪贴板操作封装
│   │   ├── useFileUpload.ts        # 文件上传（拖拽与选择）封装
│   │   ├── useKeyboard.ts          # 键盘快捷键封装
│   │   ├── useStorage.ts           # 本地存储封装
│   │   └── useToolError.ts         # 统一错误处理封装
│   ├── config/                 # 应用配置（常量与枚举）
│   │   └── index.ts                # 全局配置常量
│   ├── data/                   # 数据层
│   │   └── tools.ts               # 工具元数据定义
│   ├── router/                 # 路由层
│   │   └── index.ts               # 路由配置与守卫
│   ├── services/               # 服务层
│   │   └── logger.ts              # 结构化日志服务（单例模式）
│   ├── stores/                 # 状态管理层（Pinia）
│   │   └── app.ts                 # 全局应用状态
│   ├── styles/                 # 样式层
│   │   ├── main.scss              # 全局样式入口
│   │   └── variables.scss         # SCSS 变量与响应式 Mixin
│   ├── types/                  # 类型定义层
│   │   └── index.ts               # 公共 TypeScript 接口定义
│   ├── utils/                  # 工具函数层
│   │   ├── color.ts               # 颜色处理工具函数
│   │   └── format.ts              # 格式化工具函数
│   ├── views/                  # 视图层（页面）
│   │   ├── HomeView.vue           # 首页
│   │   └── ToolDetailView.vue     # 工具详情页（动态组件加载）
│   ├── App.vue                 # 根组件
│   ├── env.d.ts                # 环境类型声明
│   └── main.ts                 # 应用入口（全局错误处理初始化）
├── .eslintrc.cjs               # ESLint 配置
├── .gitignore                  # Git 忽略规则
├── index.html                  # HTML 入口
├── package.json                # 项目依赖与脚本
├── package-lock.json           # 依赖版本锁定
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node 环境 TypeScript 配置
├── vite.config.ts              # Vite 构建配置（含 PWA）
└── vitest.config.ts            # Vitest 测试配置
```

## 架构设计

### 分层架构

项目采用清晰的分层架构设计，严格遵循单一职责与关注点分离原则：

```
┌─────────────────────────────────────────────────┐
│               视图层 (views/)                     │
│     页面组件，仅负责 UI 布局与路由级状态管理         │
├─────────────────────────────────────────────────┤
│             组件层 (components/)                  │
│   通用组件 (common/) + 业务组件 (home/) + 工具组件   │
│              (tools/)                            │
├─────────────────────────────────────────────────┤
│          逻辑层 (composables/)                    │
│   可复用业务逻辑：文件上传、剪贴板、存储、错误处理等   │
├─────────────────────────────────────────────────┤
│          状态层 (stores/)                         │
│          Pinia 全局状态管理                       │
├─────────────────────────────────────────────────┤
│      服务层 (services/) + 数据层 (data/)           │
│     日志服务、工具元数据、配置常量                   │
├─────────────────────────────────────────────────┤
│         基础层 (utils/ + types/ + config/)        │
│     纯函数工具 + TypeScript 类型定义 + 全局配置      │
└─────────────────────────────────────────────────┘
```

### 关键设计模式

- **单例模式**：日志服务 `Logger` 全局唯一实例，确保日志输出一致性
- **策略模式**：`useFileUpload` 通过回调参数适配不同工具的文件处理逻辑，5 个文件上传组件共享同一套拖拽/选择基础设施
- **组合式函数**：将跨组件共享逻辑封装为 Composable，实现逻辑复用与关注点分离
- **动态组件加载**：`ToolDetailView` 使用 `import.meta.glob` 实现工具组件的自动发现与按需加载，新增工具无需修改路由

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 `http://localhost:5173` 查看效果。

### 构建

```bash
npm run build
```

该命令会先执行 TypeScript 类型检查（`vue-tsc --noEmit`），通过后再进行 Vite 生产构建。构建产物输出至 `dist/` 目录。

### 预览

```bash
npm run preview
```

### 测试

```bash
# 运行全部测试（单次执行）
npm run test:unit

# 监听模式（开发时使用）
npm run test
```

### 代码检查

```bash
npm run lint
```

## Composable 使用示例

### useFileUpload

文件上传的通用封装，支持拖拽和点击选择两种方式，内置文件类型校验：

```typescript
import { useFileUpload } from '@/composables/useFileUpload'

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    // 自定义文件处理逻辑
    console.log(file.name, file.size)
  })
}

const {
  inputRef,      // 绑定到 <input type="file"> 的 ref
  isDragging,    // 拖拽状态
  selectFiles,   // 触发文件选择对话框
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
} = useFileUpload(handleFiles)
```

### useCopyToClipboard

剪贴板操作封装，提供复制状态反馈：

```typescript
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'

const { copyStatus, copyWithStatus } = useCopyToClipboard()
await copyWithStatus('要复制的文本内容')
// copyStatus.value 为 'success' 表示复制成功，2 秒后自动重置
```

### useStorage

本地存储封装，支持自动序列化与反序列化：

```typescript
import { useLocalStorage } from '@/composables/useStorage'

const theme = useLocalStorage('theme', 'dark')
// theme.value = 'light'  // 自动持久化到 localStorage
```

### useKeyboard

键盘快捷键封装，支持组合键：

```typescript
import { useKeyboardShortcut } from '@/composables/useKeyboard'

useKeyboardShortcut('k', () => {
  console.log('Ctrl+K 被按下')
}, true)
```

### useToolError

统一错误处理封装，自动集成日志系统：

```typescript
import { useToolError } from '@/composables/useToolError'

const { message, set, clear, hasError } = useToolError('MyTool')
set('格式错误', 'JSON 解析失败，请检查输入内容')
// message.value 在模板中显示错误信息，同时自动记录到日志系统
```

## 日志系统

项目内置结构化日志服务，支持四级日志级别，生产环境自动降级以减少噪音：

| 级别 | 生产环境 | 开发环境 | 用途 |
|------|----------|----------|------|
| debug | 静默 | 输出 | 调试信息 |
| info | 静默 | 输出 | 一般信息 |
| warn | 输出 | 输出 | 警告信息 |
| error | 输出 | 输出 | 错误信息 |

全局错误自动捕获覆盖以下场景：

- Vue 应用级错误（`app.config.errorHandler`）
- 路由导航错误（`router.onError`）
- 未捕获的 Promise 拒绝（`unhandledrejection`）
- 窗口级运行时错误（`window.error`）

## PWA 支持

项目配置了完整的 PWA 支持，安装后即可离线使用：

- 离线访问（Service Worker 缓存策略）
- 添加到主屏幕（Web App Manifest）
- 自动更新（`registerType: 'autoUpdate'`）

## CI/CD

通过 GitHub Actions 实现自动化流水线，确保每次提交的质量：

1. **类型检查**：`vue-tsc --noEmit`
2. **代码规范检查**：ESLint
3. **单元测试**：Vitest
4. **生产构建**：Vite build
5. **自动部署**：GitHub Pages（main 分支推送时触发）

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m '添加：某某功能'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 新增工具指南

只需三步即可添加新工具，无需修改路由或框架代码：

1. 在 `src/components/tools/` 下创建工具组件文件（如 `NewTool.vue`）
2. 在 `src/data/tools.ts` 的 `tools` 数组中添加工具元数据，设置 `component` 字段为组件名
3. 系统会通过 `import.meta.glob` 自动发现并加载新工具

## 许可证

[MIT License](LICENSE)