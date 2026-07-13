# ux-ai-automation

UX플랫폼개발팀의 **AI 코딩 도구 모노레포**입니다.
팀에서 실제로 운영 중인 Claude Code / Codex 설정(스킬·룰·훅·세팅)을 한곳에 모아 **팀 표준으로 공유**하기 위한 저장소입니다.

각 팀원은 이 저장소를 **Claude Code 플러그인**으로 설치해 동일한 워크플로우(커밋·PR·리뷰·문서화 등)를 그대로 사용할 수 있습니다.

---

## 폴더 구조

```
ux-ai-automation/
├── README.md            # 이 문서 — 저장소 목적 + 적용 방법
├── CHANGELOG.md         # 배포물 버전 이력 (분기 업데이트 / SemVer)
├── .gitignore           # .claude/settings.local.json(개인 설정) 커밋 제외
├── .mcp.json            # MCP 서버 정의 (atlassian·figma) — /mcp 로 인증
│
├── .claude-plugin/      # 플러그인 배포 매니페스트
│   ├── marketplace.json # 마켓플레이스 카탈로그 (claude plugin marketplace add 대상)
│   └── plugin.json      # ux-team-standard 플러그인 정의 (워크플로 스킬 목록)
│
├── .claude/             # 팀 표준 자산 (스킬은 플러그인이 배포, 나머지는 /team-init 이 배치)
│   ├── README.md        # .claude/ 상세 안내 + 스킬 목록 + 적용 방법
│   ├── CLAUDE.md        # 프로젝트 지침 템플릿
│   ├── settings.example.json  # 권한/hook 설정 예시 (→ settings.json 으로 rename)
│   ├── settings.local.json    # 개인 전용 권한 (gitignore, 배포 제외)
│   ├── project.config.example.md  # 프로젝트 설정 예시 (→ project.config.md)
│   ├── hooks/           # PreToolUse / PostToolUse 훅 스크립트
│   ├── rules/           # 팀/스택별 규칙 문서 (CLAUDE.md·skill에서 참조)
│   └── skills/          # 슬래시 호출 / 자동 트리거 스킬
│
├── .codex/              # Codex 영역 (placeholder)
│   └── README.md
│
└── docs/                # 공통 가이드 (placeholder)
    └── README.md
```

> `.claude/`는 이 저장소 자체의 Claude Code 설정이기도 하고, 동시에 **배포물의 원본**이기도 합니다.
> `skills/`는 플러그인이 전역 배포하고, `rules/`·`hooks/`·`CLAUDE.md` 등은 `/team-init`이 대상 프로젝트에 배치합니다 (플러그인은 rules·CLAUDE.md를 배포할 수 없습니다).
> `settings.local.json`은 `.gitignore` 처리되어 커밋·배포에 포함되지 않습니다.

---

## 누가 쓰나 / 어떻게 적용하나

### Claude Code 사용자

이 저장소는 **Claude Code 플러그인 마켓플레이스**입니다. 폴더를 복사하지 말고 플러그인으로 설치하세요.

```bash
# 1. 마켓플레이스 등록 + 플러그인 설치 (한 번만)
claude plugin marketplace add qlalfdmlghk1/AI-Automation
claude plugin install ux-team-standard@ux-ai-automation
```

```bash
# 2. 표준을 적용할 프로젝트 루트에서
/team-init
```

- **플러그인**이 워크플로 스킬(`/start`·`/commit`·`/pr`·`/review` 등)을 **전역**으로 제공합니다 — 프로젝트에 `skills/`를 복사하지 않습니다.
- **`/team-init`**이 프로젝트마다 달라지는 파일(`CLAUDE.md`·`rules/`·`settings.json`·`hooks/`·`project.config.md`)을 배치하고, 스택을 감지해 알맞은 rule을 골라 줍니다.

설치 후 체크리스트:

> - `project.config.md`에 프로젝트 값(Jira 키·GitHub·Confluence·기본 브랜치·reviewer 등) 채우기
> - `/mcp`에서 `atlassian`·`figma` MCP 서버 1회 인증
> - `gh auth status`로 GitHub CLI 인증 확인
>
> 자세한 항목별 안내는 [.claude/README.md](.claude/README.md) 참고.

### 배포 채널

| 채널 | 브랜치 | 설치 |
| --- | --- | --- |
| 안정 (기본) | `master` | `claude plugin marketplace add qlalfdmlghk1/AI-Automation` |
| 개발 (미리보기) | `dev` | `claude plugin marketplace add qlalfdmlghk1/AI-Automation@dev` |

브랜치를 지정하지 않으면 default branch(`master`)를 받습니다. 갱신은 `/plugin marketplace update` 후 `/reload-plugins`.

### Codex 사용자

`.codex/` 는 아직 placeholder 입니다. ([.codex/README.md](.codex/README.md) 참고)

---

## 운영자

| 역할   | 담당           |
| ------ | -------------- |
| 담당자 | 김두리, 최원서 |
| 리뷰어 | 여인수         |

설정 추가/변경 제안은 담당자에게 PR 또는 이슈로 공유해 주세요.

---

## 버전 관리

배포물 전체(`.claude/`)를 하나의 버전으로 묶어 **분기 1회** 업데이트합니다.
버전 이력은 [CHANGELOG.md](CHANGELOG.md)에서 관리하며, 릴리스 시
**CHANGELOG 버전 = `git tag` = `rules/team.md` 헤더 버전**을 일치시킵니다.

---

## 관련 문서

- Confluence: AI 코딩 도구 가이드 — `TODO: Confluence URL`
- Confluence: Claude Code 운영 정책 — `TODO: Confluence URL`
- Confluence: Codex 가이드 — `TODO: Confluence URL`

> Confluence 링크는 확정되는 대로 채워 넣습니다.

---

## 저장소

```
git remote add origin https://github.com/qlalfdmlghk1/AI-Automation.git
```
