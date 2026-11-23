import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { SafetyNotice } from '@/components/SafetyNotice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  ScreeningResult,
  ScreeningType,
} from '@/lib/screening'
import { API_BASE_URL } from '@/lib/api'

type Question = {
  question_number: number
  text: string
  options: { text: string; value: number }[]
}

export function MotherCheckInPage() {
  const { user } = useAuth()

  const [screeningType, setScreeningType] = useState<ScreeningType | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)

  useEffect(() => {
    if (!screeningType) return

    const controller = new AbortController()
    const apiType = screeningType === 'PHQ-9' ? 'PHQ9' : 'EPDS'

    async function loadQuestions() {
      setLoadingQuestions(true)
      setQuestionError(null)
      try {
        const response = await fetch(
          `${API_BASE_URL}/screening/${apiType}/questions`,
          { signal: controller.signal },
        )
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.detail || 'Unable to load screening questions.')
        }
        setQuestions(data.questions as Question[])
      } catch (error) {
        if (!controller.signal.aborted) {
          setQuestionError(error instanceof Error ? error.message : 'Unable to load questions.')
          setQuestions([])
        }
      } finally {
        if (!controller.signal.aborted) setLoadingQuestions(false)
      }
    }

    void loadQuestions()
    return () => controller.abort()
  }, [screeningType])

  function selectScreening(type: ScreeningType) {
    setQuestions([])
    setScreeningType(type)
    setAnswers({})
    setResult(null)
  }

  function selectAnswer(questionId: number, score: number) {
    setAnswers((current) => ({
      ...current,
      [questionId]: score,
    }))
  }

async function submitScreening() {
  if (!screeningType) return

  const responses = questions.map(
    (question) => answers[question.question_number],
  )

  if (responses.some((answer) => answer === undefined)) {
    return
  }

  if (!user?.motherId) {
    alert('Mother profile not found for this account.')
    return
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/screening/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mother_id: user.motherId,
          screening_type:
            screeningType === 'PHQ-9'
              ? 'PHQ9'
              : 'EPDS',
          answers: responses.map((answer, index) => ({
            question_number: questions[index].question_number,
            answer_value: answer,
          })),
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)

      throw new Error(
        errorData?.detail ||
          'Failed to submit screening.',
      )
    }

    const data = await response.json()

    const calculated: ScreeningResult = {
      type:
        data.screening_type === 'PHQ9'
          ? 'PHQ-9'
          : 'EPDS',
      score: data.score,
      maxScore: data.max_score,
      severity: data.severity,
      needsFollowUp: data.needs_follow_up,
      selfHarmSignal: data.self_harm_signal,
    }

    setResult(calculated)
  } catch (error) {
    console.error(
      'Screening submission failed:',
      error,
    )

    alert(
      error instanceof Error
        ? error.message
        : 'Failed to submit screening.',
    )
  }
}

  if (result) {
    return (
      <div>
        <PageHeader
          eyebrow="Screening complete"
          title="Your screening result"
          description="This result is a screening signal, not a diagnosis. BloomHer uses it to support timely follow-up and conversations with care teams."
        />

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{result.type}</CardTitle>
            <CardDescription>
              Your responses have been scored automatically.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            <div className="rounded-2xl bg-lavender-soft p-6 text-center">
              <p className="text-sm text-ink-muted">Total score</p>
              <p className="mt-2 font-display text-5xl">
                {result.score}
                <span className="text-2xl text-ink-muted">
                  /{result.maxScore}
                </span>
              </p>
              <p className="mt-2 text-sm font-medium">
                {result.severity}
              </p>
            </div>

            {result.selfHarmSignal && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-semibold text-red-900">
                  Immediate support is important
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-red-800">
                  Your response indicates that a safety-focused follow-up is
                  needed. Please reach out to a trusted person or healthcare
                  professional and seek urgent help if you are in immediate
                  danger.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-soft p-5">
              <h3 className="font-semibold">What happens next?</h3>

              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {result.needsFollowUp
                  ? 'BloomHer recommends a follow-up conversation with an appropriate care team member.'
                  : 'You can continue checking in regularly and use BloomHer resources whenever you need support.'}
              </p>
            </div>

            <SafetyNotice compact />

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setQuestions([])
                  setScreeningType(null)
                  setAnswers({})
                  setResult(null)
                }}
              >
                Start another screening
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = '/mother'
                }}
              >
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!screeningType) {
    return (
      <div>
        <PageHeader
          eyebrow="Mental-health screening"
          title="How would you like to check in?"
          description="Choose a screening questionnaire. Your responses are scored automatically to help guide appropriate follow-up. This is not a diagnostic tool."
        />

        <div className="grid max-w-3xl gap-5 md:grid-cols-2">
          <Card
            className="cursor-pointer transition hover:-translate-y-1 hover:shadow-md"
            onClick={() => selectScreening('EPDS')}
          >
            <CardHeader>
              <CardTitle>EPDS</CardTitle>
              <CardDescription>
                Edinburgh Postnatal Depression Scale
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-relaxed text-ink-muted">
                10-item screening questionnaire commonly used in
                pregnancy and the postpartum period.
              </p>

              <Button className="mt-6 w-full">
                Start EPDS
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition hover:-translate-y-1 hover:shadow-md"
            onClick={() => selectScreening('PHQ-9')}
          >
            <CardHeader>
              <CardTitle>PHQ-9</CardTitle>
              <CardDescription>
                Patient Health Questionnaire-9
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-relaxed text-ink-muted">
                9-item screening questionnaire with an overall
                severity score and dedicated safety handling.
              </p>

              <Button className="mt-6 w-full">
                Start PHQ-9
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow={`${screeningType} screening`}
        title="Take a moment to check in"
        description="Choose the response that best describes your experience. You must answer every question before submitting."
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>
            {screeningType === 'EPDS'
              ? 'Edinburgh Postnatal Depression Scale'
              : 'Patient Health Questionnaire-9'}
          </CardTitle>

          <CardDescription>
            Question {Object.keys(answers).length} of {questions.length}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-8">
          {loadingQuestions && <p className="text-sm text-ink-muted">Loading questions…</p>}
          {questionError && <p role="alert" className="text-sm text-red-700">{questionError}</p>}
          {questions.map((question) => (
            <div
              key={question.question_number}
              className="rounded-2xl border border-border p-5"
            >
              <p className="font-medium leading-relaxed">
                {question.question_number}. {question.text}
              </p>

              <div className="mt-4 grid gap-2">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      answers[question.question_number] === option.value
                        ? 'border-primary bg-lavender-soft'
                        : 'border-border hover:bg-surface-soft'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.question_number}`}
                      checked={answers[question.question_number] === option.value}
                      onChange={() =>
                        selectAnswer(question.question_number, option.value)
                      }
                    />

                    <span className="text-sm">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <SafetyNotice compact />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setQuestions([])
                setScreeningType(null)
                setAnswers({})
              }}
            >
              Back
            </Button>

            <Button
              className="flex-1"
              onClick={submitScreening}
              disabled={loadingQuestions || questions.length === 0 || Object.keys(answers).length !== questions.length}
            >
              Submit screening
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}