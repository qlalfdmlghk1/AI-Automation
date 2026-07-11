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

## E2E (`/e2e` skill 사용 시)

값은 프로젝트마다 다릅니다. 아래는 vibe-catch 파일럿 예시.

- E2E_DIR: tests/e2e
- E2E_SELECTORS_SSOT: tests/e2e/support/selectors.md
- E2E_VIEWPORTS: tests/e2e/support/viewports.ts
- E2E_MOCK_MODE: MSW (VITE_ENABLE_API_MOCKING=true)
- E2E_LEDGER_DIR: docs/e2e
- VISUAL_REGRESSION_TOOL: Chromatic
- BREAKPOINTS: desktop<=1599, tablet<=1279, mobile<=767
