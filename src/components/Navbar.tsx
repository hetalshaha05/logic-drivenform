import { useFormStore } from '../store/formStore'

const tab =
  'rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'

export function Navbar() {
  const mode = useFormStore((s) => s.mode)
  const setMode = useFormStore((s) => s.setMode)

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-left">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Logic-Driven Form Builder
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Build multi-step forms with conditional logic — runs entirely in your browser.
          </p>
        </div>
        <nav className="flex shrink-0 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('builder')}
            className={`${tab} ${
              mode === 'builder'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Form Builder
          </button>
          <button
            type="button"
            onClick={() => setMode('filler')}
            className={`${tab} ${
              mode === 'filler'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Fill Form
          </button>
        </nav>
      </div>
    </header>
  )
}
