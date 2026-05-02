import { useState } from 'react'
import { useFormStore } from '../store/formStore'

export function FormManager() {
  const forms = useFormStore((s) => s.forms)
  const currentFormId = useFormStore((s) => s.currentFormId)
  const setCurrentFormId = useFormStore((s) => s.setCurrentFormId)
  const createNewForm = useFormStore((s) => s.createNewForm)
  const deleteForm = useFormStore((s) => s.deleteForm)
  const renameForm = useFormStore((s) => s.renameForm)

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')

  const list = Object.values(forms).sort((a, b) => a.title.localeCompare(b.title))

  const startRename = (id: string, title: string) => {
    setRenamingId(id)
    setRenameDraft(title)
  }

  const commitRename = () => {
    if (renamingId && renameDraft.trim()) {
      renameForm(renamingId, renameDraft.trim())
    }
    setRenamingId(null)
  }

  const handleDelete = (id: string, title: string) => {
    if (
      !window.confirm(
        `Delete form "${title}"? This cannot be undone and will remove its submissions.`
      )
    ) {
      return
    }
    deleteForm(id)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Form manager</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="form-select" className="mb-1 block text-xs font-medium text-slate-600">
            Active form
          </label>
          <select
            id="form-select"
            value={currentFormId ?? ''}
            onChange={(e) => setCurrentFormId(e.target.value || null)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {list.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => createNewForm()}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            New Form
          </button>
          {currentFormId && (
            <>
              <button
                type="button"
                onClick={() => {
                  const f = forms[currentFormId]
                  if (f) startRename(f.id, f.title)
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => currentFormId && handleDelete(currentFormId, forms[currentFormId]?.title ?? '')}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Form
              </button>
            </>
          )}
        </div>
      </div>

      {renamingId && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <label className="mb-1 block text-xs font-medium text-slate-700">Rename form</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setRenamingId(null)
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commitRename}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setRenamingId(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
