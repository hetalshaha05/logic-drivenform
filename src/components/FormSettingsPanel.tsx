import { useFormStore } from '../store/formStore'

export function FormSettingsPanel() {
  const form = useFormStore((s) =>
    s.currentFormId ? s.forms[s.currentFormId] : null
  )
  const updateFormTitle = useFormStore((s) => s.updateFormTitle)
  const updateFormSettings = useFormStore((s) => s.updateFormSettings)

  if (!form) return null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Form settings</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateFormTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Max responses (optional)
          </label>
          <input
            type="number"
            min={1}
            placeholder="Unlimited"
            value={form.settings.maxResponses ?? ''}
            onChange={(e) => {
              const v = e.target.value
              updateFormSettings({
                maxResponses: v === '' ? undefined : Math.max(1, Number(v)),
              })
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Access password (optional)
          </label>
          <input
            type="text"
            autoComplete="off"
            placeholder="No password"
            value={form.settings.password ?? ''}
            onChange={(e) => updateFormSettings({ password: e.target.value || undefined })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Expiry date (optional)
          </label>
          <input
            type="date"
            value={form.settings.expiryDate ?? ''}
            onChange={(e) =>
              updateFormSettings({ expiryDate: e.target.value || undefined })
            }
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>
    </section>
  )
}
