# 팀 표준 .claude

Claude Code 팀 표준 workflow, rules, skills, hooks를 모아둔 폴더입니다.

## 빠른 적용

1. 이 `.claude` 폴더를 프로젝트 루트에 복사합니다.
2. `.claude/settings.example.json`을 `.claude/settings.json`으로 복사합니다 (권한·hook 활성화).
3. `.claude/project.config.example.md`를 `.claude/project.config.md`로 복사합니다.
4. Jira, GitLab, Confluence, 기본 브랜치, reviewer 값을 채웁니다.
5. 프로젝트 스택에 맞는 rule을 확인합니다.
6. `glab auth status`로 GitLab CLI 인증 상태를 확인합니다.
7. MCP 서버(atlassian·figma)는 프로젝트 루트 `.mcp.json`(커밋됨)에 정의돼 있습니다. `/mcp`에서 각 서버를 1회 인증합니다.

> 🏠 **배포 소스 repo(ux-ai-automation) 예외**: 이 표준의 원본 repo 자신은 인스턴스 파일(`settings.json`, `project.config.md`)을 **커밋하지 않습니다** (.gitignore 처리 — 통째 복사 시 repo 전용 값이 따라가는 것을 방지). 반면 **일반 프로젝트는 두 파일을 커밋해 팀과 공유하는 것이 표준**입니다.

## 필수 도구

| 도구          | 필요한 흐름                                                       |
| ------------- | ----------------------------------------------------------------- |
| Atlassian MCP | `/start` Jira 생성/수정, `/tech-doc` Confluence 발행              |
| Figma MCP     | `/start` UI 기능 디자인 분석                                      |
| glab CLI      | `/start` GitLab Issue 생성, `/mr` MR 생성, `/review` MR note 등록 |
| npm           | hooks, type-check, audit                                          |
| Playwright MCP | `/e2e` 테스트 저작 시 dev 서버 주행 (선택)                       |

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
| `/start`            | plan.md 합의 → Jira/GitLab Issue → branch → progress.md     |
| `/commit`           | 이슈 번호/Jira 키 기반 커밋 메시지 생성, type-check 후 커밋 |
| `/mr`               | GitLab MR 생성 후 `/review` 흐름 연결                       |
| `/review`           | 시니어/보안/아키텍트/QA 4 페르소나 병렬 리뷰                |
| `/secure-review`    | 보안 전담 리뷰                                              |
| `/e2e`              | E2E 테스트 저작 (Playwright MCP 주행 → POM+spec → green 검증) |
| `/note`             | 개발 히스토리 빠른 기록                                     |
| `/tech-doc`         | 히스토리와 코드 분석 기반 Confluence 기술 문서 초안         |
| `/organize-imports` | import 정리                                                 |

## glab CLI가 필요한 지점

- `/start`: GitLab Issue 자동 생성
- `/commit`: GitLab Issue description에서 Jira 키 추출
- `/mr`: MR 자동 생성
- `/review`: MR note 자동 등록

미설치 시 skill은 수동 등록이나 로컬 문서 저장 fallback을 사용합니다.

### 설치 / 인증

```bash
# macOS
brew install glab

# Windows (PowerShell, winget)
winget install -e --id GitLab.GLab

# 인증 (사내 GitLab 호스트 지정)
glab auth login --hostname "$GITLAB_HOST"   # GITLAB_HOST = project.config.md 값 (사내 GitLab 호스트)
glab auth status
```

### WSL(Ubuntu)에서

WSL에서는 Windows용 glab이 아니라 **Linux 바이너리**를 설치해야 합니다. (Windows에 깔린 `glab.exe`를 WSL에서 호출하면 경로·인증·줄바꿈 문제가 생깁니다.)

```bash
# 1순위: 패키지 관리자 (가능하면 이걸로)
sudo apt update && sudo apt install -y glab

# 2순위: 수동 설치 — 버전 고정 + 체크섬 검증 (apt에 없을 때만)
GLAB_VER=v1.102.0   # 릴리스 페이지에서 최신 안정 버전 확인 후 고정
base="https://gitlab.com/gitlab-org/cli/-/releases/${GLAB_VER}/downloads"
curl -fsSL "${base}/glab_${GLAB_VER#v}_$(uname -s)_$(uname -m).tar.gz" -o /tmp/glab.tar.gz
curl -fsSL "${base}/checksums.txt" -o /tmp/glab.checksums.txt
(cd /tmp && sha256sum --ignore-missing -c glab.checksums.txt) || { echo "체크섬 불일치 — 설치 중단"; exit 1; }
tar -xzf /tmp/glab.tar.gz -C /tmp
sudo install "$(find /tmp -type f -name glab | head -1)" /usr/local/bin/glab

glab version
glab auth login --hostname "$GITLAB_HOST"   # GITLAB_HOST = project.config.md 값. 브라우저 인증 토큰을 WSL 터미널에 붙여넣기
glab auth status
```

> 확인 포인트: `which glab` 가 `/usr/local/bin/glab`(또는 apt 경로) 를 가리키는지, `glab.exe` 가 아닌지 확인. 사내 GitLab은 public 인스턴스가 아니므로 `--hostname` 으로 호스트를 명시해야 합니다.

## 프로젝트 유형별 rule

- 신규 Vue3 / TypeScript: `rules/fe/vue3-typescript.md`
- Vue2 / JavaScript 레거시: `rules/fe/vue2-javascript.md`
- Node / AngularJS 등 특수 레거시: `rules/fe/angularjs-legacy.md`
- 디자인 시스템 / 퍼블리싱: `rules/fe/publishing-design-system.md`

## 주의

- `settings.local.json`은 개인 로컬 설정이므로 공유하지 않습니다.
- 프로젝트별 특수 hook은 팀 표준에 바로 넣지 말고 `project.config.md`에 필요성을 먼저 기록합니다.
- Jira/GitLab/Confluence 고정값은 skill 본문에 직접 박지 않고 프로젝트 설정으로 관리합니다.
- 세션 측정 훅(`pilot-session-metrics.mjs`)은 `docs/pilot-metrics/`에 로그(작성자 이름 포함)를 쌓습니다. **커밋하지 않는 것을 권장** — 프로젝트 `.gitignore`에 `docs/pilot-metrics/`를 추가하세요. 파일럿 보고용으로 커밋하려면 팀 합의 후 유지합니다.
