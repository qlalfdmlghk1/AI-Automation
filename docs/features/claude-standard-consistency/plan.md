# claude-standard-consistency

| 항목         | 값                          |
| ------------ | --------------------------- |
| Jira         | DEV-195 — https://incross-platform.atlassian.net/browse/DEV-195 |
| GitLab Issue | #2 — https://dep.dawin.tv/adplatforms/ux-ai-automation/-/issues/2 |
| Branch       | refactor/2-claude-standard-consistency (from origin/dev) |
| 작성자       | 여인수                      |
| 작성일       | 2026-06-09                  |
| Type         | Refactor                    |

## 🎯 작업 목적

팀 표준 `.claude`는 "다중 스택 범용"을 표방하지만, 일부 skill·hook·rule·템플릿이 특정 프로젝트(vibe-catch)·Vue3 전용에 묶여 있거나 동작이 깨지는 불일치를 갖고 있다. 이를 정합화하여 표준의 신뢰성과 범용성을 확보한다.

## 📋 작업 범위

**포함 (In Scope)**

🔴 MCP 설정 정합 (방향 확정: `.mcp.json` 프로젝트 스코프)

- [x] `.mcp.json`(프로젝트 루트, 커밋) 신규 추가 — `atlassian`(`https://mcp.atlassian.com/v1/mcp`)·`figma`(`https://mcp.figma.com/mcp`), `type: http`(streamable-http alias)
- [x] settings.json의 죽은 `mcpServers.figma` 블록 제거 + `enableAllProjectMcpServers`로 팀 자동 승인 추가
- [x] 모든 skill·permission의 MCP 도구 참조를 `mcp__atlassian__*` / `mcp__figma__*`로 통일 — start allowed-tools·본문 치환, settings allow의 figma 도구명 정정. (review·tech-doc에는 MCP 도구명 직접 참조가 없어 수정 불필요로 확인됨)

🔴 기타 동작 버그

- [x] type-check hook이 `type-check` 스크립트 없는 레거시 JS 프로젝트의 커밋을 막지 않도록 script 존재 검사 추가 (package.json `scripts.type-check` 확인 → 없으면 skip)
- [x] note skill의 `docs/features/_templates/` 의존 해결 → 인라인화(본문 4단계 형식 사용, 외부 파일 의존 제거)
- [x] plan 템플릿 일원화 — 인라인을 SSOT로 확정. orphan plan-ui.md/plan-slim.md 삭제, 유용 섹션(✅ 검증 계획 / 🖥️ 화면 분해·🎨 디자인 분석 옵셔널)을 인라인에 흡수

🟠 "팀 표준(범용)" 목표와 충돌하는 구조

- [x] secure-review의 Vue3/Pinia 하드코딩을 review처럼 스택 무가정 방식으로 전환 — package.json 스택 감지 + XSS/토큰/env/store 체크를 프레임워크 분기로 일반화
- [x] 템플릿·skill의 프로젝트 잔재(VC, origin/dev 고정)를 일반화 — start `VC-{번호}`→`{Jira 키}`, tech-doc `spaces/VC`→`{CONFLUENCE_SPACE}`, review `origin/dev`→base(DEFAULT_TARGET_BRANCH) 기준. (templates/progress.md 잔재는 🟡 progress 항목에서 처리)
- [x] e2e skill의 프로젝트 전용값 분리 + 표준 문서 통합 — "프로젝트 설정" 섹션 추가(브레이크포인트·목·경로·셀렉터 SSOT·시각회귀), 본문 하드코딩을 예시로 재프레이밍, 로그인 파일럿을 vibe-catch 예시로 라벨. project.config.example에 E2E 키 추가. README 스킬표·도구표·MCP 안내 + CLAUDE.md에 e2e/Playwright MCP 반영
- [x] rule 파일의 미존재 형제 파일 dangling 참조 정리 — vue3(fe-storybook/fe-testing)·angularjs(be-convention-express/fe-secure-coding/be-secure-coding) 참조를 "범위 밖"·"/secure-review로 점검"으로 정정. CLAUDE.md 사용방식과 모순되던 "복사 시 파일명: fe-convention.md" 제거

🟡 Type / progress 포맷 불일치

- [x] Hotfix Type을 commit·mr skill의 Type 표/매핑에 정합 반영 — commit Type 정의표에 Hotfix 행 추가, mr Type 목록에 Hotfix 추가
- [x] progress.md 포맷 일원화 및 pilot-core-metrics.mjs 파싱 정합 확인 — orphan templates/progress.md(Session 포맷·VC 잔재) 삭제, SSOT=start Stage 5-A 인라인+commit append로 확정. metric --dry-run으로 4개 지표 정상 파싱 검증(스크립트 수정 불필요)

➕ 피드백 반영 (DEV-195 진행 중 추가)

- [x] `/start` Jira 이슈 생성 시 라벨 누락 보완 — `createJiraIssue`에 `JIRA_LABELS`(project.config) 적용. 라벨 트리거 하위 업무 자동 생성 자동화 대응 (project.config.example에 `JIRA_LABELS` 키 추가)
- [x] glab CLI 설치/실행 절차(WSL 포함) README에 정리 — Linux 바이너리 설치·`--hostname` 인증·`glab.exe` 오용 주의

**제외 (Out of Scope)**

- rule `paths:` frontmatter 자동로딩이 Claude Code에서 동작하는지 검증 → 조사 후 별도 티켓
- secure-review `context: fork` 실제 격리 동작 검증 → 별도 확인
- TEAM_STANDARD_CLAUDE_PLAN.md (stale 계획 문서) 이관/갱신
- 신규 스택 rule(be-convention-express 등) 신규 작성

**🔭 후속 제안 (신규 기능 — 별도 티켓 후보)**

피드백에서 나온 향후 기능. 정합성 수정이 아닌 신규 자동화라 본 티켓 범위 밖이며, 별도 티켓으로 추진:

- 이슈 최초 추정치 자동 입력 — 추정치 검토 단계에서 입력받아 Jira/GitLab에 자동 등록
- 이슈 상태 자동 업데이트 — GitLab 이슈 내부 체크박스 진행 상황에 맞춰 이슈 상태 자동 갱신

<!-- 후속 이슈 섹션은 여기 아래로 추가 — v2 자동화 예정 -->

## 🛠️ 접근 방식

- 분석 결과를 심각도(🔴 동작 깨짐 / 🟠 구조 / 🟡 포맷)로 분류하고 🔴부터 순차 수정한다.
- skill·hook 변경은 실제 실행 경로(커밋/리뷰/start)로 검증한다.
- config 기반 치환 값은 `project.config.example.md`의 키와 일치시킨다.
- 한 PR에 묶되, In Scope 체크리스트 단위로 커밋을 분리한다.

## 🔗 참고 자료

| 유형       | 링크                                                              |
| ---------- | ----------------------------------------------------------------- |
| Figma      | -                                                                 |
| Storybook  | -                                                                 |
| API 명세   | -                                                                 |
| Confluence | https://incross-platform.atlassian.net/wiki/spaces/UX/pages/239697958 |

## 🤔 주요 결정 사항

- **MCP는 `settings.json`이 아니라 `.mcp.json`(프로젝트 스코프)에 정의한다.** 공식 문서(code.claude.com) 확인 결과 settings.json에는 MCP 서버 *정의* 키가 없고 제어 키(`enableAllProjectMcpServers`/`enabledMcpjsonServers` 등)만 존재. 기존 settings.example.json의 `mcpServers.figma`는 한 번도 로드된 적 없는 죽은 설정이었음(실제 동작하던 figma는 claude.ai 커넥터 `mcp__claude_ai_Figma__*`).
- **도구명 규칙 = `mcp__<서버키>__<도구>`.** `.mcp.json`에 `atlassian`/`figma`로 등록 → `mcp__atlassian__*` / `mcp__figma__*`. 팀 표준은 claude.ai 커넥터(재현 불가) 대신 이 방식으로 통일해 "클론 → `/mcp` 인증 1회"로 동일 환경 보장.
