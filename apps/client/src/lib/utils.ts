import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 0
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export const getTimeAgo = (date: string) => {
  const now = new Date().getTime()
  const updated = new Date(date).getTime()
  const diffInDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Dnes'
  if (diffInDays === 1) return 'Včera'
  if (diffInDays < 7) return `Před ${diffInDays} dny`
  if (diffInDays < 30) return `Před ${Math.floor(diffInDays / 7)} týdny`
  return `Před ${Math.floor(diffInDays / 30)} měsíci`
}

export const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return ''
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('image')) return '🖼️'
  return '📎'
}
