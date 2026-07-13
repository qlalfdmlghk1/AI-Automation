# 백엔드 (NestJS · TypeScript) 규칙

> 🚧 **초안 — 백엔드 담당자 검토 필요.** Confluence "[김두리] .claude 멀티스택 적용 검토" 2-3 도구 매핑 기반 시작점. 명령·테스트 설정 경로는 **프로젝트 실제 설정과 대조** 후 확정하세요.

## 적용 대상

- 감지 키(repo 루트): `package.json` + `@nestjs/core` (`nest-cli.json`)
- team-init·`/review`·`check-commit-typecheck` 훅이 위 키로 이 스택을 판정합니다.

## 아키텍처

- **Module / Controller / Service** 계층 분리, `src/modules/{domain}` 단위.
- Controller는 얇게(요청 검증·매핑), 비즈니스 로직은 Service, 영속성은 Repository/Provider.
- 의존성 주입(DI) 컨테이너 활용, 순환 의존 금지. 도메인 경계 넘는 직접 참조 지양.

## 코드 컨벤션

- **TypeScript strict**. `any` 금지(예외 시 사유 + TODO), DTO는 class-validator/class-transformer로 검증.
- 유효성: `ValidationPipe`(whitelist·forbidNonWhitelisted) 전역 적용. 스키마 검증 우회 금지.
- 에러: 표준 예외 필터, HTTP status·error code 일관성. 예외를 삼키지 않기.
- 설정: `@nestjs/config`로 env 주입(하드코딩 금지), 비밀값은 secret manager/env.

## 검증 / 포맷 (project.config 연동)

| 용도 | 예시 명령 | project.config 키 |
| --- | --- | --- |
| 커밋 게이트 | `npm run typecheck` 또는 `tsc --noEmit` | `COMMIT_GATE_COMMAND` / `TYPECHECK_COMMAND` |
| 포맷 | `prettier --write` (기존 `format-edited` 훅 그대로 동작) | `FORMAT_COMMAND`(미설정 시 prettier 자동) |
| 단위 테스트 | `jest` | `TEST_COMMAND` |
| 통합/E2E | `jest --config test/jest-e2e.json` (supertest) | — |

> ⚠️ `typecheck` 스크립트가 없는 repo는 `check-commit-typecheck`가 침묵 통과할 수 있으니 `COMMIT_GATE_COMMAND` 설정 권장. jest-e2e 설정 경로는 프로젝트에서 확인.

## 테스트

- 단위: jest + Service/Provider 모킹.
- 통합/E2E: supertest + `jest-e2e` (웹 `/e2e` Playwright 스킬 대상 아님 — 서버 계약 테스트로 별도).

## 보안 (요약 — 정본은 `security-compliance.md`)

- 인증/인가: JWT 검증·가드·롤 적용, 엔드포인트 권한 가드 누락 금지.
- 주입/요청: SQLi(파라미터 바인딩)·SSROf·rate-limit. 외부 입력 검증 후 사용.
- 비밀값: 시크릿·env 하드코딩 금지. TLS·CORS·보안 헤더 설정.
- 민감정보: 응답 마스킹·로깅에서 PII 노출 금지.

## 참고

- 스택별 판정 기준은 `.claude/rules/security-compliance.md`, 보안 리뷰는 `/secure-review`.
