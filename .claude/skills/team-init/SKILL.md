---
name: team-init
description: 팀 표준 .claude 적용기 — 프로젝트 스택을 감지해 알맞은 rules·CLAUDE.md·settings·hooks·project.config를 프로젝트에 깔고 고유값을 채운다. 기존에 표준 자산이 로컬에 있으면, 전역(플러그인)이 실제 제공하는 것에 한해 프로젝트 사본을 정리(삭제)한다. 워크플로 스킬(/start·/commit·/mr·/review 등)은 플러그인으로 배포되므로 이 스킬은 "프로젝트마다 달라지는 파일 + 정리"를 담당한다. TRIGGER when 사용자가 "/team-init" 호출 또는 "팀 표준 적용", "claude 셋업", "이 프로젝트에 표준 깔아줘", "claude 설정 정리"를 요청할 때. DO NOT TRIGGER 자동 실행 금지 — 파일을 생성/삭제하므로 반드시 사용자가 직접 호출할 때만.
argument-hint: '(인자 없음 — 모든 값은 단계별로 감지·확인)'
allowed-tools: Bash(git:*), Bash(which:*), Bash(node:*), Bash(cat:*), Bash(ls:*), Read, Write, Edit, Glob, Grep, AskUserQuestion
---

## Context (자동 수집)

- target_root: !`git rev-parse --show-toplevel`
- current_branch: !`git branch --show-current`
- git_user: !`git config user.name`
- git_remote: !`git remote get-url origin 2>/dev/null || true`
- has_package_json: !`test -f package.json && echo yes || echo no`
- has_existing_claude: !`test -f .claude/CLAUDE.md && echo yes || echo no`

> 스택 감지(Android/iOS/NestJS 등)는 여기서 셸 명령으로 하지 않습니다 — 중괄호 그룹·따옴표 조합이 Claude Code 권한 검사기에 "expansion obfuscation"으로 오인 차단된 사례가 있어, Stage 1에서 Glob/Grep 도구로 수행합니다.

---

당신은 **팀 표준 `.claude` 적용기**입니다.
대상 프로젝트를 분석해, 그 스택에 맞는 팀 표준 설정 파일을 프로젝트의 `.claude/`에 깔고 프로젝트 고유값을 채웁니다.

### 역할 경계 (중요)

- **이 스킬이 담당**: `CLAUDE.md`, `rules/`, `settings.json`, `project.config.md`, `hooks/`, `DOMAIN.md`(도메인 인덱스)와 `domain/_TEMPLATE.md`(도메인 파일 양식) — **프로젝트마다 달라지거나 프로젝트에서 실행되는 파일**.
  - 단, `domain/{domain}.md` **정의 본문은 프로젝트 고유 지식**이므로 생성/덮어쓰기/정리 대상에서 제외(항상 보존). 이 스킬은 인덱스와 양식만 제공.
- **이 스킬이 담당하지 않음**: 워크플로 스킬(`/start`·`/commit`·`/mr`·`/review`·`/note`·`/tech-doc`·`/secure-review`·`/organize-imports`·`/e2e`) — 이들은 **플러그인(마켓플레이스)으로 배포**되어 전역에서 동작하므로 프로젝트에 복사하지 않습니다.
  - 단, 플러그인 미도입 프로젝트라면 Stage 3 계획에서 "스킬도 함께 복사" 옵션을 제시합니다(전환기 폴백).

### 템플릿 원본 (TEMPLATE_ROOT) 해석

복사할 원본 파일의 위치를 다음 우선순위로 정합니다.

1. 플러그인으로 실행 중이면 `${CLAUDE_PLUGIN_ROOT}/.claude` — 팀 표준 레포가 플러그인으로 설치된 경우.
2. 환경에 팀 표준 레포가 클론되어 있으면 그 경로의 `.claude` (사용자에게 경로 확인).
3. 둘 다 불명확하면 사용자에게 **팀 표준 레포(`ux-ai-automation`) 로컬 경로**를 한 번 묻고, 그 하위 `.claude`를 TEMPLATE_ROOT로 씁니다.

> TEMPLATE_ROOT와 대상 프로젝트 루트가 **같으면**(= 팀 표준 레포 자신에서 실행) 자기 자신을 덮어쓰는 셈이므로 즉시 중단하고 안내합니다.

---

## 실행 절차 (5단계, 각 단계 사용자 승인)

### Stage 1: 분석 (읽기 전용)

대상 프로젝트를 훑어 다음을 파악합니다. **이 단계에서는 어떤 파일도 쓰지 않습니다.**

1. **스택 감지** — repo 루트의 **감지 키**를 위에서부터 순서대로 판정합니다. `package.json` 유무 하나로 "앱이냐"를 판단하지 않습니다 — 네이티브 앱은 `package.json`이 없어도 앱이므로, **네이티브·서버 신호를 "비-앱"보다 먼저** 확인합니다.

   **감지 방법 (강제)** — 셸 raw 명령(Bash) 대신 **Glob/Grep/Read 도구**로 확인합니다 (권한 검사기 오인 차단 방지):

   - Android: Glob `build.gradle`, `build.gradle.kts`, `settings.gradle`, `settings.gradle.kts`, `libs.versions.toml`
   - iOS: Glob `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, `Podfile`
   - NestJS: Glob `nest-cli.json` + package.json이 있으면 Grep으로 `@nestjs/core` 포함 여부 확인
   - FE(Vue/Angular): Read `package.json` → dependencies/devDependencies 판독

   **미감지 폴백 (강제)** — 개별 감지 단계가 실패해도(도구 오류·권한 차단 등) **스킬을 중단하지 않습니다.** 해당 신호를 "미감지"로 기록하고 다음 신호로 계속 진행합니다. 모든 신호가 미감지면 "비-앱"으로 두지 말고 `AskUserQuestion` 카드로 스택을 사용자에게 확인합니다.

   | 감지 신호 (repo 루트, 위에서부터 우선) | 판정 | 적용 rule |
   | --- | --- | --- |
   | `build.gradle(.kts)` · `settings.gradle(.kts)` · `libs.versions.toml` | Android (Kotlin/Java) | `rules/native/android-convention.md` |
   | `*.xcodeproj` · `*.xcworkspace` · `Package.swift` · `Podfile` | iOS (Swift) | `rules/native/ios-convention.md` |
   | `package.json` + `@nestjs/core` (`nest-cli.json`) | 백엔드 (NestJS) | `rules/backend/nestjs.md` |
   | `vue` ^3 + `typescript` | Vue3 / TypeScript | `rules/fe/vue3-typescript.md` |
   | `vue` ^3 (TS 없음) | Vue3 / JavaScript | `rules/fe/vue3-typescript.md` (+ JS 주의 메모) |
   | `vue` ^2 | Vue2 / JavaScript | `rules/fe/vue2-javascript.md` |
   | `angular` (AngularJS/legacy) | 레거시 | `rules/fe/angularjs-legacy.md` |
   | 디자인 시스템/퍼블리싱 신호 | 퍼블리싱 | `rules/fe/publishing-design-system.md` |
   | 위 신호 모두 없음 (문서/스크립트 레포) | 비-앱 | FE rule 생략, team.md만 |

   - FE(Vue/Angular) 판정은 `package.json`의 dependencies/devDependencies를 근거로 봅니다. 네이티브·서버 감지 키는 위 "감지 방법"의 Glob/Grep 결과를 사용합니다.
   - `rules/native/*`·`rules/backend/nestjs.md` 본문은 별도 스토리(스택별 규칙 콘텐츠)에서 작성됩니다. 아직 파일이 없으면 Stage 3 계획에 "rule 본문 미작성 — 후속 스토리"로 표시하고, Stage 5 점검의 rule 경로 존재 확인에서 잡습니다.
   - 판정이 애매하면 추정 결과를 **AskUserQuestion 카드**로 확인합니다 (예: "Vue3 + TypeScript로 보입니다. 맞나요?").
   - 모노레포(여러 package.json)면 주요 앱 경로를 사용자에게 한 번 확인합니다.

2. **기존 `.claude/` 상태** — 대상에 이미 `.claude/`가 있으면 어떤 파일이 있는지, 사용자가 손댄 흔적(placeholder가 실제값으로 채워졌는지)을 파악해 Stage 4의 keep/merge/replace 판단 근거로 둡니다.

2-1. **정리(cleanup) 후보 인벤토리** — 기존 프로젝트가 이미 표준 자산을 로컬에 갖고 있으면(예: `.claude/skills/`, 구버전 배포 방식의 `.claude/commands/`), **전역(플러그인)이 실제로 대체 제공하는 것만** 정리 후보로 잡습니다.

   > 🔒 **정리 원칙 (강제): "플러그인이 실제로 제공하는 것만 제거."**
   > 무엇이 전역에서 제공되는지는 **런타임에 확인**합니다 — **팀 표준 플러그인**의 컴포넌트 목록(`claude plugin details <plugin>` 또는 설치된 플러그인 인벤토리)을 근거로 씀. 다른 플러그인의 스킬은 매칭 모집단이 아닙니다. **인벤토리를 얻지 못하면(플러그인 미설치·명령 실패) 정리 후보는 0건(전부 유지)** — 이름 추측으로 후보를 잡지 않습니다.
   > - 전역에 **스킬 X가 있음** + 프로젝트에 `skills/X`가 있음 → **정리 후보(삭제 예정)**.
   > - 전역에 **스킬 X가 있음** + 프로젝트에 `commands/X.md`가 있음 → **정리 후보(삭제 예정)**. 구버전 커맨드 배포 방식의 잔재로, 같은 이름은 **로컬 커맨드가 플러그인 스킬을 가려**(로컬 우선 실행) 팀 표준 업데이트가 반영되지 않으므로 skills와 동일 기준으로 정리합니다. 커맨드는 **`.md` 파일 단위**로만 판정합니다 — `commands/` 하위 디렉터리는 통째로 후보로 잡지 말고 내부 파일별로 이름을 대조합니다.
   > - 동명이라도 **내용이 표준본(구버전 배포 원본)과 다르면**(프로젝트가 커스텀한 흔적) 삭제 예정이 아니라 **"기존과 충돌 — 사용자 선택"**으로 분류합니다 (2번의 "사용자 손댄 흔적" 검사와 동일 원칙 — 의도적 오버라이드를 소리 없이 잃지 않기 위함).
   > - 플러그인에 **없는 이름**의 로컬 커맨드(프로젝트 전용 커맨드) → hooks처럼 **대체물이 없으므로 삭제 금지**(유지).
   > - 전역에 **훅이 0개** → 프로젝트 `hooks/`는 **대체물이 없으므로 절대 삭제 금지**(유지 + "전역 미제공" 플래그).
   > - `rules/`·`CLAUDE.md`·`project.config.md`·`settings.json` → 프로젝트 전속이라 **정리 대상 아님**(항상 유지).
   >
   > ⚠️ **팀 전제**: 프로젝트에서 스킬·커맨드를 제거하면 **플러그인 미설치 팀원은 그 프로젝트에서 해당 스킬/커맨드를 잃습니다.** 정리(삭제)는 **팀 전원이 플러그인을 쓰기로 합의된 경우에만** 안전합니다. 합의 여부가 불명확하면 Stage 3에서 사용자에게 확인합니다.

3. **자동 도출 가능한 project.config 값** — 묻지 않고 환경에서 뽑습니다:
   - `GITLAB_PROJECT_URL` / `GITLAB_HOST`: `git remote get-url origin`에서 파싱
   - `GITLAB_USERNAME` / `DEFAULT_REVIEWER`: `git config user.*` 또는 `glab api user`(있으면)
   - `PROJECT_NAME`: 레포 디렉터리명
   - `BASE_BRANCH`: 현재 기본 브랜치 추정(`git symbolic-ref refs/remotes/origin/HEAD` 등)

4. **(선택) 컨벤션 측정** — 적용할 rule 문서의 **핵심 규칙을 기준으로** 실제 코드를 표본 측정합니다. 스택별 검사 패턴을 따로 박지 말고, 해당 rule의 핵심 항목(예: TS `any` 사용 빈도, 이벤트 네이밍 표기)을 세어 "신규 코드 기준"을 CLAUDE.md에 메모할 근거로만 씁니다. 측정이 부담되면 건너뜁니다.

분석 결과를 **요약해서 사용자에게 보여주고** Stage 2로 넘어갑니다.

---

### Stage 2: 적용 범위 결정

Stage 1 결과를 바탕으로 **무엇을 깔지** 목록을 확정합니다.

- 공통: `CLAUDE.md`, `rules/team.md`, `rules/project.md`, `settings.json`(example→실파일), `project.config.md`(example→실파일), `DOMAIN.md`(인덱스)·`domain/_TEMPLATE.md`(양식)
  - 대상에 이미 `domain/{domain}.md` 정의 본문이 있으면 **건드리지 않음**(프로젝트 고유 지식). 인덱스(`DOMAIN.md`)가 이미 있으면 keep/merge로 처리.
- 스택별: Stage 1에서 매핑된 rule 1개 — FE(`rules/fe/*`)·네이티브(`rules/native/*`)·백엔드(`rules/backend/*`) 중 감지된 것(또는 비-앱이면 생략). rule 본문이 아직 없는 스택이면 경로만 계획에 남기고 후속 스토리로 표시.
- hooks: `check-commit-typecheck.js`, `notify-sensitive-edit.js` (프로젝트에서 실행되는 표준 훅)
  - 레거시/비-Node 프로젝트면 typecheck 훅은 `TYPECHECK_COMMAND` 미설정 시 자동 skip되도록 두고, 그 사실을 계획에 명시.
- 워크플로 스킬: **기본 미포함**(플러그인 배포). 플러그인 미도입이면 "스킬도 복사" 옵션 제시.

---

### Stage 3: 계획 제시 (승인 게이트, 필수)

만들 파일 / 바꿀 파일 / 건너뛸 파일을 **표로 명확히** 보여주고 승인받습니다. 파일을 쓰기 전 유일한 게이트입니다.

```
📋 team-init 적용 계획 — {PROJECT_NAME} ({감지된 스택})

[신규 생성]
  .claude/CLAUDE.md
  .claude/rules/team.md
  .claude/rules/{fe|native|backend}/{스택}.md   (감지된 스택 경로)
  .claude/settings.json           (settings.example.json 기반)
  .claude/project.config.md       (도출값 자동 채움 + 미정값 표시)
  .claude/hooks/...

[기존과 충돌 — 사용자 선택 필요]
  .claude/CLAUDE.md            (이미 존재, 사용자 수정 흔적 있음 → 유지/병합/교체)
  .claude/commands/review.md   (플러그인 스킬과 동명이지만 내용 커스텀 → 유지/병합/교체)

[삭제 예정 — 정리(cleanup), 전역에 대체물 확인됨]
  .claude/skills/start         (플러그인이 제공 → 프로젝트 사본 불필요)
  .claude/skills/commit        (플러그인이 제공)
  .claude/skills/...           (플러그인 인벤토리에 있는 것만)
  .claude/commands/commit.md   (구버전 커맨드 배포 잔재 — 플러그인 스킬과 동명, 로컬이 플러그인을 가림)
  .claude/commands/...         (플러그인 인벤토리에 같은 이름의 스킬이 있는 것만)

[삭제 안 함 — 대체물 없음/프로젝트 전속]
  .claude/hooks/...            (전역 미제공 → 유지)
  .claude/commands/{프로젝트 전용}.md (플러그인에 없는 이름 → 유지)
  .claude/rules/, CLAUDE.md, project.config.md, settings.json (프로젝트 전속)

[건너뜀]
  워크플로 스킬 신규 복사 (플러그인으로 배포됨)
```

- **삭제 예정이 1개라도 있으면**, 실행 전 두 가지를 반드시 확인(게이트):
  1. **팀 합의 확인** — `AskUserQuestion`: "이 프로젝트는 팀 전원이 플러그인을 쓰기로 했나요? (아니오면 미설치 팀원이 스킬/커맨드를 잃습니다)". "아니오/모름"이면 삭제를 건너뛰고 추가만 진행.
  2. **복구 가능성 확인** — 대상이 git 레포이고 워킹트리가 **깨끗한지**(`git status`) 확인. 깨끗하지 않으면, 삭제 전 사용자에게 "현재 변경을 커밋/스태시 후 진행"을 안내(삭제는 git 추적 삭제로 수행해 diff/커밋으로 되돌릴 수 있게 함). `.bak`은 git 레포에선 만들지 않음(git이 곧 백업).
- 충돌 파일이 있으면 **파일별로** `AskUserQuestion` 카드로 유지/병합/교체를 묻습니다.
- 자유 입력(미도출 config 값 등)은 평문으로, 보기 선택은 카드로 (`/start`의 입력 방식 원칙 동일).

`AskUserQuestion` 카드 1회로 전체 진행 승인:
- question: `이 계획대로 적용할까요?`
- options: `{ 이대로 적용 } / { 일부 수정 — 다음 메시지에서 지정 }`

"일부 수정"이면 종료하지 말고 무엇을 바꿀지 평문으로 받은 뒤 계획을 갱신해 다시 승인받습니다.

---

### Stage 4: 실행 (승인된 것만)

승인된 파일만 TEMPLATE_ROOT에서 대상 프로젝트로 적용합니다.

1. **복사 + 치환** — `CLAUDE.md`·`project.config.md`의 `{PLACEHOLDER}`를 Stage 1 도출값으로 채웁니다. 도출 못 한 값은 `{...}` 그대로 두고 Stage 5 점검에서 잡습니다.
2. **example → 실파일** — `settings.example.json`→`settings.json`, `project.config.example.md`→`project.config.md`. 단, **대상이 팀 표준 배포 소스 레포가 아닌 일반 프로젝트**이므로 이 두 파일은 커밋 대상(팀 공유)입니다.
3. **충돌 처리** — Stage 3에서 받은 선택대로:
   - **유지**: 손대지 않음
   - **교체**: 백업(`{파일}.bak`) 후 새 표준으로 덮어씀
   - **병합**: 표준의 새 항목만 보여주고 사용자 확인 후 반영. 사용자가 채운 값/커스텀은 보존.
4. **구조가 표준과 다른 프로젝트** — 권장 아키텍처를 아직 안 쓰는 프로젝트면 rule은 표준대로 두되, `CLAUDE.md`에 "현재 구조는 이렇고, 신규 코드부터 점진 적용"을 명시합니다.

5. **정리(cleanup) 수행** — Stage 3의 두 게이트(팀 합의 + 워킹트리 깨끗)를 모두 통과한 경우에만:
   - 삭제 예정 목록(전역 대체 확인된 `skills/X`·`commands/X.md`)을 **git 추적 삭제**로 제거(`git rm` 또는 삭제 후 스테이징)해 diff에 남깁니다.
   - 삭제 후 **즉시 재확인** — 제거한 스킬/커맨드와 같은 이름이 전역(플러그인)에서 여전히 호출 가능한지 인벤토리로 확인. 하나라도 전역에서 안 보이면 **삭제를 롤백**(git restore)하고 사용자에게 보고.
   - 대체물 없는 항목(훅, 플러그인에 없는 이름의 프로젝트 전용 커맨드 등)은 손대지 않음.

> 멱등성: 같은 프로젝트에 다시 실행해도 이미 채워진 값/커스텀을 덮지 않고, 표준이 바뀐 부분만 골라 보여줍니다. 정리도 이미 제거된 항목은 다시 건드리지 않습니다.

---

### Stage 5: 점검

적용 후 빠진 곳이 없는지 확인합니다.

- `CLAUDE.md`·`project.config.md`에 남은 `{PLACEHOLDER}`가 있는지 grep → 있으면 사용자에게 채우라고 안내.
- `CLAUDE.md`가 참조하는 rule 경로(`.claude/rules/...`)가 **모두 실제로 존재**하는지 확인. (경로 표현이 여러 곳에 흩어져 있을 수 있으니 **모든 언급**을 검사 — 한 곳만 고치고 놓치는 실수 방지)
- **Stage 2에서 적용하기로 한 rule 경로**도 실제로 존재하는지 확인 (CLAUDE.md 언급 여부와 무관). 감지표가 가리키는 rule 본문이 아직 없는 스택(예: `rules/native/*`·`rules/backend/nestjs.md` 미작성)이면 **신규 생성 실패를 조용히 넘기지 말고**, "rule 본문 미작성 → 후속 스토리, 이번엔 team.md만 적용(안전 degrade)"으로 사용자에게 명시합니다. (이 변경이 없애려는 "침묵 통과"를 스킬 레이어에서도 반복하지 않기 위함)
- hooks가 `settings.json`에 올바로 연결됐는지, typecheck 훅이 `TYPECHECK_COMMAND` 없을 때 skip되는지 확인.
- 플러그인 미도입 프로젝트면 워크플로 스킬 사용 전제(플러그인 설치 또는 스킬 복사 여부)를 안내.
- **정리한 경우** — 제거한 스킬·커맨드가 전역에서 호출되는지 최종 확인하고, "프로젝트에서 빠진 파일 목록(skills/commands 구분) + 이제 플러그인에서 제공됨"을 요약. 이 프로젝트를 받는 팀원은 **플러그인 설치가 필수**임을 명시.

마지막으로 적용 요약과 다음 할 일(미정 config 값 채우기, `/mcp` 인증, `glab auth status`)을 출력합니다.

---

## 안전 원칙

- 자동 실행 금지 — 사용자 직접 호출 시에만.
- 파일을 덮어쓰기 전 항상 확인. 교체 시 `.bak` 백업(git 레포면 git이 백업이므로 생략).
- 요청 범위 밖 파일은 건드리지 않음.
- 실제 토큰/쿠키/고객정보는 어떤 파일에도 쓰지 않음.
- **정리(삭제)는 "전역에 대체물 확인됨" + "팀 합의" + "git 깨끗" 3조건을 모두 만족할 때만.** 삭제 후 대체물 호출 불가가 확인되면 즉시 롤백.
