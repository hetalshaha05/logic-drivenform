import { useEffect, useState } from 'react'
import type { AnswerValue, FormData } from '../types'
import {
  getSkipTargetStepIndex,
  isQuestionRequired,
  isQuestionVisible,
  stepHasBlockingRequired,
} from '../lib/logicEngine'
import { QuestionField } from './QuestionField'

interface PreviewModalProps {
  form: FormData
  onClose: () => void
}

export function PreviewModal({ form, onClose }: PreviewModalProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue | undefined | null>>({})
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const totalSteps = form.steps.length
  const step = form.steps[stepIndex]
  const isLast = stepIndex >= totalSteps - 1
  const blocked = step ? stepHasBlockingRequired(form, answers, stepIndex) : false

  const applyAnswer = (id: string, value: AnswerValue | undefined | null) => {
    const next = { ...answers, [id]: value }
    setAnswers(next)
    const skipTo = getSkipTargetStepIndex(form, next)
    if (skipTo !== null) setStepIndex(skipTo)
  }

  const goNext = () => {
    if (!step || blocked) return
    if (isLast) {
      alert('Preview mode — responses are not saved.')
      return
    }
    setStepIndex(stepIndex + 1)
  }

  const goBack = () => setStepIndex(Math.max(0, stepIndex - 1))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 id="preview-title" className="text-lg font-semibold text-slate-900">
              Preview
            </h2>
            <p className="text-xs text-slate-500">Test logic without saving submissions.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{form.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${totalSteps ? ((stepIndex + 1) / totalSteps) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div key={stepIndex} className="step-transition">
            {step ? (
              <>
                <h3 className="mb-4 text-base font-medium text-slate-800">{step.title}</h3>
                <div className="flex flex-col gap-6">
                  {step.questions.map((q) => {
                    if (!isQuestionVisible(form, answers, q.id)) return null
                    const req = isQuestionRequired(form, answers, q.id)
                    return (
                      <div key={q.id}>
                        <label className="mb-2 block text-sm font-medium text-slate-800">
                          {q.text}
                          {req && <span className="text-red-500"> *</span>}
                        </label>
                        <QuestionField
                          question={q}
                          value={answers[q.id] as AnswerValue | undefined | null}
                          onChange={(v) => applyAnswer(q.id, v as AnswerValue)}
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Empty step.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={blocked}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {isLast ? 'Submit (preview)' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
