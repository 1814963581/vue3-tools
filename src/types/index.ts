export interface Tool {
  id: number
  iconName: string
  title: string
  description: string
  tags: string[]
  category: string
  component?: string
}

export interface AppSettings {
  theme: 'dark' | 'light'
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

export interface ImageFile {
  file: File
  preview: string
  name: string
  size: number
  compressed?: Blob
  compressedSize?: number
  status: 'pending' | 'processing' | 'done'
}

export interface DocFile {
  file: File
  name: string
  size: number
  type: 'docx' | 'doc' | 'pdf'
  status: 'pending' | 'processing' | 'done'
}