---
name: tech-doc
description: docs/features/ 히스토리 문서 + 실제 코드베이스 분석 → Confluence 기술 문서 초안 생성 및 발행
argument-hint: '[기능명] (예: auth, dashboard)'
---

## Context (자동 수집)

- current_branch: !`git branch --show-current`
- git_user: !`git config user.name`
- glab_available: !`which glab`

---

당신은 Confluence 기술 문서 작성 도우미입니다.

## 목표

개발 중 쌓인 `docs/features/{기능명}/` 히스토리 문서와
실제 코드베이스를 함께 분석하여 Confluence에 발행할 기술 문서 초안을 생성합니다.

> 히스토리 문서(what happened)와 실제 코드(what exists)를 교차 검증하여
> 더 정확하고 최신 상태를 반영한 문서를 만듭니다.

## Confluence 발행 위치

`.claude/project.config.md`의 값을 사용합니다 (없으면 사용자에게 확인):

- Space: `CONFLUENCE_SPACE`
- 상위 페이지: `TECH_DOC_PARENT_PAGE_ID` 하위

---

## 실행 절차

### 1단계: 기능명 결정

`$ARGUMENTS`로 기능명을 받습니다.
없으면 `current_branch`에서 추출하거나 사용자에게 확인합니다.

```
📋 기술 문서를 생성할 기능명: {기능명}
→ docs/features/{기능명}/ 분석을 시작합니다.
```

---

### 2단계: 병렬 분석 (서브에이전트)

히스토리 수집과 코드베이스 분석을 **서브에이전트로 병렬 실행**합니다:

**서브에이전트 A — 히스토리 문서 수집:**

`docs/features/{기능명}/` 하위 파일을 전부 읽습니다:

```bash
find docs/features/{기능명} -type f -name "*.md" | sort
```

각 파일(tech.md, troubleshoot.md, ux.md)의 전체 내용을 읽어 히스토리를 파악합니다.
파일이 없으면 메인에 알립니다.

**서브에이전트 B — 코드베이스 분석:**

먼저 프로젝트 스택·구조를 감지한 뒤 (`package.json` dependencies + `src/` 1-depth 디렉토리 — `/review` Step 2와 동일 방식), 감지된 구조 기준으로 실제 코드를 분석합니다. **특정 스택(FSD·Pinia 등)을 하드코딩 가정하지 않습니다.**

```bash
find src -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" -o -name "*.tsx" -o -name "*.jsx" \) | grep -i "{기능명}" | sort
```

분석 항목 (프로젝트에 존재하는 것만):

- 기능 관련 컴포넌트/모듈 목록 및 역할 (FSD면 `features/`·`entities/` 슬라이스, 그 외엔 감지된 구조 기준)
- 상태 관리 store (Pinia/Vuex/Redux 등 — 감지됐을 때)
- API 레이어 — 엔드포인트, 메서드, DTO 타입
- 핵심 composable/hook/service 로직
- 관련 페이지/라우트 파일

---

### 3단계: 교차 검증

서브에이전트 A, B의 결과를 취합하여 히스토리와 실제 코드를 비교합니다.

불일치 발견 시:

```
⚠️ 불일치 감지
히스토리: [히스토리 문서 내용]
실제 코드: [실제 구현 내용]
→ 문서에 최신 코드 기준으로 반영합니다.
```

---

### 4단계: 문서 초안 생성

수집한 정보로 아래 템플릿에 맞게 초안을 작성합니다.
추론 불가능한 항목은 `확인 필요:` 로 표시합니다.

```markdown
# 🚩 {기능명} 기술 문서

## 문서 정보

| 항목          | 내용                    |
| ------------- | ----------------------- |
| 이슈 번호     | #{이슈 번호}            |
| 작성자        | {git_user}              |
| 작성일        | {오늘 날짜}             |
| 버전          | v1.0                    |
| 참고 히스토리 | docs/features/{기능명}/ |

## 변경 이력

| 버전 | 날짜   | 작성자   | 변경 내용 |
| ---- | ------ | -------- | --------- |
| v1.0 | {날짜} | {작성자} | 최초 작성 |

---

## 📝 개요

{tech.md 내용 기반 요약}

## 🚀 구현 배경

{tech.md에서 구현 배경 추출}

## 🛠️ 구현 내용 상세

### 아키텍처 및 파일 구조

{코드베이스 분석 결과 — 실제 파일 구조 기반}

### 핵심 비즈니스 로직

{tech.md 히스토리 + 실제 코드 분석 결합}

### 주요 코드 변경 사항

{tech.md 이력 + 실제 코드 교차 검증 결과 반영}

## 🔄 데이터 흐름

{코드베이스 API 흐름 분석 — Mermaid 다이어그램}

## 📊 상태 관리

{상태 관리 store 분석 결과 — 해당 없는 프로젝트면 섹션 생략}

## 🧩 주요 컴포넌트

| 컴포넌트명 | 경로 | 역할 |
| ---------- | ---- | ---- |

{실제 컴포넌트 파일 기반으로 자동 생성}

## 🔌 API 명세

| API명 | Method | Endpoint | 비고 |
| ----- | ------ | -------- | ---- |

{\*.api.ts 파일 분석 결과}

## 🐛 트러블슈팅 이력

{troubleshoot.md 전체 내용 정리}

## 💡 UX 결정 이력

{ux.md 전체 내용 정리}

## ✅ 테스트 및 검증

확인 필요: 테스트 시나리오 및 결과

## 🔗 관련 링크

| 유형              | 링크   |
| ----------------- | ------ |
| GitLab 이슈       | (필수) |
| Jira 티켓         | (필수) |
| 관련 MR           | (선택) |
| Figma 디자인 시안 | (선택) |
```

> 🔗 **링크 작성 규칙 (필수 — 링크 누락 방지)**: 링크 셀에 **URL 평문만** 넣지 말고 반드시 **클릭 가능한 형태**로 작성합니다.
>
> - 본문/표 모두 실제 링크로: `[DEV-202](https://.../browse/DEV-202)` 또는 발행 포맷이 HTML이면 `<a href="https://...">DEV-202</a>`.
> - Jira/GitLab/Confluence처럼 미리보기가 유용한 링크는 **스마트 링크**로: `<a href="URL" data-card-appearance="inline">DEV-202</a>` (HTML 발행 시).
> - 표 셀 안에서는 바ﾚ URL이 자동 링크되지 않는 경우가 있으므로 **반드시 앵커/마크다운 링크 문법**을 씁니다. `(필수)`·`확인 필요:` 같은 플레이스홀더가 그대로 발행되지 않도록 발행 전 실제 URL로 치환합니다.

---

### 5단계: 사용자 확인

초안과 교차 검증 결과를 함께 안내합니다:

```
📄 기술 문서 초안이 생성되었습니다.

⚠️ 불일치 항목: N건 (⚠️ 표시 확인)
✅ 일치 항목: N건

수정할 내용이 있으면 알려주세요.
완료되면 Confluence에 발행합니다.
```

---

### 6단계: 발행

**Confluence API 직접 발행 시도:**

`CONFLUENCE_SPACE` > 기능 기술 문서 (`TECH_DOC_PARENT_PAGE_ID`) 하위에 발행합니다.

> 📌 **발행 포맷 = `contentFormat: "html"` 권장.** `createConfluencePage`에 HTML로 보내면 링크(`<a href>`)·스마트 링크·표·패널이 안정적으로 렌더됩니다. markdown으로 보낼 때 표 셀 내 링크가 평문으로 굳어지는 문제를 피할 수 있습니다.
>
> - 모든 URL은 `<a href="URL">텍스트</a>`(또는 스마트 링크 `data-card-appearance="inline"`)로 변환해 보냅니다. 바ﾚ URL·플레이스홀더(`(필수)` 등)가 남지 않게 합니다.
> - **발행 후 검증**: 반환된 페이지를 `getConfluencePage`(또는 웹 URL)로 열어 "관련 링크" 표의 Jira/GitLab/MR 링크가 실제 클릭 가능한지 확인합니다. 평문으로 굳었으면 `updateConfluencePage`로 앵커 형태로 교정합니다.

성공 시:

```
✅ Confluence 발행 완료!
→ {JIRA_SITE_URL}/wiki/spaces/{CONFLUENCE_SPACE}/pages/xxx
```

**실패 시:**

`docs/tech-docs/{기능명}-{날짜}.md` 로 저장하고 경로를 안내합니다.

```
⚠️ Confluence 직접 발행에 실패했습니다.
로컬에 저장했습니다: docs/tech-docs/auth-20260327.md
Confluence에 수동으로 붙여넣어 발행해주세요.
```
