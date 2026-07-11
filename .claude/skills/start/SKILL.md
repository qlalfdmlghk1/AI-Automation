---
name: start
description: 작업 시작 — plan.md 작성 → Jira 처리 → GitLab 이슈 → 브랜치 생성 → progress.md 생성
argument-hint: '[Jira 티켓 키] (선택, 없으면 Stage 0에서 직접 입력)'
allowed-tools: Bash(git:*), Bash(glab:*), Bash(which:*), Read, Write, Edit, AskUserQuestion, mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__getVisibleJiraProjects, mcp__atlassian__getJiraIssue, mcp__atlassian__createJiraIssue, mcp__atlassian__editJiraIssue
---

## Context (자동 수집)

- current_branch: !`git branch --show-current`
- git_user: !`git config user.name`
- glab_available: !`which glab`
- glab_username: (Stage 3 진입 시 `glab api user` JSON 응답에서 `.username` 추출)

---

당신은 작업 시작 도우미입니다. plan.md 작성부터 progress.md 생성까지 한 번에 처리합니다.

핵심 원칙: Jira/GitLab을 먼저 부르면 description이 빈약해서 plan.md도 부실해집니다.
그래서 plan.md를 가장 먼저 작성하고, 그 내용을 Jira/GitLab 티켓에 채우는 방향으로 동작합니다.

## 입력

- Jira 티켓 키: `$ARGUMENTS` (선택, 예: `PROJ-123`)
- 키는 **Stage 0**에서 확정합니다. `$ARGUMENTS`로 넘기면 Stage 0 질문을 건너뛰고, 안 넘기면 Stage 0에서 직접 묻습니다.
- 키가 확정되면 **업데이트 모드**(기존 티켓), `없음`이면 **생성 모드**(신규 티켓)로 동작합니다.

---

## 실행 절차

### Stage 0: Jira 티켓 키 확인 (가장 먼저, 강제)

plan.md를 쓰기 전에 **Jira 티켓 키부터 확정**합니다. 기존 티켓이 있으면 그 summary(제목)를 가져와 1-2의 작업 제목 기본값으로 재사용해 입력을 줄입니다.

- `$ARGUMENTS`가 있으면 그 값을 키로 확정하고 이 질문을 **건너뜁니다.**
- 없으면 **평문**으로 한 줄 묻습니다:
  > 📌 기존 Jira 티켓 키가 있으면 입력해주세요. (예: `PROJ-123`) 없으면 `없음`이라고 답해주세요.

응답 분기:

- **키 입력됨** → **업데이트 모드**. 즉시 `getJiraIssue`로 티켓을 조회해 summary를 확보합니다 (cloudId는 `getAccessibleAtlassianResources`로 첫 1회 조회 후 같은 세션 내 재사용).
  - summary 앞에 `[공통]` 등 prefix가 붙어 있으면 제거하고 보관 (Stage 3 제목 규칙과 동일).
  - 확보한 summary는 1-2에서 작업 제목 기본값으로 사용. 조회한 티켓은 Stage 2-A에서 재사용(중복 조회 불필요).
  - 조회 실패(키 오타·인증 만료 등) 시: 키를 다시 확인받고 1회 재시도. 계속 실패하면 `없음`과 동일하게 생성 모드로 폴백할지 사용자에게 확인.
- **`없음`·빈 응답·`skip`** → **생성 모드**. summary 없음. 1-2에서 평문으로 제목을 묻습니다.

---

### Stage 1: plan.md 작성 (사용자 입력 기반)

사용자에게 다음 항목을 순서대로 입력받습니다.

**🚨 입력 방식 (강제) — 하이브리드 방식**

질문 성격에 따라 입력 방식을 다르게 사용합니다:

| 질문 성격              | 입력 방식              | 예시                                               |
| ---------------------- | ---------------------- | -------------------------------------------------- |
| **보기가 명확한 선택** | `AskUserQuestion` 카드 | Type 선택(Feat/Fix/...), "이대로 진행할까요?" 확인 |
| **자유 텍스트 입력**   | **평문 채팅 메시지**   | 작업 제목, 작업 목적, In Scope, URL 등             |

평문(plain text) 질문 = 카드 UI 없이 그냥 채팅 메시지로 짧게 한 줄 물어봄. 사용자는 답을 채팅창에 타이핑.

**`AskUserQuestion` 사용 시 절대 금지:**

- options에 "직접 입력하기", "Other 선택", "수동 작성" 같은 중복/안내 옵션 넣기 — UI가 "Other"를 자동으로 붙이므로 중복이고 사용자가 헷갈림.
- question 문구에 "Other 선택해서 입력" 같은 안내 — 자유 텍스트는 어차피 평문으로 물을 거라 이런 안내 자체가 필요 없음.

**평문 질문 원칙:**

- 한 질문만 한 줄로. 예시 1개 정도 괄호로 같이.
- 한 메시지에 여러 항목을 한꺼번에 나열해서 묻지 않음 (한 항목씩 순차).
- 단, 참고 링크 묶음(Figma/Storybook/API/Confluence/기타)처럼 짧은 URL 입력 여러 개는 한 메시지에 묶어서 한 번에 물어도 됨.

#### 1-1. 작업 유형(Type) 선택

`AskUserQuestion` 1회 호출. options는 다음 4개로 둡니다 (나머지 Chore/Docs는 사용자가 "Other"에 직접 타이핑):

| label    | description                          |
| -------- | ------------------------------------ |
| Feat     | 신규 기능 추가                       |
| Fix      | 버그 수정                            |
| Hotfix   | 운영 긴급 수정 (product 브랜치 기반) |
| Refactor | 리팩터링                             |

> Style, Test는 단독 브랜치 없음 — 다른 작업에 묻어가는 것이 팀 컨벤션이므로 `/start`로 시작하지 않습니다.

#### 1-2. 작업 제목 → 기능명 확정

작업 제목을 확정합니다. **Stage 0에서 summary를 확보했는지**로 분기합니다.

**업데이트 모드 (Stage 0에서 summary 확보됨):** 평문으로 다시 묻지 않고, `AskUserQuestion` 카드 1회로 확인합니다 (보기 선택이라 카드가 자연스러움):

- question: `Jira 제목 "{summary}" 그대로 작업 제목으로 쓸까요?`
- options:
  - `{ label: "이대로 사용", description: "{summary}" }`
  - `{ label: "직접 수정", description: "다음 메시지에서 새 제목 입력" }`

"직접 수정"을 고르면 아래 생성 모드와 동일하게 평문으로 새 제목을 묻습니다.

**생성 모드 (summary 없음):** **평문**으로 작업 제목을 묻습니다.

> 작업 제목을 한 줄로 적어주세요. (예: 로그인 페이지, 이슈 알림 페이지)

**중요**: 사용자가 입력한 **원본 한글 제목은 반드시 보존**합니다 — Jira summary, GitLab 이슈 제목, plan.md 본문 등에 그대로 사용. kebab-case는 폴더명·브랜치명 전용입니다.

응답을 받으면 kebab-case로 변환한 뒤 기능명 확정을 **`AskUserQuestion` 카드**로 확인합니다 (이 단계는 보기 선택이라 카드가 자연스러움):

- question: `기능명 "{변환된 기능명}" 로 진행할까요?`
- options:
  - `{ label: "이대로 진행", description: "{변환된 기능명}" }`
  - `{ label: "다른 이름으로 변경", description: "다음 메시지에서 새 기능명 입력" }`

"다른 이름으로 변경"을 고르면 다시 평문으로 새 기능명을 묻습니다.

같은 기능명 폴더가 이미 존재하는 경우 — `plan.md` 메타 표의 `Jira` 셀 값으로 분기:

- **`Jira` 셀이 채워져 있음** → **후속 이슈 모드**로 전환
  - plan.md는 건드리지 않음 (v1 정책)
  - progress.md만 Stage 5에서 새 이슈 섹션 추가
- **`Jira` 셀이 비어 있음** (Stage 1.5에서 "plan.md 먼저 수정" 후 재진입 / 또는 Stage 2~4 도중 실패로 중단된 케이스) → **재개 모드**로 전환
  - 1-3(목적/범위/접근 방식/참고 자료 입력) 스킵
  - 기존 plan.md 본문을 그대로 사용하고 Stage 1.5부터 다시 진행
  - 일반화: plan.md 메타 표는 "Jira → GitLab Issue → Branch" 순으로 채워지므로, **비어 있는 첫 셀에 해당하는 Stage부터 재개**

#### 1-3. 작업 목적 / 범위 / 접근 방식 / 참고 자료 입력

**모두 평문**으로 한 항목씩 순차적으로 묻습니다. 카드(`AskUserQuestion`) 사용 금지.

질문 순서 및 문구 — **각 질문에 "이게 뭔지" 한 줄 설명 + 예시를 반드시 같이** 적어주세요. 사용자가 항목의 역할을 못 헷갈리게.

1. 🎯 **작업 목적** (필수, 한 줄) — **왜** 이걸 하는지
   > 🎯 작업 목적을 한 줄로 적어주세요. 이 작업이 왜 필요한지 한 문장으로.
   > 예: 사용자에게 이슈 변동 알림을 누락 없이 전달하기 위해
2. 📋 **In Scope** (필수, 형식 자유) — **무엇을** 할 것인지 (체크리스트가 됨)
   > 📋 이번 PR에서 끝낼 작업 내용을 적어주세요. 형식 자유 — 글머리표(`-`/`*`/번호), 줄바꿈, 줄글(문단) 어느 쪽이든 됩니다.
   > 기획 문서를 그대로 붙여넣어도 좋고, "A 페이지 구현하고 B API 연동하고 C 처리까지" 같은 한 문단도 됩니다.
   > → plan.md 작성 시 항목 단위로 자동 분해해서 체크박스로 변환합니다.
3. 📋 **Out of Scope** (선택, 형식 자유) — **안 할 것** 명시
   > 📋 이번 작업에서 빼는 항목이 있나요? (나중에 "왜 빠졌어?" 방지용)
   > 형식 자유 — 글머리표든 줄글이든 OK.
   > 예: 푸시 알림 설정 페이지는 별도 이슈로 분리
   > (없으면 "없음")
4. 🛠️ **접근 방식** (선택) — **어떻게** 할 것인지 (기술 전략)
   > 🛠️ 기술적 접근 방식이 정해진 게 있나요? 구현 전략·재사용할 모듈 등.
   > 예: 기존 NotificationStore 확장 / MSW로 mock 우선
   > (없으면 "없음")
5. 🔗 **참고 자료 묶음** (선택) — 기획·디자인·API 문서 **링크**. **한 메시지에 묶어서** 한 번에 묻습니다:
   > 🔗 참고 자료 링크가 있으면 알려주세요. 없는 항목은 빈 줄로 두세요.
   >
   > - Figma:
   > - Storybook:
   > - API 명세 (BE API 가이드 경로 등):
   > - Confluence (기획 문서):
   > - 기타:

빈 응답·"없음"·"skip"·"건너뛰기"는 해당 항목을 비운 것으로 간주합니다.

#### 1-4. plan.md 생성

`docs/features/{기능명}/plan.md` 경로에 아래 템플릿으로 생성합니다.
**Jira / GitLab Issue / Branch 항목은 빈 상태로 둡니다** (Stage 2~4에서 자동 갱신).

**In Scope / Out of Scope 정규화 (필수):**
사용자가 In Scope·Out of Scope를 줄글(문단)로 적은 경우, plan.md에 그대로 붙여넣지 말고 **항목 단위로 분해해서 체크박스 리스트로 변환**합니다.

- 분해 기준: 문장 단위, 그리고 동사 단위로 끊을 수 있는 작업 단위 (예: "A 페이지 구현하고 B API 연동" → `A 페이지 구현` / `B API 연동` 두 항목)
- 사용자가 이미 글머리표·줄바꿈으로 구분했으면 그 구분을 그대로 사용
- 의역·요약은 최소화 (원문 표현 유지). 단, 체크박스 항목 단위로 자연스럽게 끝나도록 어미만 다듬음
- 분해 결과가 애매하면 그대로 한 항목으로 두고 사용자가 plan.md에서 수동 분리하도록 둡니다.

**섹션 선택 (필수):**

- **UI 작업**(참고 자료에 Figma 링크가 있거나 화면을 구현하는 경우)에만 `🖥️ 화면 단위 분해` / `🎨 디자인 분석` 두 블록을 포함합니다. 비-UI 작업(Refactor·Chore·API only 등)이면 두 블록을 **통째로 생략**합니다.
- `✅ 검증 계획`은 **모든 작업에 포함**합니다. 1-3에서 따로 묻지 않았으므로, plan.md 작성 시 작업 범위·접근 방식에 근거해 초안을 채우고 불명확하면 항목을 `-` 또는 `확인 필요`로 둡니다.

```markdown
# {기능명}

| 항목         | 값                                    |
| ------------ | ------------------------------------- |
| Jira         | (Stage 2 완료 후 자동 주입)           |
| GitLab Issue | (Stage 3 완료 후 자동 주입)           |
| Branch       | (Stage 4 완료 후 자동 주입)           |
| 작성자       | {git_user}                            |
| 작성일       | {YYYY-MM-DD}                          |
| Type         | {Feat/Fix/Hotfix/Refactor/Chore/Docs} |

## 🎯 작업 목적

{사용자 입력값}

## 📋 작업 범위

**포함 (In Scope)**

- [ ] {사용자 입력값 1}
- [ ] {사용자 입력값 2}

**제외 (Out of Scope)**

- {사용자 입력값, 없으면 "(수동 작성)"}

<!-- 후속 이슈 섹션은 여기 아래로 추가 — v2 자동화 예정 -->

<!-- 🖥️ UI 작업(Figma 링크 있음 또는 화면 구현)일 때만 아래 두 블록을 포함. 비-UI 작업이면 통째로 생략. -->

## 🖥️ 화면 단위 분해 (UI 작업 시)

| 화면명   | 요약   | 핵심 인터랙션 |
| -------- | ------ | ------------- |
| {화면명} | {요약} | {핵심 동작}   |

## 🎨 디자인 분석 (UI 작업 시)

- **반응형 분기**: {브레이크포인트별 차이}
- **재사용 컴포넌트**: {기존 컴포넌트 경로 — 위 참고 자료의 Figma/Storybook 기준}
- **신규 컴포넌트**: {새로 만들 것 + 위치}

## 🛠️ 접근 방식

{사용자 입력값 — 비워두면 "[작업 진행하면서 채워주세요]" 그대로}

## 🔗 참고 자료

| 유형       | 링크                                     |
| ---------- | ---------------------------------------- |
| Figma      | {사용자 입력, 없으면 -}                  |
| Storybook  | {사용자 입력, 없으면 -}                  |
| API 명세   | {사용자 입력, 없으면 -}                  |
| Confluence | {사용자 입력 또는 Stage 2에서 자동 추출} |

## ✅ 검증 계획

- 단위/통합 테스트: {대상, 없으면 -}
- 회귀 포인트: {영향 가능 영역}
- 수동 확인: {화면/시나리오}

## 🤔 주요 결정 사항

<!-- /note 또는 수동으로 추가 -->
```

---

### Stage 1.5: 외부 리소스 생성 전 확인 게이트 (필수)

Stage 2~4는 Jira 티켓·GitLab 이슈를 **실제로 생성**하고 브랜치를 **체크아웃**합니다. 한 번 만들어진 이슈는 알림이 이미 나가 되돌리기 비용이 커요. 그래서 plan.md 작성 직후 사용자 확인을 한 번 받습니다.

먼저 plan.md가 작성된 경로를 짧게 안내합니다 (평문):

> 🔍 `docs/features/{기능명}/plan.md` 를 작성했습니다. 한 번 확인해주세요.

그런 다음 `AskUserQuestion` 카드 1회 호출:

- question: `이대로 Jira·GitLab 이슈를 생성하고 브랜치를 만들까요?`
- options:
  - `{ label: "이대로 진행", description: "Stage 2~4 자동 실행" }`
  - `{ label: "plan.md 먼저 수정", description: "수정 완료 후 다시 /start 호출" }`

"plan.md 먼저 수정"을 선택하면 **여기서 즉시 종료**합니다 (Stage 2 진입 금지). 이 시점에 plan.md 메타 표의 `Jira`/`GitLab Issue`/`Branch` 셀은 아직 비어 있는 상태이므로, 사용자가 plan.md를 직접 손본 뒤 동일 인자로 `/start`를 다시 호출하면 1-2의 분기 규칙에 따라 자동으로 **재개 모드**(후속 이슈 모드 아님)로 진입하여 1-3을 스킵하고 Stage 1.5부터 다시 흐릅니다.

"이대로 진행"을 선택한 경우에만 Stage 2로 넘어갑니다.

---

### Stage 2: Jira 처리 (plan.md → Jira description 채움)

Stage 0에서 확정된 모드(업데이트/생성)에 따라 분기합니다.

> **🚨 도구 선택 (강제)** — Jira는 반드시 **Atlassian MCP**로 처리합니다.
> `glab`은 GitLab 전용 CLI라 Jira REST와 무관 — `glab api /rest/api/3/...` 같은 호출 금지.
> 사용 툴:
>
> - `mcp__atlassian__getAccessibleAtlassianResources` — cloudId 조회 (첫 1회만, 결과 재사용)
> - `mcp__atlassian__getVisibleJiraProjects` — projectKey 확인 (필요 시)
> - `mcp__atlassian__getJiraIssue` — 기존 티켓 조회
> - `mcp__atlassian__createJiraIssue` — 신규 티켓 생성
> - `mcp__atlassian__editJiraIssue` — description 갱신
>   MCP 호출 실패 시(인증 만료·네트워크 오류 등)에만 사용자에게 수동 처리 요청.

#### 2-A. 업데이트 모드 (Stage 0에서 키 확정)

Stage 0에서 이미 `getJiraIssue`로 조회한 티켓을 재사용해 `editJiraIssue`로 description을 갱신합니다 (재조회 불필요).

- MCP 호출 실패 시: 키가 맞는지 사용자에게 확인 요청 후 재시도

#### 2-B. 생성 모드 (Stage 0에서 `없음`)

**원본 한글 작업 제목**(1-2에서 입력받은 값)을 Summary로, 작업 목적/범위/참고 자료를 description으로 사용하여 `createJiraIssue`로 신규 티켓을 생성합니다. **kebab-case 기능명은 Summary에 쓰지 않습니다.**

- projectKey는 `.claude/project.config.md`의 `JIRA_PROJECT_KEY`를 **1순위**로 읽습니다. 없으면 세션 메모리(있다면), 그래도 없으면 사용자에게 한 번 묻습니다. 확정값은 같은 세션 내에서 재사용.
- **라벨 적용 (필수 — 누락 주의)**: `.claude/project.config.md`의 `JIRA_LABELS`(쉼표 구분)가 있으면 `createJiraIssue`의 `fields.labels`(문자열 배열)에 반드시 포함합니다. 일부 프로젝트는 **에픽/이슈 라벨을 트리거로 하위 업무를 자동 생성**하는 Jira 자동화를 쓰므로, 라벨이 빠지면 하위 업무를 수동 생성해야 합니다. `JIRA_LABELS`가 비어 있으면 생략하되, 라벨 기반 자동화를 쓰는 프로젝트인지 한 번 확인합니다. **Jira 라벨은 공백을 허용하지 않으므로** 공백이 포함된 값은 하이픈/언더스코어로 바꿔 전달합니다(공백 포함 시 createJiraIssue가 거부).
- 발급된 Jira key는 즉시 plan.md 메타 표에 반영 (2-E).
- MCP 호출 실패 시: 사용자에게 수동 생성 후 키 입력 요청.

#### 2-C. Jira description 작성

plan.md 내용을 다음 형식으로 변환하여 Jira description에 작성합니다:

```markdown
## 목표

- {plan.md의 🎯 작업 목적}

## 작업 항목

- [ ] {plan.md의 📋 In Scope 1}
- [ ] {plan.md의 📋 In Scope 2}

## 구현 참고 자료

| 유형              | 링크                        | 비고 |
| ----------------- | --------------------------- | ---- |
| Figma 디자인 시안 | {plan.md의 Figma 항목}      |      |
| Storybook         | {plan.md의 Storybook 항목}  |      |
| API 명세          | {plan.md의 API 명세 항목}   |      |
| Confluence 문서   | {plan.md의 Confluence 항목} |      |
| 기타              | {plan.md의 기타 항목}       |      |
```

#### 2-D. Confluence 링크 자동 추출

**업데이트 모드(2-A) 한정** — `getJiraIssue` 응답의 description 필드 텍스트에서 `*.atlassian.net/wiki/...` 패턴 URL을 정규식으로 추출해 plan.md 메타 표의 Confluence 항목에 주입합니다.

- 여러 개면 첫 번째만 사용, 중복은 dedupe.
- description이 ADF(JSON) 형식이면 텍스트 노드를 평탄화한 뒤 매칭.
- 매칭 없으면 plan.md는 그대로 둠 (사용자 입력값 우선).
- 생성 모드(2-B)는 description을 우리가 직접 작성하므로 이 단계 스킵.

#### 2-E. plan.md 메타 표 갱신

plan.md의 메타 표 `Jira` 항목을 확정된 Jira 키로 갱신합니다.

---

### Stage 3: GitLab 이슈 생성

plan.md + Jira description 기반으로 GitLab 이슈를 생성합니다.

**이슈 제목:** `[Type] {작업 제목(한글)}`

- 원본 한글 작업 제목(1-2에서 입력받은 값)을 사용합니다. **kebab-case 기능명은 절대 사용하지 않습니다.**
- 업데이트 모드(Stage 0에서 확정된 경우)에는 Stage 0에서 보관한 summary가 1-2 작업 제목 기본값으로 쓰이므로 이를 사용 — 단, 1-2에서 "직접 수정"으로 제목을 바꿨으면 그 입력값을 우선합니다. summary 앞에 `[공통]` 등 다른 prefix가 붙어 있으면 제거 후 `[Type]`만 붙임.
  - 예: Jira summary `[공통] 설정 화면 개발자 테스트 및 수정` → GitLab 제목 `[Refactor] 설정 화면 개발자 테스트 및 수정`

Type 매핑 (제목 prefix + GitLab 라벨):

| Stage 1 Type | 제목 prefix  | GitLab `--label` |
| ------------ | ------------ | ---------------- |
| Feat         | `[Feat]`     | `feat`           |
| Fix          | `[Fix]`      | `fix`            |
| Hotfix       | `[Hotfix]`   | `hotfix`         |
| Refactor     | `[Refactor]` | `refactor`       |
| Chore        | `[Chore]`    | `chore`          |
| Docs         | `[Docs]`     | `docs`           |

**이슈 본문:**

```markdown
## :white_check_mark: 개요

{plan.md의 🎯 작업 목적}

## :label: 이슈 유형

- [x] {Stage 1에서 결정된 Type}

## :pencil: 상세 내용

{plan.md의 작업 목적 + 작업 범위}

## :wrench: 작업 항목

{plan.md의 In Scope를 체크박스로 변환}

## :paperclip: 참고 자료

| 유형       | 링크                                                   |
| ---------- | ------------------------------------------------------ |
| Jira       | {JIRA_SITE_URL}/browse/{Jira키}                        |
| Confluence | {plan.md의 Confluence 항목}                            |
| 기타       | {plan.md의 기타 항목}                                  |
```

glab이 설치된 경우 `glab issue create`로 직접 생성합니다. **`--assignee`와 `--label`은 필수**입니다:

```bash
glab issue create \
  --title "[{Type}] {작업 제목(한글)}" \
  --description "$(cat <<'GLAB_BODY_END'
... 본문 ...
GLAB_BODY_END
)" \
  --assignee {glab_username} \
  --label {Type 매핑 라벨}
```

- `--assignee`: `glab api user`를 실행하여 JSON 응답의 `username` 필드를 추출해서 사용 (작성자 본인). 같은 세션 내에서는 캐시.
- `--label`: 위 Type 매핑 표의 GitLab `--label` 컬럼 값.
- heredoc 토큰: `EOF` 대신 `GLAB_BODY_END` 같은 충돌 가능성 낮은 토큰 사용 (사용자 입력에 `EOF`가 섞일 수 있음).
- 단일 따옴표 heredoc (`<<'GLAB_BODY_END'`) 필수 — 변수/명령 치환 차단.
- `{JIRA_SITE_URL}`: `.claude/project.config.md`의 `JIRA_SITE_URL` 값.

**glab 미설치/미인증 시 (fallback):**

1. 위 이슈 본문을 `docs/features/{기능명}/gitlab-issue-draft.md`로 저장하고, GitLab 웹에서 수동 생성하도록 안내합니다.
2. 사용자가 생성한 **이슈 번호를 입력**받아 plan.md 메타 표를 갱신한 뒤 Stage 4로 계속합니다.
   (이슈 번호는 Stage 4 브랜치명에 필요하므로, 입력 전에는 다음 단계로 진행하지 않습니다.)

생성 후 plan.md의 메타 표 `GitLab Issue` 항목을 갱신합니다.

---

### Stage 3.5: Jira 티켓에 GitLab 이슈 링크 업데이트

GitLab 이슈 생성 완료 후, Jira 티켓 description 하단에 GitLab 이슈 URL을 append 합니다. `editJiraIssue`의 `description` 필드는 **전체 치환**이므로, append를 위해 다음 절차를 반드시 따릅니다:

1. **재조회** — `getJiraIssue`로 최신 description과 포맷을 확인 (`contentFormat: "markdown"`을 명시해 평문 markdown으로 받음).
2. **중복 검사** — 기존 description에 `## 🔗 GitLab 이슈` 섹션이 이미 있는지 확인.
   - **있음**: 해당 섹션 내 URL만 새 값으로 교체 (섹션 중복 추가 금지).
   - **없음**: description 끝에 빈 줄 + 아래 섹션을 append.

   ```markdown
   ## 🔗 GitLab 이슈

   - {GitLab 이슈 URL}
   ```

3. **전송** — 합쳐진 전체 description을 `editJiraIssue`에 `contentFormat: "markdown"`으로 PUT.

> 📌 **포맷 일관성**: 생성 모드(2-B)에서 우리가 `contentFormat: "markdown"`으로 생성한 티켓은 markdown으로 일관 처리됨. 업데이트 모드(2-A)에서 외부에서 만든 티켓이 ADF(JSON)로 저장돼 있더라도 위 절차에서 `contentFormat: "markdown"`을 명시하면 MCP가 양방향 변환을 처리하므로 동일 절차로 동작.
>
> 양방향 변환 실패(예: description에 ADF 전용 노드 — 이미지/패널 — 포함)로 `getJiraIssue` 응답이 비정상이면 append를 건너뛰고 사용자에게 수동 추가 안내.

- MCP 호출 실패 시: 사용자에게 수동 추가 안내 (skip 가능, 다음 단계 진행).

---

### Stage 4: 브랜치 생성 및 체크아웃

**브랜치명 규칙:** `{prefix}/{이슈번호}-{기능명}`

prefix 매핑:

| Stage 1 Type | 브랜치 prefix | base 브랜치                    |
| ------------ | ------------- | ------------------------------ |
| Feat         | `feature/`    | `BASE_BRANCH` (아래 결정 규칙) |
| Fix          | `fix/`        | `BASE_BRANCH` (아래 결정 규칙) |
| **Hotfix**   | `hotfix/`     | **`PRODUCTION_BRANCH` (강제)** |
| Refactor     | `refactor/`   | `BASE_BRANCH` (아래 결정 규칙) |
| Chore        | `chore/`      | `BASE_BRANCH` (아래 결정 규칙) |
| Docs         | `docs/`       | `BASE_BRANCH` (아래 결정 규칙) |

`BASE_BRANCH`(기본 `dev`)·`PRODUCTION_BRANCH`는 `.claude/project.config.md` 값을 따릅니다.

**Hotfix인 경우 — PRODUCTION_BRANCH에서 분기 (강제):**

```bash
git checkout {PRODUCTION_BRANCH}
git pull origin {PRODUCTION_BRANCH}
git checkout -b hotfix/{이슈번호}-{기능명}
```

**그 외 Type — base 브랜치 결정 규칙:**

- 현재 브랜치가 `BASE_BRANCH`와 **같으면** 그대로 분기합니다.
- **다르면** (예: 다른 feature 브랜치 위에서 /start 실행) 묵시적으로 분기하지 않고 `AskUserQuestion`으로 확인합니다:
  - `BASE_BRANCH로 이동 후 분기` — 일반적인 케이스 (checkout + pull 후 분기)
  - `현재 브랜치에서 분기` — 의도적인 스택(stacked) 브랜치인 경우만

"BASE_BRANCH로 이동 후 분기" 선택 시 먼저:

```bash
git checkout {BASE_BRANCH}
git pull origin {BASE_BRANCH}
```

이어서 (공통):

```bash
git checkout -b {prefix}/{이슈번호}-{기능명}
```

생성 후 plan.md의 메타 표 `Branch` 항목을 갱신합니다.

---

### Stage 5: progress.md 생성

`docs/features/{기능명}/progress.md` 경로를 확인합니다.

#### 5-A. 신규 기능 (progress.md 없음)

아래 템플릿으로 신규 생성합니다.

```markdown
# {기능명} — 진행 상황

## 📌 현재 작업

- 이슈: #{이슈번호} ({Type})
- 브랜치: {prefix}/{이슈번호}-{기능명}
- 단계: Phase 1 시작
- 마지막 업데이트: {YYYY-MM-DD HH:MM}

---

## [Issue #{이슈번호}] {기능명}

**Type**: {Feat/Fix/...} | **Jira**: {Stage 2에서 확정된 Jira 키} | **시작**: {YYYY-MM-DD}

### ✅ 완료

- [x] 작업 환경 셋업 (/start 실행)

### 🚧 진행 중

- [ ] {plan.md In Scope 첫 항목}

### 📝 결정 로그

- [{YYYY-MM-DD HH:MM}] /start 실행, 작업 환경 셋업 완료

### 🐛 트러블슈팅

<!-- /note troubleshoot 으로 추가 -->

### ⏭️ 남은 작업

<!-- plan.md In Scope 미완 항목 자동 동기화 -->
```

#### 5-B. 기존 기능 후속 이슈 (progress.md 있음)

`plan.md`는 **건드리지 않습니다** (v1 정책).

`progress.md`는 다음과 같이 갱신합니다:

1. 상단 `## 📌 현재 작업` 블록을 새 이슈 정보로 갱신
2. **기존 이슈 섹션들 위에** 새 이슈 섹션을 삽입

---

### Stage 6: 완료 안내

```
✅ 개발 준비 완료!

📂 세션 문서:    docs/features/{기능명}/plan.md
                docs/features/{기능명}/progress.md
📌 Jira:        {JIRA_SITE_URL}/browse/{Jira키}
🔗 GitLab 이슈:  https://gitlab.com/.../issues/{이슈번호}
🌿 브랜치:      {prefix}/{이슈번호}-{기능명} (체크아웃 완료)

이제 개발을 시작하세요!
커밋할 때 "커밋해줘"라고 하면 자동으로 처리됩니다.
```
