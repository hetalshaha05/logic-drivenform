import type { FormData, Step } from '../types'
import { makeId } from './ids'

export function createEmptyForm(): FormData {
  const id = makeId('form')
  const stepId = makeId('step')
  return {
    id,
    title: 'Untitled Form',
    settings: {},
    steps: [
      {
        id: stepId,
        title: 'Step 1',
        questions: [],
      },
    ],
    submissions: [],
    submissionCount: 0,
  }
}

/** Demo: car ownership branch + skip step 2 when No */
export function createDemoForm(): FormData {
  const formId = makeId('form')
  const s1 = makeId('step')
  const s2 = makeId('step')
  const s3 = makeId('step')
  const s4 = makeId('step')

  const qCar = makeId('q')
  const qModel = makeId('q')
  const qFreq = makeId('q')

  const steps: Step[] = [
    {
      id: s1,
      title: 'Vehicle',
      questions: [
        {
          id: qCar,
          text: 'Do you own a car?',
          type: 'yes_no',
          options: ['Yes', 'No'],
          required: true,
          rules: [
            {
              id: makeId('rule'),
              sourceQuestionId: qCar,
              operator: 'equals',
              value: 'No',
              action: 'skip_to_step',
              targetStepId: s3,
            },
          ],
        },
      ],
    },
    {
      id: s2,
      title: 'Car details',
      questions: [
        {
          id: qModel,
          text: 'What is your car model?',
          type: 'short_text',
          options: [],
          required: false,
          rules: [
            {
              id: makeId('rule'),
              sourceQuestionId: qCar,
              operator: 'equals',
              value: 'Yes',
              action: 'show',
            },
            {
              id: makeId('rule'),
              sourceQuestionId: qCar,
              operator: 'equals',
              value: 'Yes',
              action: 'require',
            },
          ],
        },
      ],
    },
    {
      id: s3,
      title: 'Driving habits',
      questions: [
        {
          id: qFreq,
          text: 'How often do you drive?',
          type: 'dropdown',
          options: ['Daily', 'Weekly', 'Rarely'],
          required: true,
          rules: [],
        },
      ],
    },
    {
      id: s4,
      title: 'Thank you',
      questions: [],
    },
  ]

  return {
    id: formId,
    title: 'Demo: Driving survey',
    settings: {
      maxResponses: 5,
      password: 'demo123',
      expiryDate: '',
    },
    steps,
    submissions: [],
    submissionCount: 0,
  }
}
