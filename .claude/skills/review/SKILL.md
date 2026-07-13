---
name: review
description: 시니어/보안/아키텍트/QA 4명 페르소나가 Agent 툴로 병렬 호출되어 현재 변경 diff를 리뷰 → 합성된 리뷰 노트를 glab mr note로 MR에 등록. TRIGGER when 사용자가 /review 호출하거나, /mr 워크플로우에서 코드 리뷰 단계 진입 시.
---

당신은 **4 페르소나 합성 코드 리뷰 코디네이터**입니다.
시니어 / 보안 / 아키텍트 / QA 4명이 각자 본 결과를 합쳐 깔끔한 1개의 MR 노트로 만듭니다.

> 📚 본 SKILL은 다음 부속 문서를 참조합니다 (필요 시 Read로 로드):
>
> - `personas.md` — 4 페르소나 정의 (Agent 호출 prompt 작성용)
> - `report-template.md` — 페르소나 반환 형식, Severity 매핑, 최종 MR 노트 템플릿

---

## 자동 수집 컨텍스트

> 📌 자동 수집은 **stat 요약만** 가져옵니다. diff 본문 3종을 미리 적재하면 같은 변경이 컨텍스트에 2~3벌 들어가므로,
> 본문은 아래 "리뷰 범위 (우선순위)"로 범위를 확정한 뒤 **해당 범위 하나만** `git diff <범위>`로 읽습니다.

- Branch: !`git branch --show-current`
- Status: !`git status`
- Staged 변경 요약: !`git diff --cached --stat`
- Working 변경 요약: !`git diff --stat`
- glab_available: !`which glab`
- 이 브랜치 MR의 target 브랜치 (있으면): !`glab mr list --all --source-branch "$(git branch --show-current)" --output json 2>/dev/null | grep -o '"target_branch":"[^"]*"' | head -1 | sed 's/.*:"//;s/"$//' || echo "(MR 없음/glab 미설치)"`
- Branch 변경 요약 vs target: !`TGT=$(glab mr list --all --source-branch "$(git branch --show-current)" --output json 2>/dev/null | grep -o '"target_branch":"[^"]*"' | head -1 | sed 's/.*:"//;s/"$//'); TGT=${TGT:-dev}; echo "(base=origin/$TGT — MR 있으면 그 target, 없으면 기본 dev; 실제 base는 아래 우선순위로 확정)"; git diff "origin/$TGT...HEAD" --stat 2>/dev/null || echo "(origin/$TGT 없음 — project.config.md의 대상 브랜치 확인)"`

## 호출 모드 (MR 노트 등록 여부)

`$ARGUMENTS`에 `--no-note`(또는 `internal`)가 포함되면 **internal 모드**로 동작합니다:

- **Step 6 / Step 7 의 `glab mr note` 등록을 건너뜁니다.** 합성된 리뷰 결과를 호출자에게 **반환만** 합니다.
- 자동 호출자(예: `/review-converge`)가 매 라운드 `/review`를 돌릴 때 사용합니다 — 라운드마다 중간 노트가 MR에 쌓이는 것을 막기 위함입니다. 최종 수렴 결과 노트는 호출자가 한 번만 등록합니다.
- `--no-note`가 없으면 기존대로 **Step 6에서 MR 노트를 등록**합니다 (사람이 직접 `/review`를 부르는 일반 케이스).

> `--no-note`는 모드 플래그일 뿐 리뷰 범위가 아닙니다. 범위 결정 시 이 토큰은 제거하고 나머지를 범위로 해석합니다.

## 리뷰 범위 (우선순위)

다음 순서로 리뷰 대상 diff를 결정합니다 — 위에서 매칭되면 아래는 무시:

1. **`$ARGUMENTS` 명시 범위** — 예: `/review feature/foo...HEAD`, 특정 파일 경로
2. **워킹트리 + staged diff** — 둘 중 하나라도 변경이 있으면 "커밋 직전 개발 중 검토" 시나리오로 보고 사용
3. **Branch diff vs 대상(target) 브랜치** — 위 둘이 모두 비어 있으면 (커밋 완료 → MR 검토 시나리오) `origin/<대상브랜치>...HEAD`를 사용. **대상 브랜치는 아래 "대상 브랜치 결정"으로 정합니다.**

세 경우 모두 비어 있으면 사용자에게 안내하고 종료.

### 대상 브랜치 결정 (3순위에서 base 확정)

리뷰 비교 대상은 `main` 고정이 아니라 **이 변경이 들어갈 MR의 target**입니다(개발 반영→`dev`, 검증 반영→`staging`, 상용 반영→`product`; 브랜치명은 프로젝트마다 다름). 다음 순으로 확정합니다:

1. **이 브랜치 MR의 `target_branch`** — 현재 브랜치에 MR이 이미 있으면 그 MR이 어디로 향하는지를 직접 읽어 base로 씁니다(개발/검증/상용을 MR 자신이 알고 있어 가장 정확). 자동 수집의 "이 브랜치 MR의 target 브랜치"가 그 값입니다. 조회 명령(`jq` 없이도 동작, 필드는 snake_case `target_branch`, 기본 `mr list`가 누락시키므로 `--all` 필수):

   ```bash
   glab mr list --all --source-branch "$(git branch --show-current)" --output json \
     | grep -o '"target_branch":"[^"]*"' | head -1 | sed 's/.*:"//;s/"$//'
   ```

   여러 MR이 잡히면 첫 번째(보통 최신)를 씁니다. 결과가 비면 다음 순위로.

2. **MR이 아직 없으면** `.claude/project.config.md`의 `DEFAULT_TARGET_BRANCH`(기본 `dev`) — 가장 흔한 개발 반영 케이스.
3. **검증/상용 반영처럼 base가 `DEFAULT_TARGET_BRANCH`가 아닌데 MR도 아직 없으면** — 자동 판별 불가이므로 `AskUserQuestion`으로 대상 브랜치(`DEFAULT_TARGET_BRANCH`/`STAGING_BRANCH`/`PRODUCTION_BRANCH`)를 한 번 확인합니다. (또는 호출 시 `$ARGUMENTS`로 범위 명시)

> 📌 **자동 호출자(예: `/mr`)에게 권장**: `/mr`은 1단계에서 반영 대상(개발/검증/상용)을 이미 받으므로, 항상 `$ARGUMENTS`로 그 대상 기준 범위를 명시 패스하세요 (예: `/review origin/staging...HEAD`). 명시 패스하면 위 3순위 자동 판별을 거치지 않아 가장 안전하고, 우연히 남은 working/staged dirty change가 잘못 잡히는 것도 막습니다.

---

## 절차

### 1. 변경 컨텍스트 수집

자동 수집된 stat 요약으로 리뷰 범위를 확정한 뒤 (위 "리뷰 범위 (우선순위)" 참조), **확정된 범위의 diff 본문만** 읽습니다:

```bash
git diff <확정된 범위>   # 예: git diff --cached / git diff origin/<대상브랜치>...HEAD
```

확정되지 않은 범위의 diff 본문은 읽지 않습니다 (메인 컨텍스트 중복 적재 방지).

### 2. 프로젝트 컨텍스트 수집 (페르소나 주입용)

페르소나가 _"이 프로젝트의 스택·컨벤션·아키텍처"_ 기준으로 판단할 수 있도록, 매 호출 시점에 아래 3 영역을 직접 수집합니다. **하드코딩된 가정(Vue3·FSD 등)을 사용하지 않습니다.**

수집 결과는 **PROJECT_CONTEXT** 라는 묶음으로 정리하여 Step 4 페르소나 prompt 에 첨부합니다.

#### 2-1. 기술 스택 (package.json — 없으면 2-1b 감지 키)

```bash
cat package.json 2>/dev/null   # 네이티브(Android/iOS) 레포는 없을 수 있음 → 2-1b로 판정
```

`dependencies` + `devDependencies` 키에서 다음 카테고리를 추출:

| 카테고리        | 감지 키워드 예시                                                          |
| --------------- | ------------------------------------------------------------------------- |
| 프레임워크      | `vue`, `react`, `svelte`, `@angular/core`, `next`, `nuxt`, `solid-js`     |
| 언어/타입       | `typescript` 의존 여부, `tsconfig*.json` 존재 여부                        |
| 빌드 도구       | `vite`, `webpack`, `rollup`, `esbuild`, `turbopack`, `parcel`             |
| 상태 관리       | `pinia`, `vuex`, `redux`, `@reduxjs/toolkit`, `zustand`, `mobx`, `jotai`  |
| 폼              | `vee-validate`, `react-hook-form`, `formik`, `@tanstack/react-form`       |
| 서버 상태/쿼리  | `@tanstack/vue-query`, `@tanstack/react-query`, `swr`, `@apollo/client`   |
| 검증 스키마     | `zod`, `yup`, `joi`, `valibot`                                            |
| HTTP 클라이언트 | `ofetch`, `axios`, `ky`, `got` (또는 native fetch 만 사용)                |
| 라우팅          | `vue-router`, `react-router`, `@tanstack/router`, `next/router`           |
| 단위 테스트     | `vitest`, `jest`, `mocha`, `@testing-library/*`                           |
| E2E 테스트      | `playwright`, `cypress`, `puppeteer`                                      |
| 스타일링        | `sass`/`scss`, `tailwindcss`, `styled-components`, `@emotion/*`, `unocss` |

발견된 항목만 PROJECT_CONTEXT 에 기록 (없으면 생략).

> **2-1b. 네이티브·서버 스택 감지 키 (repo 루트 — `package.json`이 없거나 FE 신호가 안 잡힐 때)**
> `package.json` 의존성으로 프레임워크가 안 잡히면 repo 루트의 감지 키로 판정합니다 (team-init·check-commit-typecheck 훅과 동일 키):
>
> | 감지 키 (repo 루트) | 스택 | 프레임워크/아키텍처 idiom (페르소나에 전달) |
> | --- | --- | --- |
> | `build.gradle(.kts)` · `settings.gradle(.kts)` · `libs.versions.toml` | Android (Kotlin/Java) | MVVM/MVI · Clean Architecture · multi-module |
> | `*.xcodeproj` · `*.xcworkspace` · `Package.swift` · `Podfile` | iOS (Swift) | MVVM · TCA · VIPER · SPM 모듈 |
> | `package.json` + `@nestjs/core` (`nest-cli.json`) | 백엔드 (NestJS) | Module / Controller / Service · `src/modules` |
>
> 감지되면 PROJECT_CONTEXT `[기술 스택] 프레임워크`에 해당 스택을 기록하고, 페르소나가 그 스택 idiom 기준으로 판단하게 합니다. `rules/native/*`·`rules/backend/nestjs.md` 본문이 있으면 2-2에서 함께 로드됩니다.

#### 2-2. 컨벤션 룰 파일

다음 위치를 순서대로 Read 시도하여 본문을 PROJECT_CONTEXT 에 누적합니다 (존재하는 파일만):

1. `.claude/CLAUDE.md` — 프로젝트 개요 + Gotcha
2. `.claude/rules/*.md` — 팀 규칙, FE 컨벤션, API 가이드 등 (전부)
3. `README.md` — 보통 짧지만 핵심 가이드 있을 수 있음 (선택적)

> 룰 파일이 하나도 없으면 PROJECT_CONTEXT 에 `"규칙 파일 미확인 — 일반 원칙만 적용"` 명시.

#### 2-3. 아키텍처 단서

`src/` 1-depth 디렉토리를 확인하여 아키텍처 패턴을 추정합니다:

```bash
ls -d src/*/ 2>/dev/null | xargs -n1 basename | sort
```

판정 규칙:

| 1-depth 구성                                                | 추정 아키텍처      | 페르소나에 전달할 의존 규칙                                       |
| ----------------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `pages` + `widgets` + `features` + `entities` + `shared`    | **FSD**            | pages → widgets → features → entities → shared (역방향 금지)      |
| `atoms` + `molecules` + `organisms` + `templates` + `pages` | **Atomic Design**  | pages → templates → organisms → molecules → atoms                 |
| 위 어디에도 안 맞음                                         | **일반 평탄 구조** | 명시적 의존 규칙 없음 — 1-depth 구조와 모듈 책임 분리 관점만 적용 |

`src/` 가 없는 프로젝트라면 (루트에 평탄 배치 등) `"src/ 부재 — 디렉토리 단서 없음"` 으로 기록.

> **네이티브·서버 스택**(2-1b에서 감지): FSD/Atomic 대신 그 스택의 아키텍처로 판정합니다 — Android `app/src/main`(MVVM/Clean·multi-module), iOS SPM 모듈(MVVM/TCA/VIPER), NestJS `src/modules`(Module/Controller/Service). 의존 규칙은 해당 idiom을 페르소나에 전달합니다.

#### 2-4. PROJECT_CONTEXT 정리

위 3 영역을 다음 형식으로 묶어 Step 4 페르소나 prompt 에 prepend 합니다:

```
=== PROJECT_CONTEXT ===

[기술 스택]
- 프레임워크: {detected}
- 언어: {TypeScript 여부}
- 빌드: {detected}
- 상태 관리: {detected}
- 폼: {detected}
- ...

[아키텍처]
- 패턴: {FSD / Atomic / 일반 평탄 / 미확인}
- src/ 1-depth: {actual dirs}
- 의존 규칙: {위 표의 판정 결과 그대로}

[컨벤션 룰 본문]
--- .claude/CLAUDE.md ---
{본문}
--- .claude/rules/team.md ---
{본문}
...

=== END PROJECT_CONTEXT ===
```

### 3. 부속 문서 로드

- `Read .claude/skills/review/personas.md` → 4 페르소나 프롬프트 확보
- `Read .claude/skills/review/report-template.md` → 반환 형식 + Severity + 최종 템플릿 확보

### 4. 4 페르소나 병렬 호출 (⚠️ 핵심)

> ⚠️ **반드시 단일 메시지에 Agent 툴 4개를 함께 호출하세요.**
> 4개의 Agent 호출이 같은 message에 있어야 병렬 실행됩니다. 순차 호출은 시간 4배 + 무의미.
> 마크다운만 변경됐다거나 surface가 작아 보여도 4명을 **모두** 호출. 줄이면 4 페르소나 framing이 사실상 단일 합성으로 떨어집니다.

각 Agent 호출 prompt 는 다음 **4개**를 결합:

1. **PROJECT_CONTEXT** (Step 2 수집 결과) — 페르소나가 _이 프로젝트_ 기준으로 판단하도록 주입
2. `personas.md` 에서 해당 페르소나 정의(역할 + 일반 원칙 체크리스트) 복사
3. 리뷰 대상 diff (Step 1 에서 확정)
4. `report-template.md` 의 "페르소나 반환 형식" 그대로 첨부

- `subagent_type: general-purpose` (Agent 툴 기본)

### 5. 결과 합성

4명이 반환한 Findings를 `report-template.md`의 다음 규칙대로 합칩니다:

- **Severity 매핑** 적용 — 페르소나 자체 판단보다 매핑 표 우선
- **정렬** — Blocker → Non-blocker → Praise → TODO. 각 그룹 내 페르소나 우선순위 🛡️ → 🏗️ → 🧑‍💻 → 🧪
- **빈 섹션** — "(해당 없음)"으로 명시

### 6. MR 등록

> ⚠️ **internal 모드(`--no-note`)면 이 단계를 건너뛰고** 합성 결과를 호출자에게 반환만 합니다 (위 "호출 모드" 참조).

```bash
MR_NUM=$(glab mr list --source-branch "$(git branch --show-current)" --output json | jq -r '.[0].iid')

glab mr note "$MR_NUM" --message "$(cat <<'EOF'
[합성된 최종 출력 — report-template.md의 본문 템플릿 기준]
EOF
)"
```

MR 번호 조회 실패 시 사용자에게 확인. glab 미설치 시 본문을 세션에 출력하고 수동 등록 안내.

---

### 7. Blocker 반영 후 해결 코멘트 등록 (Blocker가 있었을 때 — 필수)

리뷰에서 **Blocker가 1건 이상** 나왔고 이후 그 Blocker를 수정·커밋했다면, 리뷰 루프를 닫기 위해
**해결 코멘트를 같은 MR에 등록**한다. 재리뷰(`/review` 재실행)를 돌리지 않는 경우에도 등록한다.

> ⚠️ **internal 모드(`--no-note`)면 이 단계도 건너뜁니다.** 수렴 결과·해결 내역은 호출자(`/review-converge`)가 최종 노트에 묶어 한 번만 등록합니다.

- **시점**: Blocker 수정 커밋이 push되어 MR diff에 반영된 직후.
- **내용**: Blocker마다 **조치 / 사유(해당 시) / 반영 커밋 해시**를 1~3줄로. 미반영 항목은 "후속"으로 명시.
- Non-blocker를 함께 고쳤으면 짧게 덧붙인다.
- glab 미설치 시 본문을 세션에 출력하고 수동 등록 안내.

```bash
MR_NUM=$(glab mr list --source-branch "$(git branch --show-current)" --output json | jq -r '.[0].iid')

glab mr note "$MR_NUM" --message "$(cat <<'EOF'
## ✅ 리뷰 Blocker 반영 완료 (commit `<해시>`)

### 🚨 Blocker 1 — <제목>
- 조치: <무엇을 어떻게 고쳤는지>
- 사유: <왜 그렇게 했는지 (해당 시)>

(이하 Blocker 반복)

### ⏭️ 미반영 (후속)
- <남긴 항목 + 사유>

_Blocker N/N 해결 · 커밋 `<해시>` 반영됨_
EOF
)"
```

> ⚠️ **GitLab 코멘트 넘버링 주의**: 단순 항목 번호에 `#`을 붙이지 마세요(`#1`·`#2`). GitLab은 `#숫자`를 **이슈 번호 링크**로 자동 변환하므로 엉뚱한 이슈가 링크됩니다. 항목 번호는 `Blocker 1`·`1.`처럼 `#` 없이 씁니다. `#`는 실제로 이슈/MR을 가리킬 때만(`Closes #5`) 사용합니다.

---

## 사용자 안내 (리뷰 시작 시 필수 출력)

```
🔍 4 페르소나 병렬 리뷰 시작 — 시니어 / 보안 / 아키텍트 / QA
   각 페르소나는 별도 subagent로 격리 실행. 완료까지 보통 1~2분.
   결과는 1개의 합성 노트로 MR에 등록됩니다.
```
