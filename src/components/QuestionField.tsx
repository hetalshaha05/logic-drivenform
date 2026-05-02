import type { AnswerValue, Question } from '../types'

interface QuestionFieldProps {
  question: Question
  value: AnswerValue | undefined | null
  onChange: (v: AnswerValue | undefined | null) => void
  disabled?: boolean
}

export function QuestionField({
  question,
  value,
  onChange,
  disabled,
}: QuestionFieldProps) {
  const base =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-100 disabled:text-slate-500'

  switch (question.type) {
    case 'short_text':
    case 'email':
      return (
        <input
          type={question.type === 'email' ? 'email' : 'text'}
          className={base}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
    case 'long_text':
      return (
        <textarea
          className={`${base} min-h-[100px] resize-y`}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          className={base}
          value={value === undefined || value === null || value === '' ? '' : String(value)}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? undefined : Number(v))
          }}
          disabled={disabled}
        />
      )
    case 'date':
      return (
        <input
          type="date"
          className={base}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
    case 'yes_no':
    case 'dropdown':
      return (
        <div className="flex flex-col gap-2">
          {(question.options.length ? question.options : ['Yes', 'No']).map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
            >
              <input
                type="radio"
                name={question.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-800">{opt}</span>
            </label>
          ))}
        </div>
      )
    case 'checkbox': {
      const arr = Array.isArray(value) ? value.map(String) : []
      const opts = question.options.length ? question.options : ['Choice 1', 'Choice 2']
      return (
        <div className="flex flex-col gap-2">
          {opts.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
            >
              <input
                type="checkbox"
                checked={arr.includes(opt)}
                onChange={(e) => {
                  const next = new Set(arr)
                  if (e.target.checked) next.add(opt)
                  else next.delete(opt)
                  onChange([...next])
                }}
                disabled={disabled}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-800">{opt}</span>
            </label>
          ))}
        </div>
      )
    }
    default:
      return null
  }
}
