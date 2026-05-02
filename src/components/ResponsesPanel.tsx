import { useMemo } from 'react'
import type { FormData } from '../types'
import { downloadCsv, submissionsToCsv } from '../lib/csv'

interface ResponsesPanelProps {
  form: FormData
}

export function ResponsesPanel({ form }: ResponsesPanelProps) {
  const rows = form.submissions

  const columns = useMemo(() => {
    const cols: { id: string; label: string }[] = []
    for (const s of form.steps) {
      for (const q of s.questions) {
        cols.push({ id: q.id, label: q.text })
      }
    }
    return cols
  }, [form.steps])

  const exportCsv = () => {
    const csv = submissionsToCsv(form, rows)
    const safe = form.title.replace(/[^\w\d-_]+/g, '_').slice(0, 40)
    downloadCsv(`${safe}_responses.csv`, csv)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">View responses</h2>
          <p className="text-xs text-slate-500">
            {form.submissionCount} submission
            {form.submissionCount === 1 ? '' : 's'} recorded for this form.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-700">
                  Timestamp
                </th>
                {columns.map((c) => (
                  <th
                    key={c.id}
                    className="whitespace-nowrap px-3 py-2 text-left font-medium text-slate-700"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, i) => (
                <tr key={`${row.timestamp}-${i}`} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  {columns.map((c) => (
                    <td key={c.id} className="max-w-xs truncate px-3 py-2 text-slate-700">
                      {formatCell(row.answers[c.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}
