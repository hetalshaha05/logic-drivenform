import type { FormData, Submission } from '../types'

function escapeCell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`
  return v
}

function flattenAnswer(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (Array.isArray(val)) return val.join('; ')
  return String(val)
}

export function submissionsToCsv(form: FormData, rows: Submission[]): string {
  const headers: string[] = ['timestamp']
  const questionLabels: { id: string; label: string }[] = []
  for (const s of form.steps) {
    for (const q of s.questions) {
      questionLabels.push({ id: q.id, label: q.text })
      headers.push(q.text)
    }
  }

  const lines = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    const cells = [escapeCell(row.timestamp)]
    for (const { id } of questionLabels) {
      cells.push(escapeCell(flattenAnswer(row.answers[id])))
    }
    lines.push(cells.join(','))
  }
  return lines.join('\r\n')
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
