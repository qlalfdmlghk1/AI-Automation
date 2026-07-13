# ux-ai-automation

UX플랫폼개발팀의 **AI 코딩 도구 모노레포**입니다.
팀에서 실제로 운영 중인 Claude Code / Codex 설정(스킬·룰·훅·세팅)을 한곳에 모아 **팀 표준으로 공유**하기 위한 저장소입니다.

각 팀원은 이 저장소의 설정을 자신의 프로젝트에 복사해 동일한 워크플로우(커밋·MR·리뷰·문서화 등)를 그대로 사용할 수 있습니다.

---

## 폴더 구조

```
ux-ai-automation/
├── README.md            # 이 문서 — 저장소 목적 + 적용 방법
├── CHANGELOG.md         # 배포물 버전 이력 (분기 업데이트 / SemVer)
├── .gitignore           # .claude/settings.local.json(개인 설정) 커밋 제외
├── .mcp.json            # 프로젝트 MCP 서버 정의 (atlassian·figma) — 커밋 공유, /mcp 로 인증
│
├── .claude/             # Claude Code 표준 설정 (다른 프로젝트로 그대로 복사)
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

> `.claude/`는 이 저장소 자체의 Claude Code 설정이기도 하고, 동시에 **다른 프로젝트로 복사해 쓰는 배포물**이기도 합니다.
> `settings.local.json`은 `.gitignore` 처리되어 커밋·배포에 포함되지 않습니다.

---

## 누가 쓰나 / 어떻게 적용하나

### Claude Code 사용자

자신의 프로젝트 루트에서 `.claude/` 폴더를 그대로 복사하면 됩니다.

```bash
# 프로젝트 루트에서 (ux-ai-automation 을 옆에 클론해 둔 상태 기준)
# .claude 폴더 + 루트 .mcp.json 복사 (대상에 없을 때)
cp -r ../ux-ai-automation/.claude ./
cp ../ux-ai-automation/.mcp.json ./

# 설정 예시를 실제 설정으로 활성화
mv ./.claude/settings.example.json ./.claude/settings.json
cp ./.claude/project.config.example.md ./.claude/project.config.md
```

복사 후 체크리스트:

> - `project.config.md`에 프로젝트 값(Jira 키·GitLab·Confluence·기본 브랜치·reviewer 등) 채우기
> - `/mcp`에서 `atlassian`·`figma` MCP 서버 1회 인증 (`.mcp.json` 기반 — 도구 이름은 `mcp__atlassian__*`/`mcp__figma__*`)
> - `CLAUDE.md`·`rules/`의 프로젝트 고유 내용(API 가이드 경로, 컨벤션 등)을 자기 프로젝트에 맞게 수정
>
> 깨끗한 git 클론에서 복사하면 `settings.local.json`(개인 설정)은 따라오지 않습니다. 자세한 항목별 안내는 [.claude/README.md](.claude/README.md) 참고.

### Codex 사용자

`.codex/` 는 아직 placeholder 입니다. ([.codex/README.md](.codex/README.md) 참고)

---

## 운영자

| 역할   | 담당           |
| ------ | -------------- |
| 담당자 | 김두리, 최원서 |
| 리뷰어 | 여인수         |

설정 추가/변경 제안은 담당자에게 MR 또는 이슈로 공유해 주세요.

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
git remote add origin https://dep.dawin.tv/adplatforms/ux-ai-automation.git
```
