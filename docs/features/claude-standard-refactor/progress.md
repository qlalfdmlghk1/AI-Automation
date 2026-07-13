# claude-standard-refactor — 진행 상황

## 📌 현재 작업

- 이슈: #3 (Refactor)
- 브랜치: refactor/3-claude-standard-refactor
- 단계: 수정 완료 — 커밋/MR 대기
- 마지막 업데이트: 2026-06-12 14:05

---

## [Issue #3] claude-standard-refactor

**Type**: Refactor | **Jira**: DEV-196 | **시작**: 2026-06-12

### ✅ 완료

- [x] 작업 환경 셋업 (/start 실행)
- [x] 🔴 버그성 수정 6건 (timeout 단위 / Skill 패턴 / 메모리 참조 / type-check 중복 / vue3 모순 / mr 배점)
- [x] 🟡 일관성·설계 개선 8건 (npx 축소 / URL 변수화 / 토큰 오탐 / review stat / tech-doc 스택 감지 / vue3 토큰 원칙화 / README 정책 / 플랜 문서 이동)
- [x] 🟢 사소한 정리 6건 (.agents / pilot-metrics gitignore / e2e 표기 / start base 규칙 / start glab fallback / secure-review 주석)
- [x] 검증 — `node --check` 통과, settings JSON 파싱 OK, 디자인 토큰 무경고·auth 토큰 경고 확인, 하드코딩 잔여 0건(설정 기본값 제외)
- [x] CHANGELOG `[Unreleased]`에 Changed/Fixed 기록
- [x] 로컬 `.claude/settings.json`을 수정된 example과 재동기화

### 🚧 진행 중

- [ ] /commit → /mr → /review 흐름

### 📝 결정 로그

- [2026-06-12 13:56] /start 실행, 작업 환경 셋업 완료
- [2026-06-12 13:56] 이 repo는 배포 소스 — 인스턴스 파일(settings.json, project.config.md)은 gitignore + 로컬 생성(A안)으로 운영하기로 결정
- [2026-06-12 13:56] Jira는 DEV-170 에픽 하위 `스토리` 타입으로 생성 (이 Jira는 에픽 하위에 스토리/버그만 허용)
- [2026-06-12 14:05] /mr 배점 90→100: E. 테스트 근거 5점→15점으로 조정 — **원본 평가 루브릭(Confluence) 기준과 대조 확인 필요**
- [2026-06-12 14:05] pilot-metrics 로그는 커밋하지 않기로 결정 (.gitignore `docs/pilot-metrics/` + README 권장 문구) — 작성자 이름 포함 데이터
- [2026-06-12 14:05] `Bash(npx:*)` → `npx eslint/playwright/prettier/vue-tsc` 4종으로 축소. `Bash(npm:*)`은 프로젝트별 스크립트 다양성 때문에 유지

### 🐛 트러블슈팅

<!-- /note troubleshoot 으로 추가 -->

### ⏭️ 남은 작업

- /mr로 MR 생성 → /review 4 페르소나 리뷰
- (후속) /mr 배점 조정값을 원본 Confluence 루브릭과 대조

---

### Commit — 2026-06-12 14:10

- Hash: `597407a`
- Message: `Refactor:#3 팀 표준 .claude 검토 피드백 20건 반영`
- Issue: `#3`
- Jira: `DEV-196`

**변경 요약**

- 검토 리포트 20건 전체 반영 — 🔴 버그 6 / 🟡 일관성 8 / 🟢 정리 6 (상세는 plan.md In Scope·CHANGELOG [Unreleased])
- 검증: 훅 `node --check`·샘플 stdin 실행, settings JSON 파싱, 하드코딩 잔여 검색 0건

**결정 로그**

- 16개 파일이지만 단일 논리 단위(검토 피드백 반영)라 단일 커밋으로 진행
- 마지막 커밋으로 확정 — `Closes #3` (리뷰 Blocker 반영 커밋은 추가될 수 있음)

**다음 작업**

- /mr → /review (origin/main 기준)

---

### Review — 2026-06-12 (MR !8, 4 페르소나)

- Blocker 2건 (🛡️ npm:* 우회 / 🛡️ isDesignToken 과대 제외), Non-blocker 11건, 노트: MR !8 #note_342834

**Blocker 반영**

- `npm exec`/`npm x`/`npm explore` deny 추가 — npx 등가 우회 차단
- isDesignToken을 디자인 컨텍스트 동반 시에만 매칭하도록 축소 — `token.ts` 인증 토큰 파일명 경고 복원 (회귀 케이스 7종 재검증)

**Non-blocker 반영 (8건)**

- warn-changelog execFileSync 전환 / /commit 훅 활성 판정 절차 + 강행 옵션 단서 / BASE_BRANCH↔DEFAULT_TARGET_BRANCH 관계 주석 / /review origin/dev 무해화 / vue3 토큰 경로 예시화 / /start checkout·pull 블록 / /e2e 리스트 빈 줄 / 훅 timeout 300초 상향

**미반영 (후속)**

- MCP 와일드카드 허용 범위 — 팀 정책 결정 필요
- `Skill(name)` 실매칭 — 새 세션에서 1회 확인 필요
- `src/auth/tokens/refresh.ts` 같은 디렉토리 기반 토큰 탐지 — 기존에도 basename만 검사(이번 회귀 아님), 탐지 확대는 기능 추가라 별도 검토
- /mr E 배점 15점 원본 루브릭 대조, TYPECHECK_COMMAND 키 연결, ATLASSIAN_SITE_URL 키명 (v2)

**참고**: plan.md의 ".agents 정리"는 untracked 빈 디렉터리 삭제라 git diff에 나타나지 않음 (정상)
