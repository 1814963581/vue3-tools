<script setup lang="ts">
import { ref, computed } from 'vue'

const markdown = ref(`# Markdown 编辑器

## 文本样式

**粗体文字**、*斜体文字*、***粗斜体文字***、~~删除线~~、\`行内代码\`

## 链接与图片

[访问 GitHub](https://github.com)

## 列表

- 无序列表项一
- 无序列表项二
- 无序列表项三

1. 有序列表项一
2. 有序列表项二
3. 有序列表项三

## 代码块

\`\`\`javascript
function greet(name) {
  return \`你好，\${name}！\`
}
console.log(greet('世界'))
\`\`\`

## 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 28 | 前端开发 |
| 李四 | 32 | 后端开发 |
| 王五 | 25 | 设计师 |

## 引用

> 代码是写给人看的，顺便能在机器上运行。
> —— Harold Abelson

## 任务列表

- [x] 完成项目初始化
- [x] 编写核心功能
- [ ] 编写单元测试
- [ ] 部署上线
`)

const copyStatus = ref(false)

const parseMarkdown = (text: string): string => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">')
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

  const tableRegex = /\|(.+)\|\n\|[\-\s]+\|\n((?:\|.+\|\n?)+)/g
  html = html.replace(tableRegex, (_match, header, body) => {
    const headerCells = header.split('|').filter((c: string) => c.trim())
    const headerHtml = headerCells.map((c: string) => `<th>${c.trim()}</th>`).join('')
    const bodyRows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim())
      return `<tr>${cells.map((c: string) => `<td>${c.trim()}</td>`).join('')}</tr>`
    }).join('')
    return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyRows}</tbody></table>`
  })

  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'
  html = html.replace(/<p><h/g, '<h')
  html = html.replace(/<\/h(\d)><\/p>/g, '</h$1>')
  html = html.replace(/<p><blockquote>/g, '<blockquote>')
  html = html.replace(/<\/blockquote><\/p>/g, '</blockquote>')
  html = html.replace(/<p><ul>/g, '<ul>')
  html = html.replace(/<\/ul><\/p>/g, '</ul>')
  html = html.replace(/<p><pre>/g, '<pre>')
  html = html.replace(/<\/pre><\/p>/g, '</pre>')

  return html
}

const preview = computed(() => parseMarkdown(markdown.value))

const copyMarkdown = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(markdown.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = markdown.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copyStatus.value = true
    setTimeout(() => {
      copyStatus.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const insertText = (before: string, after: string = '') => {
  const textarea = document.querySelector('.editor-input') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = markdown.value.substring(start, end)

  const newText = before + selected + after
  markdown.value = markdown.value.substring(0, start) + newText + markdown.value.substring(end)

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
  }, 0)
}
</script>

<template>
  <div class="markdown-editor">
    <div class="toolbar">
      <button class="tool-btn" @click="insertText('# ', '')" title="标题">H1</button>
      <button class="tool-btn" @click="insertText('## ', '')" title="二级标题">H2</button>
      <button class="tool-btn" @click="insertText('**', '**')" title="粗体"><strong>B</strong></button>
      <button class="tool-btn" @click="insertText('*', '*')" title="斜体"><em>I</em></button>
      <button class="tool-btn" @click="insertText('`', '`')" title="行内代码">`</button>
      <button class="tool-btn" @click="insertText('```\n', '\n```')" title="代码块">&lt;/&gt;</button>
      <button class="tool-btn" @click="insertText('> ', '')" title="引用">&gt;</button>
      <button class="tool-btn" @click="insertText('- ', '')" title="列表">•</button>
      <button class="tool-btn" @click="insertText('[', '](url)')" title="链接">
        <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
      <div class="toolbar-spacer"></div>
      <button :class="['copy-btn', { copied: copyStatus }]" @click="copyMarkdown">
          <span v-if="copyStatus"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 已复制</span>
          <span v-else>
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="2"/>
            </svg>
            复制
          </span>
        </button>
    </div>

    <div class="editor-container">
      <div class="editor-pane">
        <div class="pane-header">
          <span class="pane-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </span>
          <span>编辑</span>
        </div>
        <textarea
          v-model="markdown"
          class="editor-input"
          placeholder="在这里输入 Markdown..."
        ></textarea>
      </div>

      <div class="preview-pane">
        <div class="pane-header">
          <span class="pane-icon">
            <svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          <span>预览</span>
        </div>
        <div class="preview-content" v-html="preview"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inline-svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  display: inline-block;
}

.markdown-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  @include glass-card;
  border-radius: $border-radius-lg;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 8px 12px;
  background: $bg-soft;
  border-radius: $border-radius;
  color: $text-secondary;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    background: rgba($primary, 0.08);
    color: $text-primary;
  }
}

.toolbar-spacer {
  flex: 1;
}

.copy-btn {
  padding: 8px 16px;
  background: $gradient-primary;
  border-radius: $border-radius;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  transition: $transition-bounce;

  &:hover {
    transform: scale(1.05);
  }

  &.copied {
    background: $success;
  }
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.editor-pane, .preview-pane {
  display: flex;
  flex-direction: column;
  @include glass-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: $bg-soft;
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-secondary;
}

.pane-icon {
  font-size: 1rem;
}

.editor-input {
  flex: 1;
  padding: 16px;
  background: transparent;
  color: $text-primary;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9375rem;
  line-height: 1.7;
  resize: none;
  border: none;

  &::placeholder {
    color: $text-muted;
  }
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.7;

  :deep(h1) {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba($primary, 0.08);
  }

  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 24px 0 12px 0;
  }

  :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 20px 0 8px 0;
  }

  :deep(p) {
    margin: 0 0 12px 0;
  }

  :deep(strong) {
    font-weight: 700;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(code) {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875em;
  }

  :deep(pre) {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: $border-radius;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: transparent;
      padding: 0;
    }
  }

  :deep(blockquote) {
    background: rgba(99, 102, 241, 0.1);
    border-left: 3px solid $primary;
    margin: 12px 0;
    padding: 8px 16px;
    border-radius: 0 $border-radius $border-radius 0;
  }

  :deep(ul) {
    margin: 12px 0;
    padding-left: 24px;

    li {
      margin: 4px 0;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;

    th, td {
      padding: 8px 12px;
      border: 1px solid rgba($primary, 0.08);
      text-align: left;
    }

    th {
      background: rgba(0, 0, 0, 0.2);
      font-weight: 600;
    }
  }

  :deep(a) {
    color: $primary;
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}

@include respond-to-down('sm') {
  .editor-container {
    flex-direction: column;
  }
  .editor-pane, .preview-pane {
    min-height: 250px;
  }
  .editor-input {
    font-size: 0.85rem;
    padding: 12px;
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
  .tool-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
  }
}
</style>
