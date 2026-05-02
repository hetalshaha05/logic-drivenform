import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AnswerValue, FormData, Question, Rule } from '../types'
import { makeId } from '../lib/ids'
import { createDemoForm, createEmptyForm } from '../lib/demoForm'
import {
  buildSubmissionAnswers,
  defaultOptionsForType,
  getSkipTargetStepIndex,
} from '../lib/logicEngine'

type AppMode = 'builder' | 'filler'

interface FormStoreState {
  forms: Record<string, FormData>
  currentFormId: string | null
  mode: AppMode
  fillerAnswers: Record<string, AnswerValue | undefined | null>
  fillerCurrentStepIndex: number
  fillerPasswordValid: boolean
  fillerSubmitted: boolean
  builderSelectedStepIndex: number
  bootstrap: () => void
  setMode: (mode: AppMode) => void
  setCurrentFormId: (id: string | null) => void
  createNewForm: () => void
  deleteForm: (id: string) => void
  renameForm: (id: string, title: string) => void
  updateFormTitle: (title: string) => void
  updateFormSettings: (patch: Partial<FormData['settings']>) => void
  addStep: () => void
  deleteStep: (stepIndex: number) => void
  renameStep: (stepIndex: number, title: string) => void
  moveStep: (stepIndex: number, dir: -1 | 1) => void
  addQuestion: (stepIndex: number) => void
  updateQuestion: (
    stepIndex: number,
    questionId: string,
    patch: Partial<Question>
  ) => void
  deleteQuestion: (stepIndex: number, questionId: string) => void
  addRule: (stepIndex: number, questionId: string) => void
  updateRule: (
    stepIndex: number,
    questionId: string,
    ruleId: string,
    patch: Partial<Rule>
  ) => void
  deleteRule: (stepIndex: number, questionId: string, ruleId: string) => void
  setBuilderSelectedStepIndex: (i: number) => void
  resetFillerState: () => void
  setFillerAnswer: (questionId: string, value: AnswerValue | undefined | null) => void
  applyFillerAnswer: (questionId: string, value: AnswerValue | undefined | null) => void
  setFillerStepIndex: (i: number) => void
  setFillerPasswordValid: (v: boolean) => void
  setFillerSubmitted: (v: boolean) => void
  submitFiller: () => { ok: true } | { ok: false; message: string }
  patchCurrentForm: (updater: (f: FormData) => FormData) => void
}

function ensureCurrentForm(state: FormStoreState): FormData | null {
  const id = state.currentFormId
  if (!id || !state.forms[id]) return null
  return state.forms[id]
}

export const useFormStore = create<FormStoreState>()(
  persist(
    (set, get) => ({
      forms: {},
      currentFormId: null,
      mode: 'builder',
      fillerAnswers: {},
      fillerCurrentStepIndex: 0,
      fillerPasswordValid: false,
      fillerSubmitted: false,
      builderSelectedStepIndex: 0,

      bootstrap: () => {
        const { forms } = get()
        if (Object.keys(forms).length > 0) return
        const demo = createDemoForm()
        const empty = createEmptyForm()
        set({
          forms: { [demo.id]: demo, [empty.id]: empty },
          currentFormId: demo.id,
          builderSelectedStepIndex: 0,
        })
      },

      setMode: (mode) => {
        if (mode === 'filler') {
          get().resetFillerState()
        }
        set({ mode })
      },

      setCurrentFormId: (id) => {
        const wasFiller = get().mode === 'filler'
        set({
          currentFormId: id,
          builderSelectedStepIndex: 0,
        })
        if (wasFiller) get().resetFillerState()
      },

      patchCurrentForm: (updater) => {
        const cur = get().currentFormId
        if (!cur) return
        const form = get().forms[cur]
        if (!form) return
        const next = updater(structuredClone(form))
        set({
          forms: { ...get().forms, [cur]: next },
        })
      },

      createNewForm: () => {
        const f = createEmptyForm()
        set({
          forms: { ...get().forms, [f.id]: f },
          currentFormId: f.id,
          builderSelectedStepIndex: 0,
        })
      },

      deleteForm: (id) => {
        const forms = { ...get().forms }
        delete forms[id]
        let currentFormId = get().currentFormId
        if (currentFormId === id) {
          const keys = Object.keys(forms)
          currentFormId = keys[0] ?? null
        }
        set({ forms, currentFormId })
      },

      renameForm: (id, title) => {
        if (!get().forms[id]) return
        set({
          forms: {
            ...get().forms,
            [id]: { ...get().forms[id], title },
          },
        })
      },

      updateFormTitle: (title) => {
        get().patchCurrentForm((f) => ({ ...f, title }))
      },

      updateFormSettings: (patch) => {
        get().patchCurrentForm((f) => ({
          ...f,
          settings: { ...f.settings, ...patch },
        }))
      },

      addStep: () => {
        let newLen = 0
        get().patchCurrentForm((f) => {
          const steps = [
            ...f.steps,
            {
              id: makeId('step'),
              title: `Step ${f.steps.length + 1}`,
              questions: [],
            },
          ]
          newLen = steps.length
          return { ...f, steps }
        })
        set({ builderSelectedStepIndex: Math.max(0, newLen - 1) })
      },

      deleteStep: (stepIndex) => {
        let newLen = 0
        get().patchCurrentForm((f) => {
          if (f.steps.length <= 1) {
            newLen = f.steps.length
            return f
          }
          const steps = f.steps.filter((_, i) => i !== stepIndex)
          newLen = steps.length
          return { ...f, steps }
        })
        const idx = get().builderSelectedStepIndex
        set({
          builderSelectedStepIndex: Math.max(0, Math.min(idx, newLen - 1)),
        })
      },

      renameStep: (stepIndex, title) => {
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) => (i === stepIndex ? { ...s, title } : s)),
        }))
      },

      moveStep: (stepIndex, dir) => {
        get().patchCurrentForm((f) => {
          const j = stepIndex + dir
          if (j < 0 || j >= f.steps.length) return f
          const steps = f.steps.slice()
          ;[steps[stepIndex], steps[j]] = [steps[j], steps[stepIndex]]
          return { ...f, steps }
        })
        const nextIdx = stepIndex + dir
        if (get().builderSelectedStepIndex === stepIndex) {
          set({ builderSelectedStepIndex: nextIdx })
        }
      },

      addQuestion: (stepIndex) => {
        const q: Question = {
          id: makeId('q'),
          text: 'New question',
          type: 'short_text',
          options: [],
          required: false,
          rules: [],
        }
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) =>
            i === stepIndex ? { ...s, questions: [...s.questions, q] } : s
          ),
        }))
      },

      updateQuestion: (stepIndex, questionId, patch) => {
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) => {
            if (i !== stepIndex) return s
            return {
              ...s,
              questions: s.questions.map((q) => {
                if (q.id !== questionId) return q
                let next = { ...q, ...patch }
                if (patch.type && patch.type !== q.type) {
                  next = {
                    ...next,
                    options: defaultOptionsForType(patch.type),
                  }
                }
                return next
              }),
            }
          }),
        }))
      },

      deleteQuestion: (stepIndex, questionId) => {
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) =>
            i === stepIndex
              ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
              : s
          ),
        }))
      },

      addRule: (stepIndex, questionId) => {
        get().patchCurrentForm((f) => {
          const allQ = f.steps.flatMap((s) => s.questions)
          const defaultSource =
            allQ.find((q) => q.id !== questionId)?.id ?? allQ[0]?.id ?? ''
          const rule: Rule = {
            id: makeId('rule'),
            sourceQuestionId: defaultSource,
            operator: 'equals',
            value: '',
            action: 'show',
          }
          return {
            ...f,
            steps: f.steps.map((s, i) => {
              if (i !== stepIndex) return s
              return {
                ...s,
                questions: s.questions.map((q) =>
                  q.id === questionId ? { ...q, rules: [...q.rules, rule] } : q
                ),
              }
            }),
          }
        })
      },

      updateRule: (stepIndex, questionId, ruleId, patch) => {
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) => {
            if (i !== stepIndex) return s
            return {
              ...s,
              questions: s.questions.map((q) => {
                if (q.id !== questionId) return q
                return {
                  ...q,
                  rules: q.rules.map((r) =>
                    r.id === ruleId ? { ...r, ...patch } : r
                  ),
                }
              }),
            }
          }),
        }))
      },

      deleteRule: (stepIndex, questionId, ruleId) => {
        get().patchCurrentForm((f) => ({
          ...f,
          steps: f.steps.map((s, i) => {
            if (i !== stepIndex) return s
            return {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId
                  ? { ...q, rules: q.rules.filter((r) => r.id !== ruleId) }
                  : q
              ),
            }
          }),
        }))
      },

      setBuilderSelectedStepIndex: (i) => set({ builderSelectedStepIndex: i }),

      resetFillerState: () =>
        set({
          fillerAnswers: {},
          fillerCurrentStepIndex: 0,
          fillerPasswordValid: false,
          fillerSubmitted: false,
        }),

      setFillerAnswer: (questionId, value) =>
        set((s) => ({
          fillerAnswers: { ...s.fillerAnswers, [questionId]: value },
        })),

      applyFillerAnswer: (questionId, value) => {
        const state = get()
        const form = ensureCurrentForm(state)
        const answers = { ...state.fillerAnswers, [questionId]: value }
        let stepIdx = state.fillerCurrentStepIndex
        if (form) {
          const skipTo = getSkipTargetStepIndex(form, answers)
          if (skipTo !== null) stepIdx = skipTo
        }
        set({
          fillerAnswers: answers,
          fillerCurrentStepIndex: stepIdx,
        })
      },

      setFillerStepIndex: (i) => set({ fillerCurrentStepIndex: i }),

      setFillerPasswordValid: (v) => set({ fillerPasswordValid: v }),

      setFillerSubmitted: (v) => set({ fillerSubmitted: v }),

      submitFiller: () => {
        const state = get()
        const form = ensureCurrentForm(state)
        if (!form)
          return { ok: false as const, message: 'No form selected.' }

        const max = form.settings.maxResponses
        if (max !== undefined && form.submissionCount >= max) {
          return {
            ok: false as const,
            message: 'This form is no longer accepting responses.',
          }
        }

        const answers = buildSubmissionAnswers(form, state.fillerAnswers)
        const submission = {
          timestamp: new Date().toISOString(),
          answers,
        }

        const nextCount = form.submissionCount + 1
        if (max !== undefined && nextCount > max) {
          return {
            ok: false as const,
            message: 'This form is no longer accepting responses.',
          }
        }

        const updated: FormData = {
          ...form,
          submissionCount: nextCount,
          submissions: [...form.submissions, submission],
        }

        set({
          forms: { ...get().forms, [form.id]: updated },
          fillerSubmitted: true,
        })

        return { ok: true as const }
      },
    }),
    {
      name: 'logic-form-builder-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        forms: s.forms,
        currentFormId: s.currentFormId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<FormStoreState>
        return {
          ...current,
          ...p,
          forms: p.forms ?? current.forms,
          currentFormId:
            p.currentFormId !== undefined ? p.currentFormId : current.currentFormId,
        }
      },
    }
  )
)
