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

_다음 릴리스에 들어갈 변경을 여기에 누적합니다._

## [2.0.0] - 2026-07-14

> **⚠️ Breaking — 워크플로 플랫폼을 GitLab에서 GitHub로 완전 교체했습니다.** `glab` CLI·MR·GitLab Issue 기반 흐름이 전부 `gh` CLI·PR·GitHub Issue로 바뀌고, `/mr` 스킬이 **제거**되며 `/pr`로 대체됩니다. Jira·Confluence 연동은 그대로입니다.
>
> **업그레이드 시 필요한 조치**
>
> 1. `gh` CLI 설치 및 인증 — `gh auth status`로 확인 (`glab`은 더 이상 쓰지 않음)
> 2. `/mr` → **`/pr`** 로 호출명 변경 (`/mr`은 더 이상 존재하지 않음)
> 3. `project.config.md`의 `## GitLab` 섹션을 `## GitHub`로 교체 — `GITLAB_PROJECT_URL`→`GITHUB_REPO_URL`, `GITLAB_HOST`→`GITHUB_HOST`(Enterprise만, github.com이면 공란), `GITLAB_USERNAME`→`GITHUB_USERNAME`
> 4. `settings.json` 갱신 — `Bash(glab:*)`→`Bash(gh:*)`, `Skill(mr)`→`Skill(pr)`, 훅 경로 `warn-changelog-on-mr.js`→`warn-changelog-on-pr.js`
>
> `DEFAULT_TARGET_BRANCH`·`BASE_BRANCH`·`STAGING_BRANCH`·`PRODUCTION_BRANCH`와 커밋 컨벤션(`Closes #N`/`Refs #N`, Type 체계)은 **변경 없음** — GitHub에서도 동일하게 동작합니다.

### Changed

- **⚠️ (Breaking) 워크플로 CLI: `glab` → `gh`.** 모든 스킬의 명령을 GitHub CLI 기준으로 교체. 플래그가 다른 지점을 정확히 반영 — PR 생성 `--target-branch`→`--base`, `--description`→`--body`, 이슈 조회 JSON 필드 `description`→`body`, 사용자명 필드 `.username`→`.login`, PR 대상 브랜치 `target_branch`→`baseRefName`
- **⚠️ (Breaking) `/mr` 스킬 제거 → `/pr` 로 대체.** GitHub는 Merge Request가 아니라 Pull Request이므로 스킬명·용어·저장 경로(`docs/mr/`→`docs/pr/`)를 전부 PR 기준으로 통일
- **⚠️ (Breaking) `project.config`의 `GitLab` 섹션 → `GitHub` 섹션.** 키 이름 변경(위 업그레이드 안내 참고)
- 훅 `warn-changelog-on-mr.js` → `warn-changelog-on-pr.js` 로 이름 변경. 인터셉트 대상도 `glab mr create` → `gh pr create`
- `.claude/README.md`: glab의 수동 설치+체크섬 검증 WSL 절차를 GitHub 공식 apt 저장소 등록 방식으로 간소화
- `/review`·`/review-converge`·`/secure-review`: 리뷰 결과 등록을 `glab mr note` → `gh pr comment`로 교체 (fallback 로직은 유지)
- `/start`: GitHub Issue 생성(`gh issue create --body`), Jira description에 append하는 링크 섹션도 GitHub 기준으로
- `/commit`: Jira 키 추출을 `gh issue view N --json body`로 교체

## [1.2.0] - 2026-07-14

> 첫 정식 릴리스(태그). 그동안 태그 없이 누적된 표준 하네스 전체를 하나로 묶고, 배포 방식을 **`.claude/` 폴더 복사 → Claude Code 플러그인**으로 전환했습니다.
>
> `1.0.0`·`1.1.0`은 태그로 배포된 적이 없어 건너뜁니다 — `rules/team.md` 헤더가 이미 `v1.2.0`이라 **"CHANGELOG = git tag = team.md 헤더"** 규칙을 그 값에 맞춰 복원했습니다.

### Added

- **플러그인 배포 전환** — `.claude-plugin/marketplace.json`·`plugin.json` 추가. 워크플로 스킬 12종을 **전역** 제공하며, MCP 서버(atlassian·figma)도 플러그인이 함께 제공(`mcpServers` → `.mcp.json`)

  ```bash
  claude plugin marketplace add qlalfdmlghk1/AI-Automation
  claude plugin install ux-team-standard@ux-ai-automation
  ```

- `/team-init` — 스택을 감지해 `CLAUDE.md`·`rules/`·`settings.json`·`hooks/`·`project.config.md`를 프로젝트에 배치하고, 플러그인이 대체하는 프로젝트 사본(`skills/`·구버전 `commands/`)은 정리. **플러그인은 rules·CLAUDE.md를 배포할 수 없으므로 이 스킬이 유일한 공급 경로**
- `/plan-review` — 기획 검수(정책 모순·미정의 케이스·흐름 누락 → 기획자 확인 질문 목록)
- `/review-converge` — 리뷰 → 자동 반영 → 객관 검증(lint/type/test/build) → 재리뷰 자가수렴 루프
- `rules/security-compliance.md` — ISMS-P·개인정보보호 체크리스트 (`/review` 보안 페르소나·`/secure-review`의 판정 정본)
- `rules/native/android-convention.md`·`rules/native/ios-convention.md`·`rules/backend/nestjs.md` — 멀티스택 규칙(Android·iOS·NestJS)
- `DOMAIN.md`(도메인 인덱스)·`domain/_TEMPLATE.md`(도메인 정의 양식) — 유비쿼터스 언어
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

- **⚠️ (호환성 주의) 배포 방식 전환: `.claude/` 폴더 복사 → 플러그인 설치 + `/team-init`.** 워크플로 스킬은 더 이상 프로젝트에 복사하지 않습니다(전역 제공). 프로젝트에는 `rules/`·`hooks/`·`CLAUDE.md`·`settings.json`·`project.config.md`만 `/team-init`이 배치합니다. **이 프로젝트를 받는 팀원은 플러그인 설치가 필수**입니다
- **⚠️ (호환성 주의) 배포 소스를 사내 GitLab → GitHub(`qlalfdmlghk1/AI-Automation`)로 이전.** 마켓플레이스 등록 URL·README·CHANGELOG 링크가 GitHub 기준으로 변경됐고, 안정 채널 브랜치는 `master`입니다. (워크플로 자체는 여전히 GitLab 기반 — `glab`·MR·GitLab Issue)
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

- **`/team-init`이 `rules/security-compliance.md`를 배포하지 않던 문제** — 플러그인은 rules를 배포할 수 없는데 배포 목록에도 없어, 표준을 적용한 프로젝트에서 `/review`·`/secure-review`가 **ISMS-P 정본 없이 요약본만으로 판정**하며 조용히 degrade했습니다. 공통 배포 목록에 `security-compliance.md`·`api-guide-reference.md`를 추가하고, Stage 5에 존재 확인 점검을 강제했습니다
- `plugin.json`에 `mcpServers` 키가 없어 "MCP 서버는 플러그인이 함께 제공"이라는 README 설명이 실제와 달랐던 문제 — `"mcpServers": "./.mcp.json"` 명시
- `settings.example.json`: 신규 스킬 `plan-review`·`review-converge`가 `Skill()` 허용목록에 없어 매번 권한 프롬프트가 뜨던 문제 (`team-init`은 파일을 생성·삭제하므로 의도적으로 제외 — 프롬프트를 안전장치로 유지)
- `rules/native/android-convention.md`: 보안 정본을 "ux-team-standard 플러그인 배포"로 잘못 안내하던 문구를 "`/team-init`이 프로젝트에 배치"로 정정
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

[Unreleased]: https://github.com/qlalfdmlghk1/AI-Automation/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/qlalfdmlghk1/AI-Automation/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/qlalfdmlghk1/AI-Automation/releases/tag/v1.2.0

<!--
릴리스 cut 절차:
1. [Unreleased]의 내용을 ## [x.y.z] - YYYY-MM-DD 로 cut하고 빈 [Unreleased]를 남깁니다.
2. 세 값을 항상 일치시킵니다: CHANGELOG 버전 = git tag(vX.Y.Z) = .claude/rules/team.md 헤더 버전
   ※ 플러그인 배포이므로 .claude-plugin/plugin.json·marketplace.json의 version도 함께 맞춥니다.
3. 위 링크 참조([Unreleased]/[x.y.z])를 새 버전 기준으로 갱신합니다.
4. git tag vX.Y.Z && git push origin vX.Y.Z (안정 채널 = default branch `master`)
-->
