# remove-mr-quality-criteria

| 항목         | 값                          |
| ------------ | --------------------------- |
| Jira         | DEV-198                     |
| GitLab Issue | #4                          |
| Branch       | refactor/4-remove-mr-quality-criteria |
| 작성자       | 최원서                      |
| 작성일       | 2026-06-15                  |
| Type         | Refactor                    |

## 🎯 작업 목적

MR 스킬에서 품질 평가 기준을 삭제하기 위해

## 📋 작업 범위

**포함 (In Scope)**

- [x] mr 스킬(`.claude/skills/mr/SKILL.md`)에서 품질 평가 기준 삭제

**제외 (Out of Scope)**

- 없음

<!-- 후속 이슈 섹션은 여기 아래로 추가 — v2 자동화 예정 -->

## 🛠️ 접근 방식

- mr SKILL.md의 "MR 품질 평가 기준 참고" 배점표(11줄) 삭제
- CHANGELOG `[Unreleased] > Removed`에 삭제 1줄 기록
- 표 삭제로 부모 헤딩을 잃은 "치명 이슈" 블록을 `## 치명 이슈 (반영 전 필수 해소)` 독립 헤딩으로 승격

## 🔗 참고 자료

| 유형       | 링크 |
| ---------- | ---- |
| Figma      | -    |
| Storybook  | -    |
| API 명세   | -    |
| Confluence | -    |

## ✅ 검증 계획

- 단위/통합 테스트: -
- 회귀 포인트: mr 스킬 워크플로우 (품질 평가 기준 제거 후 MR 생성 흐름이 정상 동작하는지)
- 수동 확인: `/mr` 실행 시 삭제된 기준 참조가 남아 있지 않은지 확인

## 🤔 주요 결정 사항

<!-- /note 또는 수동으로 추가 -->
