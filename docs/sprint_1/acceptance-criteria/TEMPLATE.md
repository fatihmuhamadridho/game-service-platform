# [Feature or Story Name]

> **Document Type :** Acceptance Criteria
> **Status :** [Draft / Final]

## Story

Write one concise user story describing the user or role, the capability they need, and the reason or value. Use the format below and avoid implementation details.

> As a [user or role], I want [capability] so that [benefit or outcome].

## Acceptance Criteria

Write separate, numbered criteria for distinct outcomes or scenarios. Use Given/When/Then to describe the starting context, user action or event, and observable result. Include relevant validation, permissions, and error cases. Each criterion should be clear enough to verify.

### AC-001

> **Given :** [Relevant starting context or precondition]
> **When :** [User action or event]
> **Then :**
>
> 1. [Observable expected result]
> 2. [Additional result, if needed]

## Technical Flow

Describe the main sequence of interactions needed to support the story, in order. Identify the responsible actor or system at each step. Include important decision paths and failure outcomes when they affect acceptance criteria. Keep implementation detail proportional to the purpose of this section.

1. [Actor or system]: [Action or event]
2. [Actor or system]: [Next action or resulting outcome]

## Parameters

Use the project’s agreed estimation rubric. Record the applicable score for each parameter, then show the calculation and resulting size. Define any scale locally if the team does not already have an agreed definition. Do not present illustrative values as assessed values.

> **Weight per Parameter :** 15
> **New Technology :** [Experienced in project (1) / Ever implement (2) / Aware but never implement (3) / Never implement and not aware (4)] E.g Experienced in project
> **Surrounding Involvement :** [0 (1) / 1 (2) / 2 (3) / ≧ 3 (4)] E.g Gen21
> **Technical Flow :** [1-4 sequence (1) / 5-7 sequence (2) / 8-10 sequence (2) / > 10 sequence (3)] E.g 13  
> **Acceptance Criteria :** [1-4 / 5-8 / 9-12 / > 12]
> **Size :** (1 x 15) + (2 x 15) + (3 x 15) + (1 x 15) = 15 + 30 + 45 + 15 = 105 (M)

## Subtask

Break the story into deliverable frontend and backend tasks when applicable. Describe work as an outcome, estimate mandays and story points using the team’s agreed method, and provide totals. Use `N/A` when a discipline has no work; do not duplicate tasks to fill rows.

### Frontend

| Task                   |     Mandays | Story Point |
| ---------------------- | ----------: | ----------: |
| [Frontend deliverable] |  [Estimate] |  [Estimate] |
| **Total**              | **[Total]** | **[Total]** |

### Backend

| Task                  |     Mandays | Story Point |
| --------------------- | ----------: | ----------: |
| [Backend deliverable] |  [Estimate] |  [Estimate] |
| **Total**             | **[Total]** | **[Total]** |

### Summary

> **FE :** [Frontend total story points or N/A]
> **BE :** [Backend total story points or N/A]
> **Size Task :** [Size determined using the agreed sizing rule]

## Sizing Reference

| SIZE | SCORE RANGE | ESTIMATE COMPLETION | STORY POINT |
| ---- | ----------- | ------------------- | ----------- |
| S    | ≦ 100       | < 2 days            | 1-3         |
| M    | 101-200     | 2 – 3 days          | 4-6         |
| L    | 201-250     | > 3 – 5 days        | 7-10        |
| XL   | > 250       | > 5 days            | > 10        |

## Notes

Record clarifications about estimation or sizing rules that are needed to interpret this document. Distinguish confirmed team rules from examples, and cite the rule owner or source where applicable.

1. [Confirmed sizing or calculation rule, with source if available]
   of story, example if size story is S then size task must be also S
2. Story point is the equal from mandays times 2
   of story, example if size story is S then size task must be also S
3. Story point is the equal from mandays times 2
   of story, example if size story is S then size task must be also S
4. Story point is the equal from mandays times 2
   of story, example if size story is S then size task must be also S
5. Story point is the equal from mandays times 2
