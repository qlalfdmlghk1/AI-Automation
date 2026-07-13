# claude-standard-refactor

| 항목         | 값                          |
| ------------ | --------------------------- |
| Jira         | [DEV-196](https://incross-platform.atlassian.net/browse/DEV-196) |
| GitLab Issue | [#3](https://dep.dawin.tv/adplatforms/ux-ai-automation/-/issues/3) |
| Branch       | `refactor/3-claude-standard-refactor` |
| 작성자       | 여인수                      |
| 작성일       | 2026-06-12                  |
| Type         | Refactor                    |

## 🎯 작업 목적

팀 표준 `.claude` 배포물의 전체 검토에서 발견된 버그·일관성 문제를 배포 전에 해소하여, 파일럿 프로젝트들이 잘못된 설정(훅 timeout 단위 오류 등)과 깨진 참조를 복사해 가지 않도록 한다.

## 📋 작업 범위

**포함 (In Scope)**

🔴 버그성 수정

- [x] settings.example.json 훅 `timeout` 단위 수정 (`120000` → `120`, 초 단위)
- [x] settings.example.json `Skill(name *)` 패턴이 무인자 호출과 매칭되도록 보완 (`Skill(name)` 병기)
- [x] /start SKILL.md의 개인 메모리(`feedback_mcp_atlassian.md`) 참조 문구 제거
- [x] /commit 9단계 type-check와 PreToolUse 훅의 중복 실행 해소 (훅을 단일 게이트로)
- [x] vue3-typescript.md Quick Rules ↔ 본문 함수 선언 규칙 모순 정정
- [x] /mr 품질 평가 배점 합계 90점 → 100점 정합화

🟡 일관성·설계 개선

- [x] settings.example.json `Bash(npx:*)` 등 광범위 권한을 실사용 명령으로 축소
- [x] /start·/tech-doc의 `incross-platform.atlassian.net` 하드코딩 제거 → `JIRA_SITE_URL` 참조
- [x] notify-sensitive-edit.js `token` 패턴의 디자인 토큰 파일 오탐 제외
- [x] /review 자동 수집을 3중 diff → `--stat` + 범위 확정 후 단일 diff로 변경
- [x] /tech-doc을 스택 감지(PROJECT_CONTEXT) 방식으로 정렬 + Confluence 설정 키 명시 참조
- [x] vue3-typescript.md의 vibe-catch 전용 토큰 목록을 원칙 문구로 대체 (목록은 프로젝트 룰로 이관)
- [x] README에 "배포 소스 repo vs 일반 프로젝트" 인스턴스 파일 정책 명시 (.gitignore 변경 포함)
- [x] TEAM_STANDARD_CLAUDE_PLAN.md를 `docs/`로 이동 (배포물에서 제외)

🟢 사소한 정리

- [x] `.agents/` 빈 디렉터리 정리
- [x] `docs/pilot-metrics/` 커밋 정책 결정 및 반영 (gitignore 또는 README 명시)
- [x] /e2e "4개 출처" 표기 정정 (5개) + 반응형 출처 태그 추가
- [x] /start Stage 4 base 브랜치 결정 규칙 명시 (현재 브랜치 ≠ 기본 브랜치면 확인)
- [x] /start Stage 3 glab 미설치 fallback 명시
- [x] /secure-review `context: fork` 버전 호환 주석 추가

**제외 (Out of Scope)**

- `template/.claude` 분리 구조(C안) — v2 표준 확정 시 검토
- 레거시 rule(angularjs 등) 내용 고도화 — 파일럿 결과 반영 시점에
- 릴리즈 모니터링 자동화 — 별도 운영 영역

## 🛠️ 접근 방식

- 2026-06-12 전체 검토 리포트의 항목을 우선순위(🔴→🟡→🟢) 순으로 반영
- `settings.example.json` 수정 후 로컬 인스턴스 `.claude/settings.json`(gitignore됨)과 동기화
- skill/rule 문서 수정 시 상호 참조(commit↔mr↔review, project.config 키) 정합성을 함께 갱신

## 🔗 참고 자료

| 유형       | 링크                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| Figma      | -                                                                             |
| Storybook  | -                                                                             |
| API 명세   | -                                                                             |
| Confluence | https://incross-platform.atlassian.net/wiki/spaces/UX/pages/239697958/Claude+Code+Q2 |
| 기타       | Jira 에픽: DEV-170 ([UX플랫폼개발팀] Claude Code 2Q 운영)                     |

## ✅ 검증 계획

- 단위/통합 테스트: 수정한 훅 JS는 `node --check` 문법 검증 + 샘플 stdin JSON으로 수동 실행
- 회귀 포인트: settings.example.json JSON 유효성, skill 간 상호 참조(/mr→/review 범위 패스, /commit↔훅 게이트), 다른 프로젝트에 복사 시 self-adapting 동작 유지
- 수동 확인: `rg`로 하드코딩 URL·메모리 참조 잔여 검색 0건 확인, 이 작업 자체를 /commit·/mr 플로우로 진행하며 도그푸딩

## 🤔 주요 결정 사항

- [2026-06-12] 이 repo는 배포 소스이므로 인스턴스 파일(settings.json, project.config.md)은 gitignore + 로컬 생성(A안)으로 운영
- [2026-06-12] Jira는 DEV-170 에픽 하위 `스토리` 타입으로 생성 (이 Jira는 에픽 하위에 스토리/버그만 허용)
