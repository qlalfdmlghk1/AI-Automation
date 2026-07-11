---
name: mr
description: GitLab MR 생성 — glab으로 직접 생성, 미설치 시 설치 권유 → docs/mr/*.md 저장
argument-hint: '[제목 힌트] (optional)'
---

## Context (자동 수집)

- current_branch: !`git branch --show-current`
- git_user: !`git config user.name`
- glab_available: !`which glab`
- project_config: `.claude/project.config.md`가 있으면 먼저 Read하여 GitLab username, reviewer, branch 설정을 확인

---

당신은 GitLab Merge Request 작성 도우미입니다.

## MR 제목 형식

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
- 이슈번호: 본 브랜치가 연결된 GitLab 이슈 번호 (브랜치명에서 추출)

**3) `{제목}`** — 한국어, 동사형으로 종결 (추가 / 수정 / 제거 / 통합 등). 마침표 붙이지 않음. 너무 길면 본문에 상세, 제목은 핵심만.

## 담당자 규칙

- **Assignee**: `.claude/project.config.md`의 `GITLAB_USERNAME`을 우선 사용. 없으면 사용자에게 확인
- **Reviewer**: `.claude/project.config.md`의 `DEFAULT_REVIEWER`를 우선 사용. 없으면 사용자에게 확인
- **검수자**: 프로젝트별 MR 템플릿 또는 `DEFAULT_REVIEWER` 기준으로 작성

## 치명 이슈 (반영 전 필수 해소)

다음 항목은 MR 반영 전 반드시 해소합니다.

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

> 📦 **mr 책임 범위**: 본 skill은 **메타데이터만 수집**합니다 (변경 파일 목록, 커밋 이력 — 모두 작은 출력). 큰 diff 본문은 5단계의 `/review`가 자체적으로 수집·처리하므로 mr이 메인 컨텍스트를 오염시키지 않습니다.

그리고 자동으로 수집합니다:

- `git diff --name-only origin/<대상브랜치>...HEAD` → 변경 파일 목록
- `git log origin/<대상브랜치>...HEAD --oneline` → 커밋 이력

### 1.5단계: CHANGELOG 확인 (루트에 `CHANGELOG.md`가 있을 때만)

Keep a Changelog 를 운영하는 프로젝트라면, MR 생성 전에 이번 변경이 `## [Unreleased]`에 기록됐는지 확인합니다.

- `git diff origin/<대상브랜치>...HEAD --name-only`에 `CHANGELOG.md`가 **없으면**, 커밋 이력을 바탕으로 `[Unreleased]`의 `Added`/`Changed`/`Removed` 초안을 제안하고 사용자 확인 후 추가합니다 (호환성 깨지는 변경은 ⚠️ 표시).
- 이미 갱신돼 있으면 그대로 진행합니다.
- **루트에 `CHANGELOG.md`가 없는 프로젝트는 이 단계를 건너뜁니다** (배포물을 복사한 일반 프로젝트엔 해당 없음).

> 참고: 같은 검사를 PreToolUse 훅 `warn-changelog-on-mr.js`가 `glab mr create` 직전에 한 번 더 경고로 잡습니다(`/mr`를 거치지 않은 수동 생성 대비).

### 2단계: MR 본문 작성

`.gitlab/merge_request_templates/default.md` 템플릿을 기반으로 작성합니다.

자동 추론 항목:

- 커밋 타입 → MR 유형 체크박스
- 커밋 메시지 → 개요, 수정 사항
- 변경 파일 → 영향 범위
- 패키지 변경 여부 → 배포 가이드

누락 정보는 `TBD` 또는 `확인 필요:`로 표시합니다.

**이슈 연결:**

- current_branch에서 이슈 번호 추출 (예: `feature/23-login-page` → `#23`)
- 본문에 `Closes #23` 자동 포함

### 3단계: 사용자 확인

작성된 MR 제목과 본문을 출력하여 확인을 받습니다.
수정 요청이 있으면 반영 후 재확인합니다.

### 4단계: MR 생성

**glab 설치된 경우:**

먼저 현재 브랜치를 원격에 push합니다 (이미 push돼 있어도 멱등):

```bash
git push -u origin HEAD
```

이어서 MR 생성:

```bash
glab mr create \
  --title "[개발반영] MR 제목" \
  --description "$(cat <<'EOF'
MR 본문 내용
EOF
)" \
  --target-branch "dev" \
  --assignee "<author-gitlab-username>" \
  --reviewer "{DEFAULT_REVIEWER}" \
  --remove-source-branch \
  --no-editor
```

생성 완료 후 MR URL을 안내합니다.

**glab 미설치된 경우:**

```
⚠️ glab CLI가 설치되어 있지 않습니다.

glab을 설치하면 MR을 자동으로 생성할 수 있습니다.
→ https://gitlab.com/gitlab-org/cli#installation

설치하시겠습니까?
1. 설치 방법 안내받기
2. 지금은 건너뛰고 MR 본문을 파일로 저장
```

거부 시: `docs/mr/<이슈번호>-<짧은설명>.md` 파일로 저장합니다.

### 5단계: 리뷰 실행 (Agent 툴 기반 페르소나 병렬)

MR이 생성된 상태이므로 리뷰 결과를 `glab mr note`로 바로 코멘트 등록할 수 있습니다.
MR 생성 완료 후 **반드시** 리뷰를 진행합니다:

```
✅ MR 생성 완료: [MR URL]

📋 리뷰를 진행할까요? (MR 코멘트에 자동 등록됩니다)
1. 코드 리뷰 실행 (/review) — 시니어 / 보안 / 아키텍트 / QA 4명 페르소나 병렬 리뷰
2. 건너뛰기 (이미 완료한 경우)
```

`review` skill 호출 시 **리뷰 범위를 명시적으로 패스**합니다 (`/mr` 컨텍스트에서는 항상 origin/대상브랜치 비교가 정답):

```
/review origin/<대상브랜치>...HEAD
```

> 명시 패스를 안 하면 review의 우선순위 기본값(working/staged 우선)이 적용돼 우연히 남은 dirty change가 잘못 잡힐 수 있음.

`/review`는 코디네이터가 메인 컨텍스트에서 Agent 툴로 4 페르소나(시니어/보안/아키텍트/QA) **subagent를 단일 메시지 병렬 호출**하여 합성된 노트 1개를 MR에 등록합니다. 각 페르소나는 자체 subagent context로 격리되어 메인 컨텍스트 오염 없음.

> 보안만 빠르게 다시 보고 싶을 때는 별도로 `/secure-review`를 호출할 수 있습니다 (스탠드얼론, `context: fork` 격리, npm audit 포함).

리뷰가 완료되면 Blocker 항목을 안내합니다:

```
📋 리뷰 완료

Blocker: N건
[Blocker 목록]

Blocker가 있으면 수정 후 재커밋하고 리뷰를 재실행하세요.
없으면 `DEFAULT_REVIEWER`에게 MR 요청하세요.
```
