---
name: pr
description: GitHub PR(Pull Request) 생성 — gh로 직접 생성, 미설치 시 설치 권유 → docs/pr/*.md 저장. TRIGGER when 사용자가 "PR", "풀리퀘스트", "PR 생성/올려줘/만들어줘", "pull request" 등 PR 관련 요청을 할 때. DO NOT TRIGGER when 단순 git push, 브랜치 확인.
argument-hint: '[제목 힌트] (optional)'
---

## Context (자동 수집)

- current_branch: !`git branch --show-current`
- git_user: !`git config user.name`
- gh_available: !`which gh`
- project_config: `.claude/project.config.md`가 있으면 먼저 Read하여 GitHub username, reviewer, branch 설정을 확인

---

당신은 GitHub Pull Request 작성 도우미입니다.

## PR 제목 형식

```
[{환경반영}] {Type}:#{이슈번호} {제목}
```

예시: `[개발반영] Fix:#35 키워드 조회 전 조기 렌더링 및 dialog 라우팅 버그 수정`

### 구성 요소

**1) 환경반영 prefix** — 반영 대상 브랜치에 따라:

| 대상 브랜치             | prefix       |
| ----------------------- | ------------ |
| `DEFAULT_TARGET_BRANCH` | `[개발반영]` |
| `STAGING_BRANCH`        | `[검증반영]` |
| `PRODUCTION_BRANCH`     | `[상용반영]` |

**2) `{Type}:#{이슈번호}`** — 커밋 메시지 컨벤션과 동일 (commit skill 참조)

- Type: `Feat` / `Fix` / `Hotfix` / `Refactor` / `Chore` / `Style` / `Docs` / `Test`
- 본 브랜치에 여러 Type 커밋이 섞인 경우: **가장 비중·영향이 큰 것** 선택. 애매하면 사용자에게 확인.
- 이슈번호: 본 브랜치가 연결된 GitHub 이슈 번호 (브랜치명에서 추출)

**3) `{제목}`** — 한국어, 동사형으로 종결 (추가 / 수정 / 제거 / 통합 등). 마침표 붙이지 않음. 너무 길면 본문에 상세, 제목은 핵심만.

## 담당자 규칙

- **Assignee**: `.claude/project.config.md`의 `GITHUB_USERNAME`을 우선 사용. 없으면 사용자에게 확인
- **Reviewer**: `.claude/project.config.md`의 `DEFAULT_REVIEWER`를 우선 사용. 없으면 사용자에게 확인
- **검수자**: 프로젝트별 PR 템플릿 또는 `DEFAULT_REVIEWER` 기준으로 작성

## 치명 이슈 (반영 전 필수 해소)

다음 항목은 PR 반영 전 반드시 해소합니다.

- 시큐어리뷰 Blocker 미해결
- 코드리뷰 Blocker 미반영
- 테스트 근거 없이 상용 반영
- 시큐어리뷰 미수행 상태로 상용 반영

---

## 실행 절차

### 1단계: 정보 수집

사용자에게 아래를 확인합니다:

```
1. 반영 대상 브랜치: DEFAULT_TARGET_BRANCH / STAGING_BRANCH / PRODUCTION_BRANCH
2. Jira 티켓 URL:
3. Confluence 문서 URL: (선택)
```

> 📦 **pr 책임 범위**: 본 skill은 **메타데이터만 수집**합니다 (변경 파일 목록, 커밋 이력 — 모두 작은 출력). 큰 diff 본문은 5단계의 `/review`가 자체적으로 수집·처리하므로 pr이 메인 컨텍스트를 오염시키지 않습니다.

그리고 자동으로 수집합니다:

- `git diff --name-only origin/<대상브랜치>...HEAD` → 변경 파일 목록
- `git log origin/<대상브랜치>...HEAD --oneline` → 커밋 이력

### 1.5단계: CHANGELOG 확인 (루트에 `CHANGELOG.md`가 있을 때만)

Keep a Changelog 를 운영하는 프로젝트라면, PR 생성 전에 이번 변경이 `## [Unreleased]`에 기록됐는지 확인합니다.

- `git diff origin/<대상브랜치>...HEAD --name-only`에 `CHANGELOG.md`가 **없으면**, 커밋 이력을 바탕으로 `[Unreleased]`의 `Added`/`Changed`/`Removed` 초안을 제안하고 사용자 확인 후 추가합니다 (호환성 깨지는 변경은 ⚠️ 표시).
- 이미 갱신돼 있으면 그대로 진행합니다.
- **루트에 `CHANGELOG.md`가 없는 프로젝트는 이 단계를 건너뜁니다** (배포물을 복사한 일반 프로젝트엔 해당 없음).

> 참고: 같은 검사를 PreToolUse 훅 `warn-changelog-on-pr.js`가 `gh pr create` 직전에 한 번 더 경고로 잡습니다(`/pr`를 거치지 않은 수동 생성 대비).

### 2단계: PR 본문 작성

`.github/pull_request_template.md` 템플릿을 기반으로 작성합니다.

자동 추론 항목:

- 커밋 타입 → PR 유형 체크박스
- 커밋 메시지 → 개요, 수정 사항
- 변경 파일 → 영향 범위
- 패키지 변경 여부 → 배포 가이드

누락 정보는 `TBD` 또는 `확인 필요:`로 표시합니다.

**이슈 연결:**

- current_branch에서 이슈 번호 추출 (예: `feature/23-login-page` → `#23`)
- 본문에 `Closes #23` 자동 포함

### 3단계: 사용자 확인

작성된 PR 제목과 본문을 출력하여 확인을 받습니다.
수정 요청이 있으면 반영 후 재확인합니다.

### 4단계: PR 생성

**gh 설치된 경우:**

먼저 현재 브랜치를 원격에 push합니다 (이미 push돼 있어도 멱등):

```bash
git push -u origin HEAD
```

이어서 PR 생성:

```bash
gh pr create \
  --title "[개발반영] PR 제목" \
  --body "$(cat <<'EOF'
PR 본문 내용
EOF
)" \
  --base "dev" \
  --head "$(git branch --show-current)" \
  --assignee "<author-github-username>" \
  --reviewer "{DEFAULT_REVIEWER}"
```

생성 완료 후 PR URL을 안내합니다.

**gh 미설치된 경우:**

```
⚠️ gh CLI(GitHub CLI)가 설치되어 있지 않습니다.

gh를 설치하면 PR을 자동으로 생성할 수 있습니다.
→ https://cli.github.com/

설치 방법:
- macOS: brew install gh
- Windows: winget install -e --id GitHub.cli

설치 후 인증: gh auth login --hostname <GITHUB_HOST>
(인증 상태 확인: gh auth status / gh api user)

설치하시겠습니까?
1. 설치 방법 안내받기
2. 지금은 건너뛰고 PR 본문을 파일로 저장
```

거부 시: `docs/pr/<이슈번호>-<짧은설명>.md` 파일로 저장합니다.

### 5단계: 리뷰 실행 (Agent 툴 기반 페르소나 병렬)

PR이 생성된 상태이므로 리뷰 결과를 `gh pr comment`로 바로 코멘트 등록할 수 있습니다.
PR 생성 완료 후 **반드시** 리뷰를 진행합니다. **표준 권장은 `/review-converge`(리뷰 수렴)** 입니다 — 객관 검증(lint/type/test/build) 통과까지 AI가 먼저 수렴시키고 사람은 마지막에 확인합니다:

```
✅ PR 생성 완료: [PR URL]

📋 리뷰를 진행할까요? (PR 코멘트에 자동 등록됩니다)
1. 코드 리뷰 수렴 실행 (/review-converge origin/<대상브랜치>...HEAD) — ⭐ 표준 권장
   리뷰 → 자동 반영(Blocker·보안·검증실패·명백한 오류만) → 검증 → 재리뷰를 수렴까지 반복
2. 단순 리뷰만 실행 (/review origin/<대상브랜치>...HEAD) — 1회성 리뷰/수동 확인용
3. 건너뛰기 (이미 완료한 경우)
```

> **상용 반영(`[상용반영]`) 또는 Hotfix에서는 `/review-converge`를 강하게 권장**합니다. 운영에 바로 나가는 변경은 객관 검증(lint/type/test/build)이 통과한 상태로 사람에게 올라와야 합니다. 단순 `/review`만으로 상용/Hotfix를 넘기지 마세요 (위 "치명 이슈" — 테스트 근거 없이 상용 반영 금지와 연결).

두 skill 모두 호출 시 **리뷰 범위를 명시적으로 패스**합니다 (`/pr` 컨텍스트에서는 항상 origin/대상브랜치 비교가 정답):

```
/review-converge origin/<대상브랜치>...HEAD   # 표준 권장 (수렴 루프)
/review origin/<대상브랜치>...HEAD            # 1회성 리뷰만
```

> `/review-converge`는 내부적으로 매 라운드 `/review`(4 페르소나 합성)를 재사용하므로 리뷰 품질은 동일하고, 거기에 자동 반영 + 객관 검증 + 최대 회차 수렴이 더해집니다. 회차 안에 수렴 못 하면 그 자체가 "사람이 깊게 봐야 하는 신호"로 보고됩니다.

> 명시 패스를 안 하면 review의 우선순위 기본값(working/staged 우선)이 적용돼 우연히 남은 dirty change가 잘못 잡힐 수 있음.

`/review`는 코디네이터가 메인 컨텍스트에서 Agent 툴로 4 페르소나(시니어/보안/아키텍트/QA) **subagent를 단일 메시지 병렬 호출**하여 합성된 노트 1개를 PR에 등록합니다. 각 페르소나는 자체 subagent context로 격리되어 메인 컨텍스트 오염 없음.

> 보안만 빠르게 다시 보고 싶을 때는 별도로 `/secure-review`를 호출할 수 있습니다 (스탠드얼론, `context: fork` 격리, npm audit 포함).

리뷰가 완료되면 Blocker 항목을 안내합니다:

```
📋 리뷰 완료

Blocker: N건
[Blocker 목록]

Blocker가 있으면 수정 후 재커밋하고 리뷰를 재실행하세요.
없으면 `DEFAULT_REVIEWER`에게 PR 요청하세요.
```

### 6단계: 리뷰 후 Jira·GitHub 이슈 동기화 (필수)

PR 생성·리뷰까지 끝났으면, `/start`에서 만들어 둔 **Jira 티켓과 GitHub 이슈를 현재 진척에 맞게 갱신**합니다. 생성만 해두고 방치하면 이슈 보드가 실제 상태와 어긋납니다.

> 이 단계는 **`/pr` 워크플로에서만** 수행합니다. 스탠드얼론 `/review`나 `/review-converge` 내부 라운드에서는 이슈를 건드리지 않습니다(중간 상태로 보드가 흔들리는 것 방지).
>
> 🚨 Jira는 **Atlassian MCP**로 처리합니다(`gh`는 GitHub 전용). cloudId는 `getAccessibleAtlassianResources`로 1회 조회 후 재사용.

**6-1. Jira 상태 전이**

1. Jira 키는 1단계에서 받은 Jira 티켓 URL(또는 GitHub 이슈 본문의 Jira 링크)에서 추출합니다.
2. `getTransitionsForJiraIssue`로 **현재 가능한 전이 목록을 런타임 조회**합니다 (전이 ID는 프로젝트마다 다름 — 하드코딩 금지).
3. 목표 상태는 `.claude/project.config.md`의 `JIRA_REVIEW_TRANSITION`(있으면)을 1순위로 매칭합니다. 없으면 조회된 목록에서 "진행 중 / In Progress / In Review / 리뷰" 류를 후보로 잡아 `AskUserQuestion` 카드로 한 번 확인합니다.
4. `transitionJiraIssue`로 전이합니다. 이미 목표 상태면 건너뜁니다. 전이 실패(권한·워크플로 제약) 시 사용자에게 수동 처리 안내(다음 단계는 계속).

**6-2. 작업 항목 체크 동기화**

이번 PR로 완료된 In Scope 항목을 Jira·GitHub 이슈 본문의 체크박스에 반영합니다 (`- [ ]` → `- [x]`).

- **GitHub 이슈**: `gh issue view <이슈번호> --json body`로 본문을 받아 "작업 항목"의 완료 항목을 `- [x]`로 바꿔 `gh issue edit <이슈번호> --body "..."`로 갱신. (⚠️ GitHub 이슈 본문 필드명은 `description`이 아니라 `body`)
- **Jira**: `getJiraIssue`(`contentFormat:"markdown"`)로 description을 받아 "작업 항목" 체크박스를 동일하게 갱신 후 `editJiraIssue`(`contentFormat:"markdown"`)로 PUT. (전체 치환이므로 받은 본문을 보존한 채 체크 상태만 변경)
- 완료 여부가 불명확한 항목은 **체크하지 않고** 그대로 둡니다(임의 완료 처리 금지). 어떤 항목을 완료로 볼지 애매하면 사용자에게 한 번 확인합니다.

> GitHub 이슈 **종료는 하지 않습니다** — PR 본문의 `Closes #N`이 머지 시 자동 종료하므로, 여기서 수동 close 하면 중복/조기 종료가 됩니다.

**6-3. 결과 안내**

```
🔄 이슈 동기화 완료
- Jira {KEY}: {이전상태} → {새상태}
- 작업 항목 체크: Jira {n}건 / GitHub {m}건 반영
- GitHub 이슈 #{번호}: 작업 항목 갱신 (종료는 머지 시 자동)
```
