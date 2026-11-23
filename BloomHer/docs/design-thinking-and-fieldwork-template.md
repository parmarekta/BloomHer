# BloomHer — Design Thinking and Fieldwork Record

> Fill this document only with work your team actually completed. Do not invent participants, interview quotes, survey results, usability scores, or model accuracy.

## 1. Empathise

### Stakeholder groups
- Pregnant and postpartum mothers
- ASHA/community health workers
- Healthcare professionals
- Family caregivers (only if included in the approved research plan)

### Interview log (minimum target: 5 interviews, if required by the course)
| Participant code | Stakeholder type | Date | Consent recorded? | Key need/theme (anonymised) |
|---|---|---|---|---|
| P01 | | | | |
| P02 | | | | |
| P03 | | | | |
| P04 | | | | |
| P05 | | | | |

Do not record names, phone numbers, diagnoses, screening answers, or other identifying health information in this assignment report.

## 2. Define

**Problem statement:** Mothers may need accessible, non-judgmental information and a clear route to human support during pregnancy and after childbirth. Existing informal support may be fragmented.

**Evidence from interviews/survey:** [Insert anonymised themes and counts from actual collected evidence.]

**How might we statement:** How might we make maternal wellbeing information and human follow-up easier to access without presenting software as a substitute for care?

## 3. Ideate

Record alternatives considered, selection criteria, and why the team selected BloomHer:

- Option 1: [Describe]
- Option 2: [Describe]
- Option 3: [Describe]
- Selected concept and rationale: [Describe]

## 4. Prototype

Record the screens/features actually implemented and the changes made after feedback:

| Screen/feature | User need addressed | Prototype status | Change after feedback |
|---|---|---|---|
| Mother wellbeing check-in | | | |
| Screening history | | | |
| AI resource finder | | | |
| ASHA workspace | | | |
| Professional workspace | | | |

## 5. Test

### Survey (minimum target: 30 respondents, if required by the course)
- Actual valid responses: [N]
- Recruitment method: [Describe]
- Consent process: [Describe]
- Questions used: [Attach]
- Results: [Counts/percentages from actual responses]
- Limitations/bias: [Describe]

### Prototype usability test (minimum target: 10 testers, if required by the course)
| Tester code | Task | Completed? | Time (optional) | Issue observed | Suggested improvement |
|---|---|---|---|---|---|
| T01 | Find a relevant resource | | | | |
| T02 | Complete a sample check-in using synthetic data | | | | |
| T03 | Review screening history using synthetic data | | | | |

Add rows only for actual testers. Do not use real screening answers in usability testing.

## 6. AI component evaluation

The included AI model routes non-clinical support requests to resource topics. Its training phrases are synthetic examples. Run `python backend/evaluate_ai.py` from the backend directory and include the resulting report with this limitation stated clearly.

For a stronger evaluation, collect a separate labelled set of non-clinical resource requests with informed consent, remove identifiers, keep it separate from training, and report precision, recall, F1, and a confusion matrix. Do not use this model to classify clinical risk or diagnose mental-health conditions.

## 7. Reflection and next iteration

- What worked: [Evidence]
- What failed or confused users: [Evidence]
- Changes made: [Evidence]
- Remaining limitations: API authorisation, privacy controls, and real-world validation are not complete in this prototype.
