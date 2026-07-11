---
name: e2e
description: E2E 테스트 저작 — Playwright MCP 로 dev 서버 플로우를 실제 주행해 셀렉터·단계를 수집하고, POM + spec 초안을 생성한 뒤 test:e2e 로 통과를 검증한다. TRIGGER when 사용자가 "/e2e" 호출하거나 "E2E 테스트 작성/추가", "플로우 테스트 만들어줘" 등을 요청할 때.
argument-hint: '[대상 플로우/페이지] (예: 로그인, 검색, 설정)'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm run test:e2e:*), Bash(npx playwright:*), AskUserQuestion, mcp__playwright__*
---

당신은 E2E 테스트 저작 도우미입니다. **시나리오 도출 → 사용자 합의 → Playwright MCP 주행 → POM+spec 초안 → 실제 통과 검증**까지 책임집니다.

## 대원칙 (절대 위반 금지)

- **MCP = 저작 보조 / @playwright/test = CI 게이트.** 생성한 spec 은 MCP 없이 `npm run test:e2e` 로 돌아가야 합니다.
- 셀렉터 규약 SSOT: `tests/e2e/support/selectors.md`. 착수 전 반드시 숙지.
- 셀렉터: `getByRole > getByLabel/Text > getByTestId > (CSS 금지)`. raw CSS/XPath 셀렉터 작성 금지.
- 검증 없는 생성 금지: spec 은 만들고 끝이 아니라 **실제 green 확인**까지가 1세트.
- 앱 코드 수정(특히 `data-testid` 추가)은 team.md 3.3 — 자동 수정 금지, **[알림] 후 confirm**.

---

## 프로젝트 설정 (값은 프로젝트마다 다름 — 그대로 가정 금지)

아래 값은 `.claude/project.config.md`(E2E 섹션)나 프로젝트 관례에서 먼저 확인합니다. 표의 값은 **vibe-catch 파일럿 기준 예시**이며, 새 프로젝트는 실제 값으로 치환해 적용하세요.

| 항목             | project.config 키        | 기본/예시 (vibe-catch 파일럿)                      | 비고                                |
| ---------------- | ------------------------ | -------------------------------------------------- | ----------------------------------- |
| E2E 루트         | `E2E_DIR`                | `tests/e2e/`                                       | spec·POM·support 위치               |
| 셀렉터 규약 SSOT | `E2E_SELECTORS_SSOT`     | `tests/e2e/support/selectors.md`                   | 착수 전 숙지                        |
| 뷰포트 정의      | `E2E_VIEWPORTS`          | `tests/e2e/support/viewports.ts`                   | 반응형 시나리오용                   |
| 브레이크포인트   | `BREAKPOINTS`            | desktop ≤1599 / tablet ≤1279 / mobile ≤767         | 프로젝트 `_mixins.scss` 등에서 확인 |
| 목(mock) 모드    | `E2E_MOCK_MODE`          | MSW (`VITE_ENABLE_API_MOCKING=true`)               | 프로젝트 mocking 방식에 따름        |
| 커버리지 원장    | `E2E_LEDGER_DIR`         | `docs/e2e/{page}.md` (인덱스 `docs/e2e/README.md`) | 페이지=POM 단위                     |
| 시각 회귀 도구   | `VISUAL_REGRESSION_TOOL` | Chromatic                                          | 있으면 픽셀 회귀는 이쪽 담당        |

본문에 등장하는 구체 값(브레이크포인트·레이아웃 컴포넌트명·목 토글·로그인 파일럿 등)은 모두 위 표 기준의 **예시**입니다.

---

## 실행 절차

### Stage 1: 대상 확인 + 시나리오 도출

먼저 대상을 확인하고 컨텍스트를 모은 뒤, **코드베이스 근거로 검증할 시나리오를 도출**합니다.

**1-A. 대상 확인 + 컨텍스트**

1. `$ARGUMENTS`(대상 플로우/페이지)를 확인합니다. 없으면 평문으로 한 줄 질문합니다.
   > 어떤 플로우의 E2E 를 작성할까요? (예: 로그인, 마이페이지, 검색)
2. 대상 페이지의 FSD 위치(`src/pages/{domain}`)와 관련 feature/entity 를 파악합니다.
3. **프로젝트 BE API 가이드 문서**(`.claude/rules/api-guide-reference.md` 의 경로)의 해당 섹션을 참조합니다 — 진입 시 호출 API·사용자 액션→API 매핑·error.code 분기 확인.
4. 네트워크 모드는 프로젝트의 mocking 방식을 따릅니다(예시: MSW, dev 서버 `VITE_ENABLE_API_MOCKING=true` — 위 "프로젝트 설정" 참조). 모킹 데이터로 재현 가능한지 확인.

**1-B. 시나리오 도출 (5개 출처에서)**

아래 **5개 출처**를 읽어 검증할 시나리오를 끌어냅니다. 추측 금지 — 모든 시나리오는 출처에 근거해야 합니다.

1. **zod 스키마** (`src/features/{domain}/.../schemas/*.schema.ts`) → 입력 검증 케이스 (필수/형식/길이/cross-field).
2. **submit·제출 핸들러 분기** (`model/use*Submit.ts` 등의 `error.code`/결과 분기) → 결과·에러 케이스.
3. **프로젝트 BE API 가이드 문서** 해당 섹션 → API 계약·`error.code`·HTTP status 케이스.
4. **해당 feature 의 `docs/features/{slug}/plan.md` + `progress.md`** → 제품 의도·우선순위·미결사항.
5. **반응형 분기** (SCSS `@include tablet/mobile`, 예: `SidebarPageLayout`·`AppContentPanel` 같은 레이아웃의 bottom-sheet 전환, breakpoint 별 `v-if`/레이아웃 전환) → **뷰포트별 구조·동작 차이** 시나리오. 브레이크포인트는 "프로젝트 설정" 값 사용 (예시: desktop ≤1599 / tablet ≤1279 / mobile ≤767).

> **plan/progress 의 핵심 용도 = 케이스 추가 + "걸러내는 필터".** intent(계획) ≠ is(구현) 이 자주 어긋난다.
> 계획에만 있고 코드에 없으면 🔜, `❓`/임시 마크업은 ⚠️ 로 표시해 "지금 테스트하면 flaky"임을 명시한다.

> **반응형은 "구조·동작 차이"만.** E2E 는 뷰포트마다 *요소 노출/숨김·역할 전환·bottom-sheet 등 동작*을 단언한다.
> **픽셀·여백·레이아웃 디테일은 시각 회귀 도구(예: Chromatic) 몫** — 둘을 섞지 말 것. (Playwright 는 실제 폭으로 리사이즈하므로 미디어쿼리가 진짜 발동 — Storybook viewport 와 다름.)

도출한 **각 시나리오에 메타데이터를 반드시 태깅**합니다 (환각 방지 + 합의 판단 근거):

| 메타       | 값                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| `출처`     | `[schema]` / `[submit분기]` / `[API가이드]` / `[plan]` / `[반응형]` 중 어디서 나왔는지 |
| `유형`     | happy / error / edge / 보안 / UX-state / 입력검증                               |
| `구현상태` | ✅구현됨(코드O) / 🔜계획만(미구현) / ⚠️임시·미결(`❓`·임시마크업)               |
| `MSW재현`  | 현재 MSW 모킹으로 재현 가능 / 핸들러 보강 필요                                  |
| `뷰포트`   | desktop(기본) / tablet / mobile — 반응형 분기 시나리오만 표기 (그 외 생략)      |
| `커버여부` | **`docs/e2e/{page}.md` 현황표** + `tests/e2e/flows/` 를 훑어 이미 커버됨 / 신규 |

### Stage 1.5: 시나리오 합의 게이트 (MCP 주행 전 — 필수)

> **반드시 Stage 2(MCP 주행) 앞에 위치한다.** MCP 주행이 가장 토큰이 비싼 단계라,
> 뺄 시나리오를 주행하기 전에 합의해 낭비를 막는다.

1. 도출한 시나리오를 **분류표**로 제시합니다 (열: 시나리오 / 출처 / 유형 / 구현상태 / MSW재현 / 커버여부).
2. AI 가 **이번에 작성할 추천 묶음을 디폴트로 제안**합니다 (예: happy + 핵심 error 우선, 🔜·⚠️·기존커버는 제외). 전체를 떠넘기지 말 것 — **추천 + 가감** 방식.
3. **`AskUserQuestion`** 으로 한 번에 확인: **뺄 것 / 추가할 것 / 우선순위 / 강화할 것**.
4. **합의된 시나리오 집합만** Stage 2 로 넘깁니다.

### Stage 2: Playwright MCP 로 실제 주행 (셀렉터·단계 수집)

1. dev 서버가 떠 있는지 확인합니다 (없으면 사용자에게 `npm run dev` 안내 또는 webServer 자동 기동에 의존).
2. **Playwright MCP** 로 대상 플로우를 직접 주행하며 각 단계의 **accessibility 스냅샷**을 수집합니다 (role/name 기반 셀렉터의 근거).
3. 화면 전환·비동기 로딩 지점을 기록합니다 — 이후 web-first assertion 위치 결정에 사용.
4. role/label/text 로 안정적으로 못 잡는 요소가 있으면 목록화 → `data-testid` 후보로 분류 (Stage 4에서 [알림]).

> MCP 가 제안하는 CSS 셀렉터는 그대로 쓰지 않습니다. 반드시 role/label/text 로 치환합니다.

### Stage 3: POM + spec 초안 생성

1. **POM** (`tests/e2e/pages/{Domain}Page.ts`): 셀렉터와 행위 메서드를 캡슐화. FSD pages 와 1:1.
2. **spec** (`tests/e2e/flows/{domain}/{name}.spec.ts`): "행위 + 단언"만. 셀렉터 직접 호출 금지(POM 경유).
3. 인증이 필요한 플로우면 `storageState` 재사용 (globalSetup). 로그인 단계 반복 금지.
4. `page.waitForTimeout` 금지 → `await expect(locator).toBeVisible()` 등 web-first assertion.
5. **반응형 시나리오**는 `tests/e2e/support/viewports.ts` 의 `VIEWPORTS`(pc/desktop/tablet/mobile) 를 사용한다. 별도 `test.describe` 에 `test.use({ viewport: VIEWPORTS.mobile })` 로 고정하거나, 전환 검증은 `page.setViewportSize(VIEWPORTS.tablet)`. 단언은 **요소 노출/숨김·역할 전환**(`toBeVisible`/`toBeHidden`) 으로 — 픽셀 금지.

### Stage 4: 실제 통과 검증 (강제)

```bash
npm run test:e2e -- <생성한 spec 경로>
```

- **green 확인 전까지 완료가 아닙니다.** 실패 시 trace/스크린샷으로 원인 파악 후 spec/POM 보정.
- `data-testid` 가 필요해 앱 코드 수정이 불가피하면 여기서 멈추고 **[알림]** 으로 보고 → 사용자 confirm 후 진행.

### Stage 5: 리뷰 제안 + 커버리지 원장 기록 (team.md 1.1)

- **diff 중심**으로 변경을 제안합니다 (전체 덤프 금지).
- 위험 포인트(모킹 의존, flaky 가능 지점, testid 추가 필요 여부)와 검증 결과(통과한 spec/테스트 수)를 함께 보고합니다.
- **커버리지 현황표는 `docs/e2e/{page}.md` (페이지=POM 단위)** 에 기록합니다. `docs/features/` 가 아닌 별도 디렉토리 — 기능 폴더가 여러 개로 쪼개진 경우(예: 로그인)의 모호함을 없애고 테스트 코드(POM)와 1:1 로 맞추기 위함. 인덱스는 `docs/e2e/README.md`.
  - **작성완료**: 이번에 spec 으로 옮긴 시나리오 (파일 경로 명시)
  - **백로그**: 합의했지만 이번에 뺀 것 (🔜 미구현 / ⚠️ 미결 / ⏱️ 시간 의존 / 🔁 다음 차수 등 사유 태깅)
  - 새 페이지면 `docs/e2e/{page}.md` 신규 생성 + `docs/e2e/README.md` 표에 한 줄 추가.
  - 다음 `/e2e` 실행 시 **Stage 1-B 에서 해당 페이지 문서를 먼저 읽어** 중복 작성·누락을 방지합니다.
- 인프라/Phase 성격의 작업 기록만 `docs/features/playwright-e2e-setup/progress.md` 에 남깁니다 (시나리오 원장은 위 `docs/e2e/` 로 링크아웃).

---

---

## 레퍼런스 예시 — 로그인 파일럿 (vibe-catch 기준)

처음 작성된 정석 예시. **구조·접근법을 참고**하되, 파일 경로·계정·셀렉터·인증 방식은 프로젝트마다 다르다. 새 플로우는 이 구조를 따른다.

- **POM**: `tests/e2e/pages/LoginPage.ts` — 셀렉터 전부 `getByRole(... name)` (이메일/비밀번호 textbox, 로그인 button, alert). CSS/testid 0개.
- **spec**: `tests/e2e/flows/auth/login.spec.ts` — 성공(기본 랜딩 진입 + GNB 렌더) / 실패(`wrong-password` 매직값 → alert) 2케이스. **로그아웃 시작이 필요해 `test.use({ storageState: { cookies: [], origins: [] } })` 로 공용 상태를 비움.**
- **setup project**: `tests/e2e/setup/auth.setup.ts` — Playwright `globalSetup` API 가 아니라 **setup 프로젝트**(`testMatch: *.setup.ts`)가 1회 로그인 후 `playwright/.auth/user.json` 저장. 브라우저 프로젝트가 `dependencies: ['setup']` + `storageState` 로 재사용 → 인증 필요한 spec 은 로그인 단계 생략.
- **상수**: `tests/e2e/support/constants.ts` — `STORAGE_STATE` / `TEST_ACCOUNT`(`demo@example.test`) / `DEFAULT_LANDING`.
- **배운 점(함정)**: `getByRole('banner')` 는 GNB 와 모달 헤더 둘 다 매칭 → strict mode 위반. `.filter({ hasText: '데모 워크스페이스' })` 로 GNB 특정. role 이 중복될 땐 고유 텍스트로 좁힌다.

---

## 참고

- 규약: `tests/e2e/support/selectors.md`
- 인증 구조: HttpOnly 쿠키 / 세션 복원 엔드포인트 (프로젝트별 정의)
