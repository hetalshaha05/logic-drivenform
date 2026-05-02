import { useState } from 'react'
import { useFormStore } from '../store/formStore'
import {
  isQuestionRequired,
  isQuestionVisible,
  stepHasBlockingRequired,
} from '../lib/logicEngine'
import type { AnswerValue } from '../types'
import { QuestionField } from './QuestionField'
import { isFormExpired } from '../lib/formDates'

export function FillFormView() {
  const forms = useFormStore((s) => s.forms)
  const currentFormId = useFormStore((s) => s.currentFormId)
  const form = currentFormId ? forms[currentFormId] : null

  const fillerAnswers = useFormStore((s) => s.fillerAnswers)
  const fillerCurrentStepIndex = useFormStore((s) => s.fillerCurrentStepIndex)
  const fillerPasswordValid = useFormStore((s) => s.fillerPasswordValid)
  const fillerSubmitted = useFormStore((s) => s.fillerSubmitted)

  const applyFillerAnswer = useFormStore((s) => s.applyFillerAnswer)
  const setFillerStepIndex = useFormStore((s) => s.setFillerStepIndex)
  const setFillerPasswordValid = useFormStore((s) => s.setFillerPasswordValid)
  const submitFiller = useFormStore((s) => s.submitFiller)

  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-slate-800 shadow-sm">
          No forms available. Please create a form in Builder mode.
        </p>
      </div>
    )
  }

  const max = form.settings.maxResponses
  const atCapacity = max !== undefined && form.submissionCount >= max
  const expired = isFormExpired(form.settings.expiryDate)
  const needsPassword = Boolean(form.settings.password?.trim())

  if (expired) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-800 shadow-sm">
          Form expired.
        </p>
      </div>
    )
  }

  if (atCapacity) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-slate-800 shadow-sm">
          This form is no longer accepting responses.
        </p>
      </div>
    )
  }

  if (needsPassword && !fillerPasswordValid) {
    return (
      <PasswordScreen
        expected={form.settings.password!.trim()}
        onSuccess={() => setFillerPasswordValid(true)}
      />
    )
  }

  if (fillerSubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-green-900 shadow-sm">
          Thank you — your response has been recorded.
        </p>
      </div>
    )
  }

  const totalSteps = form.steps.length
  const step = form.steps[fillerCurrentStepIndex]
  const isLast = fillerCurrentStepIndex >= totalSteps - 1
  const blocked = step
    ? stepHasBlockingRequired(form, fillerAnswers, fillerCurrentStepIndex)
    : false

  const goNext = () => {
    if (!step || blocked) return
    if (isLast) {
      setSubmitError(null)
      const res = submitFiller()
      if (!res.ok) setSubmitError(res.message)
      return
    }
    setSubmitError(null)
    setFillerStepIndex(fillerCurrentStepIndex + 1)
  }

  const goBack = () => {
    setFillerStepIndex(Math.max(0, fillerCurrentStepIndex - 1))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{form.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Step {Math.min(fillerCurrentStepIndex + 1, totalSteps)} of {totalSteps}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${totalSteps ? ((fillerCurrentStepIndex + 1) / totalSteps) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          key={fillerCurrentStepIndex}
          className="step-transition px-6 py-8 opacity-100"
        >
          {step ? (
            <>
              <h3 className="mb-6 text-base font-medium text-slate-800">{step.title}</h3>
              <div className="flex flex-col gap-6">
                {step.questions.map((q) => {
                  if (!isQuestionVisible(form, fillerAnswers, q.id)) return null
                  const req = isQuestionRequired(form, fillerAnswers, q.id)
                  return (
                    <div key={q.id}>
                      <label className="mb-2 block text-sm font-medium text-slate-800">
                        {q.text}
                        {req && <span className="text-red-500"> *</span>}
                      </label>
                      <QuestionField
                        question={q}
                        value={fillerAnswers[q.id] as AnswerValue | undefined | null}
                        onChange={(v) => applyFillerAnswer(q.id, v as AnswerValue)}
                      />
                    </div>
                  )
                })}
              </div>
              {submitError && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">This step has no content.</p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={fillerCurrentStepIndex === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={blocked}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLast ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PasswordScreen({
  expected,
  onSuccess,
}: {
  expected: string
  onSuccess: () => void
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() === expected) {
      onSuccess()
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-slate-900">Password required</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the access password to continue filling out this form.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder="Password"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">Incorrect password. Please try again.</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </form>
    </div>
  )
}
