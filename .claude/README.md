# 팀 표준 .claude

Claude Code 팀 표준 workflow, rules, skills, hooks를 모아둔 폴더입니다.

## 빠른 적용

1. 팀 표준 플러그인을 설치합니다 (한 번만):
   ```bash
   claude plugin marketplace add qlalfdmlghk1/AI-Automation
   claude plugin install ux-team-standard@ux-ai-automation
   ```
   > `qlalfdmlghk1/AI-Automation`은 GitHub `owner/repo` 축약형입니다. 전체 URL(`https://github.com/qlalfdmlghk1/AI-Automation.git`)로도 됩니다.
   > 설치 대상 이름이 `ux-team-standard@ux-ai-automation`인 것은 레포명이 아니라 `marketplace.json`의 마켓플레이스명(`ux-ai-automation`)을 따르기 때문입니다.

   > 🌿 **배포 채널**: 위 명령은 **안정 채널**(default branch `master` = 릴리스)입니다. 릴리스 전 개발본을 미리 써보려면 `qlalfdmlghk1/AI-Automation@dev`처럼 브랜치를 pin하고 `/plugin marketplace update` + `/reload-plugins`로 갱신하세요. 상세는 루트 [README](../README.md#배포-채널).
2. 대상 프로젝트 루트에서 `/team-init`을 실행합니다 — 스택을 감지해 `rules/`·`CLAUDE.md`·`settings.json`·`hooks/`·`project.config.md`를 배치하고 자동 도출 값을 채웁니다.
3. `.claude/project.config.md`에서 Jira, GitHub, Confluence, 기본 브랜치, reviewer 값을 확인·입력합니다.
4. 프로젝트 스택에 맞는 rule을 확인합니다.
5. `gh auth status`로 GitHub CLI 인증 상태를 확인합니다.
6. MCP 서버(atlassian·figma)는 플러그인이 함께 제공합니다. `/mcp`에서 각 서버를 1회 인증합니다. (프로젝트 전용 MCP가 필요하면 프로젝트 루트 `.mcp.json`에 추가)

> 워크플로 스킬은 플러그인이 전역으로 제공하므로 프로젝트에 `skills/`를 복사하지 않습니다. `/team-init`은 "프로젝트마다 달라지는 파일 + 정리"만 담당합니다.

> 🏠 **배포 소스 repo(ux-ai-automation) 예외**: 이 표준의 원본 repo 자신은 인스턴스 파일(`settings.json`, `project.config.md`)을 **커밋하지 않습니다** (.gitignore 처리 — 통째 복사 시 repo 전용 값이 따라가는 것을 방지). 반면 **일반 프로젝트는 두 파일을 커밋해 팀과 공유하는 것이 표준**입니다.

## 필수 도구

| 도구          | 필요한 흐름                                                          |
| ------------- | -------------------------------------------------------------------- |
| Atlassian MCP | `/start` Jira 생성/수정, `/tech-doc` Confluence 발행                 |
| Figma MCP     | `/start` UI 기능 디자인 분석                                         |
| gh CLI        | `/start` GitHub Issue 생성, `/pr` PR 생성, `/review` PR 코멘트 등록  |
| npm           | hooks, type-check, audit                                             |
| Playwright MCP | `/e2e` 테스트 저작 시 dev 서버 주행 (선택)                          |

## 폴더 구조

```text
.claude/
├── CLAUDE.md
├── README.md
├── project.config.example.md    # 복사 → project.config.md
├── settings.example.json         # 복사 → settings.json
├── settings.local.example.json   # (선택) 복사 → settings.local.json (개인 전용)
├── hooks/
├── rules/
├── scripts/
└── skills/
```

> `settings.local.json`(개인 로컬 권한)은 `.gitignore` 대상이라 커밋되지 않습니다. 개인 권한이 필요하면 `settings.local.example.json`을 복사해 만듭니다.
>
> MCP 서버는 `.claude/`가 아니라 **프로젝트 루트의 `.mcp.json`**(커밋 공유)에 정의합니다. `settings.json`은 MCP 서버를 정의하지 않습니다(승인 제어 키만 존재).

## 주요 skills

| Skill               | 역할                                                        |
| ------------------- | ----------------------------------------------------------- |
| `/start`            | plan.md 합의 → Jira/GitHub Issue → branch → progress.md     |
| `/plan-review`      | 기획 검수 — 정책 모순·미정의 케이스·흐름 누락을 질문 목록으로 정리 |
| `/commit`           | 이슈 번호/Jira 키 기반 커밋 메시지 생성, type-check 후 커밋 |
| `/pr`               | GitHub PR 생성 후 `/review` 흐름 연결                       |
| `/review`           | 시니어/보안/아키텍트/QA 4 페르소나 병렬 리뷰                |
| `/review-converge`  | 리뷰→자동반영→검증→재리뷰 자가수렴 루프 (객관 기준 통과까지) |
| `/secure-review`    | 보안 전담 리뷰                                              |
| `/e2e`              | E2E 테스트 저작 (Playwright MCP 주행 → POM+spec → green 검증) |
| `/note`             | 개발 히스토리 빠른 기록                                     |
| `/tech-doc`         | 히스토리와 코드 분석 기반 Confluence 기술 문서 초안         |
| `/organize-imports` | import 정리                                                 |

## gh CLI가 필요한 지점

- `/start`: GitHub Issue 자동 생성
- `/commit`: GitHub Issue body에서 Jira 키 추출
- `/pr`: PR 자동 생성
- `/review`: PR 코멘트 자동 등록

미설치 시 skill은 수동 등록이나 로컬 문서 저장 fallback을 사용합니다.

### 설치 / 인증

```bash
# macOS
brew install gh

# Windows (PowerShell, winget)
winget install -e --id GitHub.cli

# 인증 (호스트 지정 — GitHub Enterprise면 사내 호스트)
gh auth login --hostname "$GITHUB_HOST"   # GITHUB_HOST = project.config.md 값 (기본값 github.com)
gh auth status
```

### WSL(Ubuntu)에서

WSL에서는 Windows용 gh가 아니라 **Linux 바이너리**를 설치해야 합니다. (Windows에 깔린 `gh.exe`를 WSL에서 호출하면 경로·인증·줄바꿈 문제가 생깁니다.)

```bash
# 1순위: 패키지 관리자 (가능하면 이걸로)
sudo apt update && sudo apt install -y gh

# 2순위: GitHub 공식 apt 저장소 등록 (배포판 apt에 gh가 없거나 버전이 낮을 때)
sudo apt update && sudo apt install -y curl gnupg
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install -y gh

gh version
gh auth login --hostname "$GITHUB_HOST"   # GITHUB_HOST = project.config.md 값. 브라우저 인증 토큰을 WSL 터미널에 붙여넣기
gh auth status
```

> 확인 포인트: `which gh` 가 `/usr/bin/gh`(apt 경로) 를 가리키는지, `gh.exe` 가 아닌지 확인. GitHub Enterprise 등 사내 호스트를 쓴다면 `--hostname` 으로 호스트를 명시해야 합니다.

## 프로젝트 유형별 rule

- 신규 Vue3 / TypeScript: `rules/fe/vue3-typescript.md`
- Vue2 / JavaScript 레거시: `rules/fe/vue2-javascript.md`
- React / Next.js (App Router): `rules/fe/react-nextjs.md`
- React / Vite (SPA): `rules/fe/react-vite.md`
- Node / AngularJS 등 특수 레거시: `rules/fe/angularjs-legacy.md`
- 디자인 시스템 / 퍼블리싱: `rules/fe/publishing-design-system.md`

## 주의

- `settings.local.json`은 개인 로컬 설정이므로 공유하지 않습니다.
- 프로젝트별 특수 hook은 팀 표준에 바로 넣지 말고 `project.config.md`에 필요성을 먼저 기록합니다.
- Jira/GitHub/Confluence 고정값은 skill 본문에 직접 박지 않고 프로젝트 설정으로 관리합니다.
- 세션 측정 훅(`pilot-session-metrics.mjs`)은 `docs/pilot-metrics/`에 로그(작성자 이름 포함)를 쌓습니다. **커밋하지 않는 것을 권장** — 프로젝트 `.gitignore`에 `docs/pilot-metrics/`를 추가하세요. 파일럿 보고용으로 커밋하려면 팀 합의 후 유지합니다.
