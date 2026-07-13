# Changelog

이 저장소(팀 Claude/Codex 표준 설정, `.claude` 배포물 전체)의 버전 이력입니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/), 버전은 [SemVer](https://semver.org/lang/ko/)를 따릅니다.

> **버전 단위**: `.claude/` 배포물 전체(team.md·직무 규칙·스킬·훅·세팅)를 하나의 버전으로 묶습니다.
> 릴리스 시 이 파일의 버전 = `git tag` = `.claude/rules/team.md` 헤더 버전을 **항상 일치**시킵니다.
>
> **운영 주기**: 분기 1회 정기 업데이트(긴급 변경은 PATCH 즉시 반영).
> 변경 성격 → **MAJOR** 규칙 삭제/충돌(호환성 깨짐) · **MINOR** 규칙 추가(하위호환) · **PATCH** 문구 수정.
>
> 정책 기준 문서: [Claude Code 팀 표준 - 배포 & 운영](https://incross-platform.atlassian.net/wiki/spaces/UX/pages/103219310)

## [Unreleased]

> 아직 정식 릴리스 없음. **7월 1일 첫 정기 릴리스** 시 이 구역 전체를 `## [1.0.0] - 2026-07-01`로 cut하고 `git tag v1.0.0` + `rules/team.md` 헤더 버전을 일치시킵니다.

### Added

- 팀 Claude Code 표준 하네스 최초 셋업
  - `rules/team.md` — Team Claude 공통 작업 원칙
  - `rules/project.md`, `rules/api-guide-reference.md` — 프로젝트/도메인 규칙
  - `rules/fe/` — vue3-typescript · vue2-javascript · angularjs-legacy · publishing-design-system 스택별 FE 컨벤션
  - `skills/` — start · commit · mr · review · secure-review · note · e2e · organize-imports · tech-doc
  - `hooks/` — PreToolUse/PostToolUse 보호 훅 (check-commit-typecheck · notify-sensitive-edit · warn-e2e-antipattern · format-edited)
  - `scripts/pilot-core-metrics.mjs` — 파일럿 코어 메트릭 수집
  - `hooks/pilot-session-metrics.mjs` — 파일럿 세션 메트릭(Stop·SessionEnd) 수집 훅: 세션별 토큰/메시지 사용량 스냅샷을 `docs/pilot-metrics/sessions/`에 기록(관찰 전용). `settings.example.json`의 Stop·SessionEnd에 등록
  - `settings.example.json`, `project.config.example.md` — 권한/hook 및 프로젝트 설정 예시
- 프로젝트 MCP 서버 정의 `.mcp.json` (atlassian·figma) — 팀 클론 시 `/mcp` 인증으로 동일 환경 재현
- `/start`: Jira 이슈 생성 시 `JIRA_LABELS`(project.config) 적용 — 라벨 트리거 하위 업무 자동생성 대응
- `project.config.example.md`: `JIRA_LABELS`·`GITLAB_HOST`·`E2E_*` 설정 키
- README(.claude): glab CLI 설치/인증 절차 — WSL 포함, 수동 설치 시 체크섬 검증
- CHANGELOG 리마인더 — `warn-changelog-on-mr` 훅(조건부 경고: `CHANGELOG.md` 없는 프로젝트는 통과) + `/mr`에 CHANGELOG 확인 단계

### Changed

- **⚠️ (호환성 주의) MCP 설정을 `settings.json` → 프로젝트 스코프 `.mcp.json`으로 이전**, 도구명을 `mcp__atlassian__*`/`mcp__figma__*`로 통일. 기존 `mcp__claude_ai_*`·`_Rovo` 가정과 다르며, 적용 후 `/mcp` 인증 필요
- `check-commit-typecheck` 훅: `type-check` 스크립트 없는 프로젝트는 통과하도록 보강(레거시/문서 repo 커밋 차단 해소), vue-tsc 특정 문구 제거
- `secure-review`: Vue3/Pinia 하드코딩 → 스택 자동 감지 + 프레임워크 분기로 일반화
- plan·progress 템플릿을 `start` 인라인(SSOT)으로 일원화
- skill 내 프로젝트 잔재(VC·`origin/dev` 고정) 일반화, `review` base 브랜치를 `DEFAULT_TARGET_BRANCH` 기준으로
- `e2e`: 프로젝트 전용값을 "프로젝트 설정"으로 분리하고 README·CLAUDE.md에 통합
- Hotfix Type을 `commit`·`mr` skill Type 체계에 반영
- 루트 README: 적용 절차에 `.mcp.json`·`project.config`·`/mcp` 인증 반영, 폴더 구조·운영자 표 정합화
- `/start`: **Stage 0(Jira 티켓 키 확인)**을 plan.md 작성보다 먼저 강제 — 기존 티켓이면 summary를 가져와 작업 제목 기본값으로 재사용(중복 입력·재조회 제거). Stage 2-A/2-B 분기 기준을 `$ARGUMENTS` 유무 → Stage 0 확정 모드로 정리
- `/start` 생성 모드: Jira projectKey를 `project.config.md`의 `JIRA_PROJECT_KEY` 1순위 → 세션 메모리 → 사용자 질문 순으로 해석(매번 묻던 동작 개선)
- `settings.example.json`: `Bash(npx:*)` 광범위 허용을 실사용 명령(`npx eslint/playwright/prettier/vue-tsc`)으로 축소, `npm exec`/`npm x`/`npm explore`는 deny로 차단 (npx 등가 우회 방지 — 리뷰 Blocker 반영)
- `/start`·`/tech-doc`: Atlassian URL 하드코딩 제거 → `JIRA_SITE_URL`(project.config) 참조. `/tech-doc` 발행 위치도 `CONFLUENCE_SPACE`/`TECH_DOC_PARENT_PAGE_ID` 키 명시 참조
- `/start` Stage 3: glab 미설치/미인증 fallback(이슈 본문 파일 저장 + 이슈번호 입력 후 계속) 명시
- `/start` Stage 4: base 브랜치 결정 규칙 명시 — 현재 브랜치 ≠ `BASE_BRANCH`면 확인 질문, Hotfix base는 `PRODUCTION_BRANCH` 변수화
- `/review`: 자동 수집을 diff 본문 3종 → `--stat` 요약 3종으로 변경, 범위 확정 후 해당 diff 본문만 읽도록 절차화 (컨텍스트 중복 적재 방지)
- `/tech-doc`: 코드베이스 분석을 FSD·Pinia 하드코딩 가정 → 스택 감지(package.json + src 구조) 방식으로 일반화
- `notify-sensitive-edit` 훅: 디자인 토큰 자산(`theme/tokens/`, `design-tokens.*`, `_tokens.scss` 등)만 **좁게** `token` 패턴에서 제외 (오탐 방지 — `token.ts` 같은 인증 토큰 파일명은 계속 경고, 리뷰 Blocker 반영)
- `rules/fe/vue3-typescript.md`: vibe-catch 전용 SCSS 토큰 목록 제거 → "프로젝트 `_variables.scss`에 존재하는 변수만 사용" 원칙으로 대체 (목록은 프로젝트 rule로 이관)
- README(.claude): 배포 소스 repo와 일반 프로젝트의 인스턴스 파일(settings.json·project.config.md) 커밋 정책 구분 명시, `docs/pilot-metrics/` 커밋 정책(미커밋 권장) 추가
- `TEAM_STANDARD_CLAUDE_PLAN.md`를 `.claude/` → `docs/team-standard-claude-plan.md`로 이동 (배포물에서 제외)

### Fixed

- `settings.example.json`: 훅 `timeout` 단위 오류 수정 — `120000`(초 해석 시 33시간) → `300`초 (type-check가 긴 프로젝트에서 timeout으로 게이트가 무음 소멸하지 않도록 여유 포함)
- `warn-changelog-on-mr` 훅: 대상 브랜치 추출값을 셸 보간하던 `execSync` → `execFileSync` 전환 (명령 주입 표면 제거)
- `/commit` 9단계: 훅 활성 여부 판정 절차(settings.json PreToolUse 등록 확인) 추가 — 훅 미적용 환경에서 type-check 게이트가 무음 소멸하지 않도록 수동 fallback 명시
- `settings.example.json`: `Skill(name *)` 패턴이 무인자 스킬 호출과 매칭되지 않던 문제 — `Skill(name)` 병기
- `/commit` 9단계: 스킬의 `npm run type-check`와 PreToolUse 훅의 동일 검사 중복 실행 해소 — 훅을 단일 게이트로 위임
- `rules/fe/vue3-typescript.md`: Quick Rules "화살표 함수 우선 [MUST]"이 본문(위치별 function declaration/arrow 구분)과 모순되던 표기 정정
- `/mr` 품질 평가 배점 합계 90점 → 100점 (E. 테스트 근거 5점 → 15점)
- `/start` Stage 2: 작성자 개인 Claude 메모리 파일(`feedback_mcp_atlassian.md`) 참조 문구 제거 — 팀원 환경에서 깨진 참조
- `/e2e` 1-B: 출처 개수 표기 4개 → 5개 정정, 시나리오 메타 `출처` 태그에 `[반응형]` 추가
- `/secure-review`: `context: fork` frontmatter에 버전 호환 주석 추가 (미지원 버전에선 무시됨)

### Removed

- `mr` skill의 "MR 품질 평가 기준 참고" 배점표(A~F 항목별 점수 기준) — 운영 부담 대비 실효성 낮아 제거
- `settings.example.json`의 동작하지 않던 `mcpServers.figma` 블록 (MCP는 `.mcp.json`에서 정의)
- orphan 템플릿 `skills/start/templates/{plan-ui,plan-slim,progress}.md` (인라인 SSOT로 대체)
- `note` skill의 미존재 `_templates/` 의존 및 rule 파일의 미존재 형제 파일 참조

<!--
7월 1일 첫 릴리스 cut 절차:
1. 위 [Unreleased] → ## [1.0.0] - 2026-07-01 로 변경 (인용구 안내문 제거)
2. git tag v1.0.0 + rules/team.md 헤더 버전 = 1.0.0 일치
3. 아래 링크 추가:
   [Unreleased]: https://dep.dawin.tv/adplatforms/ux-ai-automation/-/compare/v1.0.0...HEAD
   [1.0.0]: https://dep.dawin.tv/adplatforms/ux-ai-automation/-/tags/v1.0.0
-->
