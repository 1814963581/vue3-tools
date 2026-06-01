<script setup lang="ts">
import { ref } from 'vue'
import { useFileUpload } from '@/composables/useFileUpload'
import * as mammoth from 'mammoth'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

interface DocFile {
  file: File
  name: string
  size: number
  type: string
  status: 'pending' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
  downloadUrl?: string
  convertedName?: string
  convertedSize?: number
  targetFormat?: string
}

interface TextSegment {
  text: string
  fontSize: number
  bold: boolean
  italics: boolean
  font: string
  x: number
  y: number
}

const docFiles = ref<DocFile[]>([])

const isPdfFile = (file: File) => {
  return file.type.includes('pdf') || file.name.endsWith('.pdf')
}

const isWordFile = (file: File) => {
  return file.type.includes('word') || file.type.includes('msword') || 
         file.name.endsWith('.docx') || file.name.endsWith('.doc')
}

const getTargetFormat = (file: File) => {
  if (isPdfFile(file)) return 'word'
  if (isWordFile(file)) return 'pdf'
  return ''
}

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    const isValid = isPdfFile(file) || isWordFile(file)
    const targetFormat = getTargetFormat(file)

    if (isValid && targetFormat) {
      docFiles.value.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        targetFormat
      })
    } else {
      docFiles.value.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'error',
        error: '不支持的文件格式',
        progress: 0
      })
    }
  })
}

const { inputRef: docInput, isDragging, selectFiles: selectDocs, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useFileUpload(handleFiles)

const convertDoc = async (doc: DocFile) => {
  doc.status = 'processing'
  doc.progress = 0
  doc.error = undefined

  try {
    const baseName = doc.name.replace(/\.[^.]+$/, '')

    if (isWordFile(doc.file)) {
      await convertWordToPdf(doc, baseName + '.pdf')
    } else if (isPdfFile(doc.file)) {
      await convertPdfToWord(doc, baseName + '.docx')
    }
  } catch (err: any) {
    doc.error = err.message || '转换失败'
    doc.status = 'error'
    doc.progress = 0
  }
}

const convertWordToPdf = async (doc: DocFile, outputName: string) => {
  doc.progress = 30

  const arrayBuffer = await doc.file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  
  doc.progress = 50

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '0'
  container.style.top = '0'
  container.style.zIndex = "-1"
  container.style.width = '794px'
  container.style.padding = '40px'
  container.style.background = '#fff'
  container.style.color = '#333'
  container.style.fontFamily = '"Microsoft YaHei", "PingFang SC", sans-serif'
  container.style.fontSize = '14px'
  container.style.lineHeight = '1.8'
  container.innerHTML = `${result.value}`
  document.body.appendChild(container)

  await new Promise(r => setTimeout(r, 500))
  
  doc.progress = 75

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      pdf.addPage()
      position = heightLeft - imgHeight
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    doc.downloadUrl = url
    doc.convertedName = outputName
    doc.convertedSize = blob.size
    doc.progress = 100
    doc.status = 'done'
  } catch (err: any) {
    throw err
  } finally {
    document.body.removeChild(container)
  }
}

const isBoldFont = (fontName: string): boolean => {
  const boldKeywords = ['bold', 'black', 'heavy', 'extrabold', 'semibold']
  return boldKeywords.some(keyword => fontName.toLowerCase().includes(keyword))
}

const isItalicFont = (fontName: string): boolean => {
  const italicKeywords = ['italic', 'oblique']
  return italicKeywords.some(keyword => fontName.toLowerCase().includes(keyword))
}

const parseFontSize = (transform: number[]): number => {
  if (transform && transform.length >= 4) {
    const scaleX = Math.abs(transform[0])
    const scaleY = Math.abs(transform[3])
    return Math.round(Math.sqrt(scaleX * scaleY) * 2)
  }
  return 20
}

const extractLinks = async (page: any): Promise<{ rect: number[], url: string }[]> => {
  const annotations = await page.getAnnotations()
  return annotations
    .filter((ann: any) => ann.url && ann.rect)
    .map((ann: any) => ({
      rect: ann.rect,
      url: ann.url
    }))
}

const convertPdfToWord = async (doc: DocFile, outputName: string) => {
  doc.progress = 30

  const arrayBuffer = await doc.file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  doc.progress = 50

  const numPages = pdf.numPages
  const allPages: TextSegment[][] = []
  const allLinks: { url: string, text: string }[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    const links = await extractLinks(page)
    
    const segments: TextSegment[] = []
    let currentSegment: TextSegment | null = null

    for (const item of textContent.items) {
      const textItem = item as { fontName?: string; transform?: number[]; str: string; type?: string }
      if (textItem.type !== undefined && textItem.type !== 'text') continue
      
      const isBold = isBoldFont(textItem.fontName || '')
      const isItalic = isItalicFont(textItem.fontName || '')
      const fontSize = parseFontSize(textItem.transform || [])
      const fontName = textItem.fontName || 'Arial'
      const x = textItem.transform?.[4] || 0
      const y = textItem.transform?.[5] || 0

      if (!currentSegment) {
        currentSegment = {
          text: textItem.str,
          fontSize,
          bold: isBold,
          italics: isItalic,
          font: fontName,
          x,
          y
        }
      } else if (
        currentSegment.fontSize === fontSize &&
        currentSegment.bold === isBold &&
        currentSegment.italics === isItalic &&
        currentSegment.font === fontName &&
        Math.abs(currentSegment.y - y) < 2
      ) {
        currentSegment.text += textItem.str
      } else {
        segments.push(currentSegment)
        currentSegment = {
          text: textItem.str,
          fontSize,
          bold: isBold,
          italics: isItalic,
          font: fontName,
          x,
          y
        }
      }
    }

    if (currentSegment) {
      segments.push(currentSegment)
    }

    allPages.push(segments)

    for (const link of links) {
      const linkText = textContent.items
        .filter((item: any) => item.type === 'text')
        .map((item: any) => ({
          x: item.transform?.[4] || 0,
          y: item.transform?.[5] || 0,
          str: item.str
        }))
        .filter(item => 
          item.x >= link.rect[0] && item.x <= link.rect[2] &&
          item.y >= link.rect[1] && item.y <= link.rect[3]
        )
        .map(item => item.str)
        .join('')
      
      if (linkText.trim()) {
        allLinks.push({ url: link.url, text: linkText.trim() })
      }
    }
    
    doc.progress = 50 + Math.round((i / numPages) * 25)
  }

  doc.progress = 80

  const children: Paragraph[] = []
  
  allPages.forEach((pageSegments, pageIndex) => {
    if (pageIndex > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: '', size: 20 })],
        pageBreakBefore: true
      }))
    }

    if (pageSegments.length === 0) return

    const lines: TextSegment[][] = []
    let currentLine: TextSegment[] = []
    let prevY = pageSegments[0].y
    let prevFontSize = pageSegments[0].fontSize

    for (const segment of pageSegments) {
      const yDiff = Math.abs(segment.y - prevY)
      const lineThreshold = Math.max(prevFontSize, segment.fontSize) * 0.6

      if (yDiff > lineThreshold && currentLine.length > 0) {
        lines.push([...currentLine])
        currentLine = []
      }

      currentLine.push(segment)
      prevY = segment.y
      prevFontSize = segment.fontSize
    }

    if (currentLine.length > 0) {
      lines.push(currentLine)
    }

    lines.forEach(line => {
      line.sort((a, b) => a.x - b.x)

      const runs = line.map(segment => {
        let isLink = false
        
        for (const link of allLinks) {
          if (segment.text.trim() && link.text.includes(segment.text.trim())) {
            isLink = true
            break
          }
        }
        
        return new TextRun({
          text: segment.text,
          bold: segment.bold,
          italics: segment.italics,
          size: segment.fontSize,
          font: segment.font,
          color: isLink ? '0000FF' : '000000',
          underline: isLink ? { type: 'single' } : undefined
        })
      })

      children.push(new Paragraph({
        spacing: { after: 0, before: 0, line: 240 },
        children: runs
      }))
    })
  })

  const docxDoc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  })

  const blob = await Packer.toBlob(docxDoc)
  const url = URL.createObjectURL(blob)
  doc.downloadUrl = url
  doc.convertedName = outputName
  doc.convertedSize = blob.size
  doc.progress = 100
  doc.status = 'done'
}

const downloadDoc = (doc: DocFile) => {
  if (!doc.downloadUrl) return
  saveAs(doc.downloadUrl, doc.convertedName || doc.name)
}

const downloadAll = () => {
  docFiles.value.forEach(doc => {
    if (doc.status === 'done') {
      downloadDoc(doc)
    }
  })
}

const convertAll = async () => {
  const pending = docFiles.value.filter(d => d.status === 'pending')
  for (const doc of pending) {
    await convertDoc(doc)
  }
}

const removeDoc = (index: number) => {
  const doc = docFiles.value[index]
  if (doc.downloadUrl) {
    URL.revokeObjectURL(doc.downloadUrl)
  }
  docFiles.value.splice(index, 1)
}

const clearAll = () => {
  docFiles.value.forEach(doc => {
    if (doc.downloadUrl) {
      URL.revokeObjectURL(doc.downloadUrl)
    }
  })
  docFiles.value = []
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const pendingCount = () => docFiles.value.filter(d => d.status === 'pending').length
const doneCount = () => docFiles.value.filter(d => d.status === 'done').length
const getExt = (name: string) => name.split('.').pop()?.toUpperCase()
const getTargetExt = (doc: DocFile) => doc.targetFormat?.toUpperCase() || '?'
const getDocIcon = (type: string, name: string) => {
  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return 'doc'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  return 'file'
}
</script>

<template>
  <div class="document-converter">
    <div class="toolbar">
      <button class="tool-btn primary" @click="selectDocs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        选择文档
      </button>
      <button
        v-if="docFiles.length > 0"
        class="tool-btn"
        @click="clearAll"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        清空
      </button>
      <button
        v-if="docFiles.length > 0 && pendingCount() > 0"
        class="tool-btn accent"
        @click="convertAll"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        转换全部
      </button>
      <button
        v-if="doneCount() > 0"
        class="tool-btn download"
        @click="downloadAll"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        下载全部 ({{ doneCount() }})
      </button>
    </div>

    <div class="notice-banner">
      <span class="notice-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      </span>
      <div class="notice-content">
        <p class="notice-title">转换说明</p>
        <p class="notice-text">
          <strong>自动识别转换方向：</strong><br>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF 文件 → 自动转换为 Word 格式<br>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Word 文件 → 自动转换为 PDF 格式
        </p>
      </div>
    </div>

    <input
      ref="docInput"
      type="file"
      accept=".docx,.doc,.pdf"
      multiple
      class="hidden-input"
      @change="handleFileSelect"
    />

    <div
      v-if="docFiles.length === 0"
      :class="['drop-zone', { dragging: isDragging }]"
      @click="selectDocs"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="drop-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      <p class="drop-text">
        <span class="desktop-only">拖拽文档到此处，或点击选择</span>
        <span class="mobile-only">点击选择文档</span>
      </p>
      <p class="drop-hint">支持 Word (.docx/.doc) 和 PDF 格式互转</p>
      <div class="supported-formats">
        <span class="format-tag">PDF → Word</span>
        <span class="format-tag">Word → PDF</span>
      </div>
    </div>

    <div v-else class="docs-list">
      <div
        v-for="(doc, index) in docFiles"
        :key="index"
        class="doc-card"
        :class="{ done: doc.status === 'done', error: doc.status === 'error', processing: doc.status === 'processing' }"
      >
        <div class="doc-icon">
          <svg v-if="getDocIcon(doc.type, doc.name) === 'pdf'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          <svg v-else-if="getDocIcon(doc.type, doc.name) === 'doc'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </div>

        <div class="doc-info">
          <div class="doc-name" :title="doc.name">{{ doc.name }}</div>
          <div class="doc-meta">
            <span class="doc-size">{{ formatSize(doc.size) }}</span>
            <span class="doc-ext">{{ getExt(doc.name) }}</span>
            <span class="arrow">→</span>
            <span class="target-ext">{{ getTargetExt(doc) }}</span>
          </div>

          <div v-if="doc.status === 'processing'" class="progress-bar">
            <div class="progress-fill" :style="{ width: doc.progress + '%' }"></div>
            <span class="progress-text">{{ doc.progress }}%</span>
          </div>

          <div v-if="doc.status === 'error'" class="error-msg">
            {{ doc.error || '转换失败' }}
          </div>

          <div v-if="doc.status === 'done'" class="success-info">
            <span class="success-badge"><svg class="inline-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> 转换完成</span>
            <span v-if="doc.convertedSize" class="converted-size">
              {{ formatSize(doc.convertedSize!) }}
            </span>
          </div>
        </div>

        <div class="doc-actions">
          <button
            v-if="doc.status === 'pending'"
            class="action-btn convert"
            @click="convertDoc(doc)"
          >
            转换
          </button>
          <button
            v-if="doc.status === 'done'"
            class="action-btn download"
            @click="downloadDoc(doc)"
          >
            下载
          </button>
          <button
            v-if="doc.status === 'error'"
            class="action-btn retry"
            @click="doc.status = 'pending'; doc.error = undefined"
          >
            重试
          </button>
          <button
            class="action-btn remove"
            @click="removeDoc(index)"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-converter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  @include glass-card;
  border-radius: $border-radius-lg;
}

.tool-btn {
  padding: 10px 18px;
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

  &.primary {
    background: $gradient-primary;
    color: white;

    &:hover {
      transform: scale(1.02);
    }
  }

  &.accent {
    background: $gradient-secondary;
    color: white;

    &:hover {
      transform: scale(1.02);
    }
  }

  &.download {
    background: $success;
    color: white;
  }
}

.hidden-input {
  display: none;
}

.notice-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  @include glass-card;
  border-radius: $border-radius-lg;
  border: 1px solid rgba($primary, 0.2);
}

.notice-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4px;
}

.notice-text {
  font-size: 0.8125rem;
  color: $text-secondary;
  line-height: 1.8;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px;
  padding: 40px 20px;
  @include glass-card;
  border-radius: $border-radius-lg;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: $transition-normal;

  &:hover, &.dragging {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &.dragging {
    transform: scale(1.01);
  }
}

.drop-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
  line-height: 1;
}

.drop-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.drop-hint {
  font-size: 0.875rem;
  color: $text-muted;
  margin-bottom: 16px;
}

.supported-formats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.format-tag {
  padding: 4px 12px;
  background: rgba($primary, 0.1);
  border: 1px solid rgba($primary, 0.2);
  border-radius: $border-radius-full;
  font-size: 0.75rem;
  font-weight: 600;
  color: $primary-light;
}

.docs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-card {
  @include glass-card;
  border-radius: $border-radius-lg;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: $transition-normal;

  &.done {
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  &.error {
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  &.processing {
    border: 1px solid rgba($primary, 0.3);
  }
}

.doc-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  color: $text-muted;
  margin-bottom: 8px;
}

.doc-size {
  color: $text-secondary;
}

.doc-ext {
  padding: 2px 8px;
  background: rgba($primary, 0.08);
  border-radius: $border-radius-full;
  font-weight: 600;
}

.arrow {
  color: $text-muted;
}

.target-ext {
  padding: 2px 8px;
  background: rgba($primary, 0.2);
  border-radius: $border-radius-full;
  color: $primary-light;
  font-weight: 600;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba($primary, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-fill {
  height: 100%;
  background: $gradient-primary;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 0.6875rem;
  color: $text-secondary;
  font-weight: 600;
}

.error-msg {
  font-size: 0.8125rem;
  color: #ef4444;
  font-weight: 500;
  margin-top: 4px;
}

.success-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.success-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(34, 197, 94, 0.2);
  color: $success;
  border-radius: $border-radius-full;
  font-size: 0.75rem;
  font-weight: 600;
}

.converted-size {
  font-size: 0.75rem;
  color: $text-secondary;
}

.doc-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 14px;
  border-radius: $border-radius;
  font-size: 0.75rem;
  font-weight: 600;
  transition: $transition-fast;

  &.convert {
    background: $gradient-primary;
    color: white;
  }

  &.download {
    background: rgba(34, 197, 94, 0.2);
    color: $success;
  }

  &.retry {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }

  &.remove {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  &:hover {
    transform: scale(1.03);
  }
}

.mobile-only {
  display: none;
}

@include respond-to-down('sm') {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: inline;
  }
  .drop-zone {
    padding: 24px 16px;
  }
  .supported-formats {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
