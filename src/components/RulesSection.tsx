import type { FormData, Question, RuleAction, RuleOperator } from '../types'
import { useFormStore } from '../store/formStore'

const ACTIONS: { value: RuleAction; label: string }[] = [
  { value: 'show', label: 'Show this question' },
  { value: 'hide', label: 'Hide this question' },
  { value: 'skip_to_step', label: 'Skip to step' },
  { value: 'require', label: 'Require this question' },
]

const OPS: RuleOperator[] = [
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'contains',
]

interface RulesSectionProps {
  form: FormData
  stepIndex: number
  question: Question
}

export function RulesSection({ form, stepIndex, question }: RulesSectionProps) {
  const updateRule = useFormStore((s) => s.updateRule)
  const deleteRule = useFormStore((s) => s.deleteRule)
  const addRule = useFormStore((s) => s.addRule)

  const sourceOptions = form.steps.flatMap((st, si) =>
    st.questions.map((q) => ({
      id: q.id,
      label: `${si + 1}. ${st.title} — ${q.text.slice(0, 40)}${q.text.length > 40 ? '…' : ''}`,
    }))
  )

  return (
    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600">Conditional rules</span>
        <button
          type="button"
          onClick={() => addRule(stepIndex, question.id)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          + Add rule
        </button>
      </div>
      {question.rules.length === 0 ? (
        <p className="text-xs text-slate-500">No rules — question is always visible (unless required).</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {question.rules.map((rule) => (
            <li
              key={rule.id}
              className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm"
            >
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-1">
                  <span className="text-slate-500">Source question</span>
                  <select
                    value={rule.sourceQuestionId}
                    onChange={(e) =>
                      updateRule(stepIndex, question.id, rule.id, {
                        sourceQuestionId: e.target.value,
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    <option value="">Select…</option>
                    {sourceOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-slate-500">Operator</span>
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(stepIndex, question.id, rule.id, {
                        operator: e.target.value as RuleOperator,
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    {OPS.map((op) => (
                      <option key={op} value={op}>
                        {op.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-slate-500">Compare value</span>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(stepIndex, question.id, rule.id, { value: e.target.value })
                    }
                    placeholder="Value"
                    className="rounded border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-slate-500">Action</span>
                  <select
                    value={rule.action}
                    onChange={(e) =>
                      updateRule(stepIndex, question.id, rule.id, {
                        action: e.target.value as RuleAction,
                        targetStepId:
                          e.target.value === 'skip_to_step' ? rule.targetStepId : undefined,
                      })
                    }
                    className="rounded border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    {ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {rule.action === 'skip_to_step' && (
                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-slate-500">Target step</span>
                  <select
                    value={rule.targetStepId ?? ''}
                    onChange={(e) =>
                      updateRule(stepIndex, question.id, rule.id, {
                        targetStepId: e.target.value || undefined,
                      })
                    }
                    className="max-w-md rounded border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    <option value="">Select step…</option>
                    {form.steps.map((st, i) => (
                      <option key={st.id} value={st.id}>
                        {i + 1}. {st.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={() => deleteRule(stepIndex, question.id, rule.id)}
                className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
              >
                Remove rule
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
