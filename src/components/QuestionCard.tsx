import type { FormData, Question, QuestionType } from '../types'
import { parseOptionsText } from '../lib/logicEngine'
import { useFormStore } from '../store/formStore'
import { RulesSection } from './RulesSection'

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
]

interface QuestionCardProps {
  form: FormData
  stepIndex: number
  question: Question
}

export function QuestionCard({ form, stepIndex, question }: QuestionCardProps) {
  const updateQuestion = useFormStore((s) => s.updateQuestion)
  const deleteQuestion = useFormStore((s) => s.deleteQuestion)

  const needsOptions =
    question.type === 'dropdown' ||
    question.type === 'checkbox' ||
    question.type === 'yes_no'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <input
          type="text"
          value={question.text}
          onChange={(e) =>
            updateQuestion(stepIndex, question.id, { text: e.target.value })
          }
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          placeholder="Question text"
        />
        <button
          type="button"
          onClick={() => deleteQuestion(stepIndex, question.id)}
          className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Type</span>
          <select
            value={question.type}
            onChange={(e) =>
              updateQuestion(stepIndex, question.id, {
                type: e.target.value as QuestionType,
              })
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6 sm:pt-8">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) =>
              updateQuestion(stepIndex, question.id, { required: e.target.checked })
            }
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700">Required (baseline)</span>
        </label>
      </div>

      {needsOptions && (
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">
            Options (comma-separated)
          </span>
          <textarea
            value={question.options.join(', ')}
            onChange={(e) =>
              updateQuestion(stepIndex, question.id, {
                options: parseOptionsText(e.target.value),
              })
            }
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </label>
      )}

      <RulesSection form={form} stepIndex={stepIndex} question={question} />
    </div>
  )
}
