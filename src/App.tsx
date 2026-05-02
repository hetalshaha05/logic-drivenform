import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { BuilderView } from './components/BuilderView'
import { FillFormView } from './components/FillFormView'
import { useFormStore } from './store/formStore'

export default function App() {
  const mode = useFormStore((s) => s.mode)

  useEffect(() => {
    const finishHydration = () => {
      useFormStore.getState().bootstrap()
    }
    if (useFormStore.persist.hasHydrated()) {
      finishHydration()
    }
    const unsub = useFormStore.persist.onFinishHydration(finishHydration)
    return unsub
  }, [])

  return (
    <div className="min-h-svh flex flex-col">
      <Navbar />
      <main className="flex-1">
        {mode === 'builder' ? <BuilderView /> : <FillFormView />}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        Logic-Driven Form Builder — stored locally in your browser (localStorage).
      </footer>
    </div>
  )
}
