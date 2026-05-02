export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'email'
  | 'yes_no'
  | 'dropdown'
  | 'checkbox'
  | 'date'

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'

export type RuleAction = 'show' | 'hide' | 'skip_to_step' | 'require'

export interface Rule {
  id: string
  sourceQuestionId: string
  operator: RuleOperator
  value: string
  action: RuleAction
  targetStepId?: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  options: string[]
  required: boolean
  rules: Rule[]
}

export interface Step {
  id: string
  title: string
  questions: Question[]
}

export interface FormSettings {
  maxResponses?: number
  password?: string
  expiryDate?: string
}

export interface Submission {
  timestamp: string
  answers: Record<string, AnswerValue | null>
}

export type AnswerValue = string | number | string[]

export interface FormData {
  id: string
  title: string
  settings: FormSettings
  steps: Step[]
  submissions: Submission[]
  submissionCount: number
}
