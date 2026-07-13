# claude-standard-consistency — 진행 상황

## 📌 현재 작업

- 이슈: #2 (Refactor)
- 브랜치: refactor/2-claude-standard-consistency
- 단계: In Scope 전체 완료 → MR !4 오픈 (리뷰 대기)
- MR: https://dep.dawin.tv/adplatforms/ux-ai-automation/-/merge_requests/4
- 마지막 업데이트: 2026-06-09

---

## [Issue #2] claude-standard-consistency

**Type**: Refactor | **Jira**: DEV-195 | **시작**: 2026-06-09

### ✅ 완료

- [x] 작업 환경 셋업 (/start 실행)

### ✅ 완료 (이어서)

- [x] MCP 정합: `.mcp.json` 신규(atlassian/figma) + settings.example.json 죽은 `mcpServers.figma` 제거·figma 도구명 정정·`enableAllProjectMcpServers` 추가 + start skill 도구명 `mcp__atlassian__*` 통일

### 🚧 진행 중

- [x] type-check hook script 존재 검사 — `pkg.scripts['type-check']` 없으면 skip(exit 0). 3 케이스 테스트 통과(스크립트 없음/비-commit/정상실행). vue-tsc 특정 문구 제거해 스택 중립화
- [x] note skill `_templates/` 의존 제거 — 인라인화(본문 4단계 형식 사용). 신규 파일 시 H1 제목 추가 규칙 명시

### ✅ 완료 (이어서 2)

- [x] plan 템플릿 일원화 — 인라인 SSOT 확정. plan-ui.md/plan-slim.md 삭제, `✅ 검증 계획`(전체)+`🖥️ 화면 분해`·`🎨 디자인 분석`(UI 옵셔널) 인라인 흡수, start 1-4에 섹션 선택 규칙 추가

### 🚧 진행 중 — 🟠 그룹

- [x] secure-review 스택 무가정화 — v1.1. package.json 스택 감지 추가, XSS(v-html/dangerouslySetInnerHTML/Angular)·토큰 저장(전역 상태 일반화)·env prefix(VITE/NEXT_PUBLIC/REACT_APP)·store persist 체크를 프레임워크 분기로 일반화. 체크리스트 Pinia→State Store
- [x] 템플릿·skill의 VC·origin/dev 잔재 일반화 — start `{Jira 키}` · tech-doc `{CONFLUENCE_SPACE}` · review base(DEFAULT_TARGET_BRANCH). CLAUDE.md `(예: UX, VC)`는 의도된 예시라 유지, TEAM_STANDARD_CLAUDE_PLAN.md는 Out of Scope
- [x] e2e skill 전용값 분리 + 표준 문서 통합 — 프로젝트 설정 섹션·예시 재프레이밍·파일럿 라벨, project.config E2E 키, README/CLAUDE.md 통합. (README MCP 안내도 `.mcp.json` 기준으로 정정)
- [x] rule dangling 참조 정리 — 미존재 형제 파일 참조 5종 정정(범위 밖/secure-review 안내), "복사 시 파일명" 제거. 🟠 그룹 완료

### 🚧 진행 중 — 🟡 그룹

- [x] Hotfix Type 정합 — commit Type 정의표 + mr Type 목록에 Hotfix 추가 (start와 일치)
- [x] progress.md 포맷 일원화 + metrics 정합 — orphan templates/progress.md 삭제, SSOT=start 인라인+commit append 확정, pilot-core-metrics --dry-run 4지표 정상 파싱 검증. **🟡 그룹 완료 → In Scope 전체 완료**

### Commit — 2026-06-09 (8)

- Hash: `f02820f`
- Message: `Refactor:#2 Hotfix Type을 commit·mr skill에 정합 반영`
- 변경 요약: commit Type 정의표 + mr Type 목록에 Hotfix 추가

### ✅ 리뷰 Non-blocker 반영 (MR !4, Blocker 0)

- [x] #3 settings.example에 `mcp__atlassian__*` allow 추가 (start 자동화 프롬프트 감소)
- [x] #4 e2e frontmatter allowed-tools에 `mcp__playwright__*` 추가
- [x] #5 secure-review `cat package.json 2>/dev/null || echo` fallback
- [x] #6 JIRA_LABELS 공백 불가 주의 (start 본문 + project.config)
- [x] #7 e2e 설정표에 project.config 키(E2E_DIR 등) 1:1 병기
- [x] #1 README WSL glab 무결성 검증(체크섬·버전고정·경로탐색) + apt 1순위
- [x] #2 사내 GitLab 호스트 → project.config `GITLAB_HOST` 외부화
- TODO(후속): TEAM_STANDARD_CLAUDE_PLAN stale 참조, vue2/angularjs TODO주석 fe-convention 표현, MCP 커넥터 공존 안내 1줄

### ➕ 피드백 반영 (MR 직전 추가)

- [x] `/start` Jira 라벨 누락 보완 — createJiraIssue에 `JIRA_LABELS`(project.config) 적용, 라벨 트리거 하위업무 자동생성 대응
- [x] glab CLI 설치/실행(WSL 포함) README 정리 — Linux 바이너리·`--hostname` 인증·`glab.exe` 오용 주의
- 후속 제안(별도 티켓): 이슈 추정치 자동 입력 / GitLab 체크박스 기반 이슈 상태 자동 갱신 → plan "🔭 후속 제안"에 기록

### Commit — 2026-06-09 (7)

- Hash: `aef50ac`
- Message: `Refactor:#2 rule 파일의 dangling 참조·복사 모델 정정`
- 변경 요약: 미존재 형제 룰 파일 참조 5종 정정 + "복사 시 파일명" 제거
- 다음 작업: 🟡 Hotfix Type 정합

### Commit — 2026-06-09 (6)

- Hash: `f539cbb`
- Message: `Refactor:#2 e2e skill 프로젝트 전용값 분리 + 표준 문서 통합`
- 변경 요약: e2e 프로젝트 설정 섹션·예시 재프레이밍·파일럿 라벨, project.config E2E 키, README/CLAUDE.md 통합, README MCP 안내 정정
- 다음 작업: rule 파일 dangling 참조 정리

### Commit — 2026-06-09 (5)

- Hash: `add5561`
- Message: `Refactor:#2 skill 내 VC·origin/dev 프로젝트 잔재 일반화`
- 변경 요약: start `{Jira 키}` · tech-doc `{CONFLUENCE_SPACE}` · review base(DEFAULT_TARGET_BRANCH) 완화
- 다음 작업: e2e skill 전용값 분리 + README/CLAUDE.md 통합

### Commit — 2026-06-09 (4)

- Hash: `1e41fa3`
- Message: `Refactor:#2 secure-review를 스택 무가정 방식으로 전환`
- 변경 요약: secure-review v1.1 — 스택 감지 + XSS/토큰/env/store 체크 프레임워크 분기 일반화
- 다음 작업: VC·origin/dev 잔재 project.config화

### Commit — 2026-06-09 (3)

- Hash: `e772321`
- Message: `Refactor:#2 plan 템플릿을 start 인라인 SSOT로 일원화`
- 변경 요약: plan-ui.md/plan-slim.md 삭제 · start 인라인 템플릿에 검증 계획 + UI 옵셔널 블록 흡수 + 섹션 선택 규칙
- 다음 작업: 🟠 그룹 — secure-review 스택 무가정화부터

### Commit — 2026-06-09 (2)

- Hash: `37d05be`
- Message: `Refactor:#2 type-check hook·note skill 정합성 수정`
- 변경 요약: check-commit-typecheck에 `scripts.type-check` 존재 검사 추가(레거시 커밋 차단 해소) · note skill `_templates/` 의존 제거(인라인화)
- 다음 작업: plan 템플릿 일원화

### Commit — 2026-06-09

- Hash: `76220a9`
- Message: `Refactor:#2 .claude MCP 설정을 .mcp.json 기반으로 정합화`
- 변경 요약: `.mcp.json` 신규(atlassian/figma) · settings.example.json 죽은 `mcpServers.figma` 제거·figma 도구명 정정·`enableAllProjectMcpServers` 추가 · start skill 도구명 `mcp__atlassian__*` 통일
- 다음 작업: type-check hook script 존재 검사

### 📝 결정 로그

- [2026-06-09 09:36] /start 실행, 작업 환경 셋업 완료
- [2026-06-09 09:36] 처음 지정한 DEV-194는 상위 '표준 스킬 세팅' 스토리(담당 최원서)라 덮어쓰지 않고, 빈 하위작업 DEV-195(.claude 정합성 개선)를 본 작업 티켓으로 확정
- [2026-06-09 10:00] MCP 표준화 방향 확정 — 공식 문서 확인 결과 settings.json은 MCP 서버 정의 불가(.mcp.json 프로젝트 스코프가 정답). 기존 settings.example.json `mcpServers.figma`는 죽은 설정이었음. → `.mcp.json` 커밋 + 도구명 `mcp__atlassian__*`/`mcp__figma__*` 통일로 In Scope 확장

### 🐛 트러블슈팅

<!-- /note troubleshoot 으로 추가 -->

### ⏭️ 남은 작업

<!-- plan.md In Scope 미완 항목 자동 동기화 -->
