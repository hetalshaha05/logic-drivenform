import type {
  AnswerValue,
  FormData,
  Question,
  QuestionType,
  Rule,
  RuleOperator,
} from '../types'

const questionsById = (form: FormData): Map<string, Question> => {
  const m = new Map<string, Question>()
  for (const s of form.steps) {
    for (const q of s.questions) m.set(q.id, q)
  }
  return m
}

function normalizeAnswer(v: AnswerValue | undefined): string {
  if (v === undefined || v === null) return ''
  if (Array.isArray(v)) return v.slice().sort().join('|')
  return String(v)
}

export function evaluateRule(
  rule: Rule,
  answers: Record<string, AnswerValue | undefined | null>,
  form: FormData
): boolean {
  const byId = questionsById(form)
  const source = byId.get(rule.sourceQuestionId)
  const raw = answers[rule.sourceQuestionId]
  if (!source) return false

  const op: RuleOperator = rule.operator
  const expected = rule.value

  switch (source.type) {
    case 'number': {
      const a = raw === '' || raw === undefined || raw === null ? NaN : Number(raw)
      const b = Number(expected)
      if (op === 'greater_than') return !Number.isNaN(a) && !Number.isNaN(b) && a > b
      if (op === 'less_than') return !Number.isNaN(a) && !Number.isNaN(b) && a < b
      if (op === 'equals') return !Number.isNaN(a) && !Number.isNaN(b) && a === b
      if (op === 'not_equals')
        return !(Number.isNaN(a) && Number.isNaN(b)) && a !== b
      if (op === 'contains') return String(raw ?? '').includes(expected)
      return false
    }
    case 'checkbox': {
      const arr = Array.isArray(raw) ? raw : raw ? [String(raw)] : []
      const exp = expected.split(',').map((s) => s.trim()).filter(Boolean)
      const set = new Set(arr.map(String))
      if (op === 'equals')
        return (
          exp.length === set.size && exp.every((e) => set.has(e))
        )
      if (op === 'not_equals') return !(exp.every((e) => set.has(e)) && exp.length === set.size)
      if (op === 'contains') return arr.some((x) => String(x).includes(expected))
      return false
    }
    default: {
      const a = normalizeAnswer(raw as AnswerValue | undefined)
      const b = expected
      if (op === 'equals') return a === b
      if (op === 'not_equals') return a !== b
      if (op === 'contains') return a.toLowerCase().includes(b.toLowerCase())
      if (op === 'greater_than' || op === 'less_than') {
        const na = Number(a)
        const nb = Number(b)
        if (op === 'greater_than') return !Number.isNaN(na) && !Number.isNaN(nb) && na > nb
        return !Number.isNaN(na) && !Number.isNaN(nb) && na < nb
      }
      return false
    }
  }
}

export function isQuestionVisible(
  form: FormData,
  answers: Record<string, AnswerValue | undefined | null>,
  questionId: string
): boolean {
  const byId = questionsById(form)
  const q = byId.get(questionId)
  if (!q) return false

  const showRules = q.rules.filter((r) => r.action === 'show')
  const hideRules = q.rules.filter((r) => r.action === 'hide')

  let visible = true
  if (showRules.length > 0) {
    visible = showRules.some((r) => evaluateRule(r, answers, form))
  }
  if (hideRules.some((r) => evaluateRule(r, answers, form))) visible = false
  return visible
}

export function isQuestionRequired(
  form: FormData,
  answers: Record<string, AnswerValue | undefined | null>,
  questionId: string
): boolean {
  const byId = questionsById(form)
  const q = byId.get(questionId)
  if (!q) return false
  if (!isQuestionVisible(form, answers, questionId)) return false

  const requireRules = q.rules.filter((r) => r.action === 'require')
  if (requireRules.length > 0) {
    return requireRules.some((r) => evaluateRule(r, answers, form))
  }
  return q.required
}

/** First matching skip rule in step order, then question order, then rule order. */
export function getSkipTargetStepIndex(
  form: FormData,
  answers: Record<string, AnswerValue | undefined | null>
): number | null {
  for (let si = 0; si < form.steps.length; si++) {
    const step = form.steps[si]
    for (const q of step.questions) {
      for (const r of q.rules) {
        if (r.action !== 'skip_to_step' || !r.targetStepId) continue
        if (!evaluateRule(r, answers, form)) continue
        const ti = form.steps.findIndex((s) => s.id === r.targetStepId)
        if (ti >= 0) return ti
      }
    }
  }
  return null
}

export function stepHasBlockingRequired(
  form: FormData,
  answers: Record<string, AnswerValue | undefined | null>,
  stepIndex: number
): boolean {
  const step = form.steps[stepIndex]
  if (!step) return false
  for (const q of step.questions) {
    if (!isQuestionVisible(form, answers, q.id)) continue
    if (!isQuestionRequired(form, answers, q.id)) continue
    const v = answers[q.id]
    if (q.type === 'checkbox') {
      if (!Array.isArray(v) || v.length === 0) return true
    } else if (v === undefined || v === null || v === '') {
      return true
    }
  }
  return false
}

export function buildSubmissionAnswers(
  form: FormData,
  answers: Record<string, AnswerValue | undefined | null>
): Record<string, AnswerValue | null> {
  const out: Record<string, AnswerValue | null> = {}
  for (const s of form.steps) {
    for (const q of s.questions) {
      if (!isQuestionVisible(form, answers, q.id)) {
        out[q.id] = null
        continue
      }
      const v = answers[q.id]
      if (v === undefined || v === null || v === '') {
        out[q.id] = q.type === 'checkbox' ? [] : null
        continue
      }
      out[q.id] = v as AnswerValue
    }
  }
  return out
}

export function parseOptionsText(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function defaultOptionsForType(type: QuestionType): string[] {
  if (type === 'yes_no') return ['Yes', 'No']
  if (type === 'dropdown') return ['Option A', 'Option B']
  if (type === 'checkbox') return ['Choice 1', 'Choice 2']
  return []
}
