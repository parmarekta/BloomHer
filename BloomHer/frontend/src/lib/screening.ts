// BloomHer screening scoring utilities
// This file contains scoring logic only.
// Questionnaire wording/options will be kept separate from the scoring engine.

export type ScreeningType = 'EPDS' | 'PHQ-9'

export type ScreeningResponse = number

export interface ScreeningResult {
  type: ScreeningType
  score: number
  maxScore: number
  severity: string
  needsFollowUp: boolean
  selfHarmSignal: boolean
}

export interface ScreeningConfig {
  epdsFollowUpThreshold: number
}

/**
 * BloomHer demo configuration.
 *
 * The EPDS follow-up threshold is configurable so that
 * the screening workflow does not hard-code a clinical
 * interpretation into the application.
 */
export const screeningConfig: ScreeningConfig = {
  epdsFollowUpThreshold: 10,
}

/**
 * Calculate the total score from questionnaire responses.
 *
 * Each response should already be converted to its
 * validated numeric score (normally 0–3).
 */
export function calculateTotalScore(
  responses: ScreeningResponse[],
): number {
  return responses.reduce((total, score) => total + score, 0)
}

/**
 * PHQ-9 severity bands.
 *
 * Score range:
 * 0–27
 */
export function getPHQ9Severity(score: number): string {
  if (score <= 4) {
    return 'Minimal'
  }

  if (score <= 9) {
    return 'Mild'
  }

  if (score <= 14) {
    return 'Moderate'
  }

  if (score <= 19) {
    return 'Moderately severe'
  }

  return 'Severe'
}

/**
 * Determine whether the PHQ-9 result needs follow-up.
 *
 * BloomHer uses the screening result to support
 * follow-up decisions; it does not make a diagnosis.
 */
export function phq9NeedsFollowUp(score: number): boolean {
  return score >= 5
}

/**
 * PHQ-9 item 9 checks for any positive response.
 *
 * Item 9 requires separate handling because it asks about
 * thoughts related to self-harm / suicide.
 *
 * Any score above 0 is treated as a signal requiring
 * immediate safety-oriented handling in the application.
 */
export function hasPHQ9SelfHarmSignal(item9Score: number): boolean {
  return item9Score > 0
}

/**
 * Calculate a PHQ-9 result.
 *
 * Expected:
 * - 9 responses
 * - each response scored 0–3
 * - maximum total = 27
 */
export function calculatePHQ9Result(
  responses: ScreeningResponse[],
): ScreeningResult {
  if (responses.length !== 9) {
    throw new Error('PHQ-9 requires exactly 9 responses.')
  }

  const score = calculateTotalScore(responses)
  const item9Score = responses[8]
  const selfHarmSignal = hasPHQ9SelfHarmSignal(item9Score)

  return {
    type: 'PHQ-9',
    score,
    maxScore: 27,
    severity: getPHQ9Severity(score),
    needsFollowUp: phq9NeedsFollowUp(score) || selfHarmSignal,
    selfHarmSignal,
  }
}

/**
 * Calculate an EPDS result.
 *
 * EPDS contains 10 scored items with a maximum total of 30.
 *
 * Question 10 requires separate safety handling.
 * Any response above 0 is treated as a self-harm signal
 * requiring safety-focused follow-up.
 */
export function calculateEPDSResult(
  responses: ScreeningResponse[],
  threshold: number = screeningConfig.epdsFollowUpThreshold,
): ScreeningResult {
  if (responses.length !== 10) {
    throw new Error('EPDS requires exactly 10 responses.')
  }

  const score = calculateTotalScore(responses)

  // EPDS Question 10 is the self-harm item.
  // Any non-zero response should trigger safety handling.
  const item10Score = responses[9]
  const selfHarmSignal = item10Score > 0

  return {
    type: 'EPDS',
    score,
    maxScore: 30,
    severity:
      score >= threshold
        ? 'Follow-up recommended'
        : 'Below configured threshold',
    needsFollowUp: score >= threshold || selfHarmSignal,
    selfHarmSignal,
  }
}

/**
 * Validate that questionnaire responses are valid 0–3 scores.
 */
export function validateResponses(
  responses: ScreeningResponse[],
): boolean {
  return responses.every(
    (score) =>
      Number.isInteger(score) &&
      score >= 0 &&
      score <= 3,
  )
}

export type ScreeningTrend = 'improving' | 'stable' | 'worsening'

export function getScreeningTrend(
  currentScore: number,
  previousScore: number,
): ScreeningTrend {
  if (currentScore < previousScore) {
    return 'improving'
  }

  if (currentScore > previousScore) {
    return 'worsening'
  }

  return 'stable'
}