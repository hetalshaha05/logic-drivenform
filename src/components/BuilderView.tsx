import { useState } from 'react'
import { useFormStore } from '../store/formStore'
import { FormManager } from './FormManager'
import { FormSettingsPanel } from './FormSettingsPanel'
import { QuestionCard } from './QuestionCard'
import { ResponsesPanel } from './ResponsesPanel'
import { PreviewModal } from './PreviewModal'

export function BuilderView() {
  const form = useFormStore((s) => (s.currentFormId ? s.forms[s.currentFormId] : null))
  const builderSelectedStepIndex = useFormStore((s) => s.builderSelectedStepIndex)
  const setBuilderSelectedStepIndex = useFormStore((s) => s.setBuilderSelectedStepIndex)
  const addStep = useFormStore((s) => s.addStep)
  const deleteStep = useFormStore((s) => s.deleteStep)
  const renameStep = useFormStore((s) => s.renameStep)
  const moveStep = useFormStore((s) => s.moveStep)
  const addQuestion = useFormStore((s) => s.addQuestion)

  const [previewOpen, setPreviewOpen] = useState(false)

  if (!form) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <FormManager />
        <p className="mt-6 text-center text-slate-600">No form selected.</p>
      </div>
    )
  }

  const step = form.steps[builderSelectedStepIndex]
  const canDeleteStep = form.steps.length > 1

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormManager />
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Preview
        </button>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Steps</h2>
            <button
              type="button"
              onClick={() => addStep()}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              + Add step
            </button>
          </div>
          <ol className="flex flex-col gap-2">
            {form.steps.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setBuilderSelectedStepIndex(i)}
                  className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left text-sm transition ${
                    i === builderSelectedStepIndex
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium">
                    {i + 1}. {s.title}
                  </span>
                  <span className="text-xs text-slate-500">{s.questions.length} questions</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="space-y-6">
          <FormSettingsPanel />

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Step editor</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveStep(builderSelectedStepIndex, -1)}
                  disabled={builderSelectedStepIndex === 0}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(builderSelectedStepIndex, 1)}
                  disabled={builderSelectedStepIndex >= form.steps.length - 1}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => canDeleteStep && deleteStep(builderSelectedStepIndex)}
                  disabled={!canDeleteStep}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Delete step
                </button>
              </div>
            </div>

            {step && (
              <>
                <label className="mb-4 block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">
                    Step title
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) =>
                      renameStep(builderSelectedStepIndex, e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>

                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Questions
                  </h3>
                  <button
                    type="button"
                    onClick={() => addQuestion(builderSelectedStepIndex)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Add question
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {step.questions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      form={form}
                      stepIndex={builderSelectedStepIndex}
                      question={q}
                    />
                  ))}
                  {step.questions.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      No questions on this step. Add one or use this step as a closing/thank-you page.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>

          <ResponsesPanel form={form} />
        </div>
      </div>

      {previewOpen && (
        <PreviewModal form={form} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  )
}
