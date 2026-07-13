# Project Config Example

이 파일을 `.claude/project.config.md`로 복사한 뒤 프로젝트에 맞게 채웁니다.

## Project

- PROJECT_NAME:
- PROJECT_DESCRIPTION:
- PROJECT_STACK:
- BASE_BRANCH: dev # 작업 분기 기준 브랜치 (/start Stage 4) — 보통 GitLab의 DEFAULT_TARGET_BRANCH와 동일 값으로 유지 (다르면 분기 base와 MR/리뷰 base가 어긋남)

## Jira

- JIRA_PROJECT_KEY:
- JIRA_DEFAULT_ISSUE_TYPE:
- JIRA_DEFAULT_ASSIGNEE_EMAIL:
- JIRA_SITE_URL: https://incross-platform.atlassian.net
- JIRA_LABELS: # 쉼표 구분, 각 라벨은 공백 불가(하이픈·언더스코어 사용). /start가 이슈 생성 시 적용. 라벨 트리거로 하위 업무를 자동 생성하는 Jira 자동화를 쓰면 그 라벨을 반드시 등록 (누락 시 하위 업무 수동 생성 필요)
- JIRA_REVIEW_TRANSITION: # /mr 6단계에서 리뷰 후 전이할 목표 상태 이름 (예: 진행 중, In Review). 미설정 시 가능한 전이를 조회해 사용자에게 확인

## GitLab

- GITLAB_PROJECT_URL:
- GITLAB_HOST: # 사내 GitLab 호스트 (예: gitlab.example.com). glab auth login --hostname 에 사용
- GITLAB_USERNAME:
- DEFAULT_REVIEWER:
- DEFAULT_TARGET_BRANCH: dev # MR 대상·리뷰 비교 브랜치 (/mr·/review) — 보통 BASE_BRANCH와 동일 값으로 유지
- STAGING_BRANCH: staging
- PRODUCTION_BRANCH: product

## Confluence

- CONFLUENCE_SPACE:
- TECH_DOC_PARENT_PAGE_ID:
- TEAM_GUIDE_PAGE_URL:

## API / Design References

- API_GUIDE_PATH:
- SWAGGER_URL:
- FIGMA_LIBRARY_URL:

## Project-specific Hooks

필요한 프로젝트에서만 활성화합니다.

- READONLY_EXTERNAL_PATHS:
- SENSITIVE_PATH_PATTERNS:
- TYPECHECK_COMMAND: npm run type-check
- COMMIT_GATE_COMMAND: # 커밋 직전 게이트 명령(check-commit-typecheck 훅). 미설정 시 → Node+type-check 스크립트면 `npm run type-check` 자동, 그 외 앱 스택(Gradle·Xcode 등) 감지 시엔 "게이트 미설정" 경고(침묵 통과 방지), 문서/스크립트 레포면 조용히 skip. 스택 예시 → Android `./gradlew ktlintCheck`, iOS `swiftlint lint --strict`, NestJS `npm run typecheck`. Node type-check는 이 키가 아니라 TYPECHECK_COMMAND에 넣으면 커밋 게이트·review-converge 양쪽에 반영됨(이 키는 미설정 시 TYPECHECK_COMMAND를 폴백으로 사용). ⚠️ 값에 공백 뒤 `#`는 주석으로 잘리니 명령에 `#`을 쓰지 말 것
- FORMAT_COMMAND: # 편집 후 포맷 명령(format-edited 훅). 파일 경로가 마지막 인자로 붙는다. 미설정 시 web 확장자는 prettier 자동, 네이티브 확장자는 skip. 스택 예시 → Android `ktlint --format`, iOS `swiftformat`. ⚠️ 값은 공백으로 분해되어 실행되므로 인용/공백 포함 인자는 미지원 — 단순 `bin arg` 형태만 쓸 것

## Planning Review (`/plan-review` skill 사용 시)

- PLANNING_SOURCE_URLS: # 쉼표 구분, 기본 기획 소스(Confluence 등) URL. 있으면 /plan-review 기본 입력으로 사용
- PROTOTYPE_WORKSPACE_URL: # 화면 지도·디스크립션·시안 소스가 되는 프로토타입 워크스페이스 URL
- PLANNING_REVIEW_MAX_ROUNDS: # 자가 재검토 최대 회차 (미설정 시 기본 3)

## Validation / Review Converge (`/review-converge` skill 사용 시)

검증 명령은 config 우선, 없으면 `package.json` scripts 감지, 그래도 없으면 "건너뜀".

- LINT_COMMAND: # 예: npm run lint (미설정 시 scripts의 lint 감지)
- TEST_COMMAND: # 예: npm run test (미설정 시 scripts의 test 감지)
- BUILD_COMMAND: # 예: npm run build (미설정 시 scripts의 build 감지)
- REVIEW_CONVERGE_MAX_ROUNDS: # 리뷰 자가수렴 최대 회차 (미설정 시 기본 3)
- # TYPECHECK_COMMAND 는 위 "Project-specific Hooks" 항목을 공용으로 사용

## E2E (`/e2e` skill 사용 시)

값은 프로젝트마다 다릅니다. 아래는 vibe-catch 파일럿 예시.

- E2E_DIR: tests/e2e
- E2E_SELECTORS_SSOT: tests/e2e/support/selectors.md
- E2E_VIEWPORTS: tests/e2e/support/viewports.ts
- E2E_MOCK_MODE: MSW (VITE_ENABLE_API_MOCKING=true)
- E2E_LEDGER_DIR: docs/e2e
- VISUAL_REGRESSION_TOOL: Chromatic
- BREAKPOINTS: desktop<=1599, tablet<=1279, mobile<=767
