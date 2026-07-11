#!/usr/bin/env node
/**
 * PreToolUse hook: `git commit` 실행 직전에 `npm run type-check` 강제.
 *
 * stdin으로 PreToolUse JSON 입력:
 *   { "tool_name": "Bash", "tool_input": { "command": "git commit ..." }, ... }
 *
 * 종료 코드:
 *   0  통과 (또는 git commit 명령이 아니라 무관)
 *   2  type-check 실패 → Claude는 stderr 에러 메시지 받고 수정 시도
 */

import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0) // 파싱 실패 시 조용히 통과 (방어)
}

const command = input?.tool_input?.command ?? ''

// `git commit` 매칭 — `git log`, `git commit-tree` 등은 통과
// 앞에 공백/세미콜론/&&/|/( 가 와도 매칭. 환경변수 prefix 허용.
const isGitCommit = /(?:^|[\s;&|(])git\s+commit(?:\s|$)/.test(command)
if (!isGitCommit) {
  process.exit(0)
}

// hook input의 cwd 우선, 없으면 process.cwd()
const cwd = input?.cwd ?? process.cwd()

// 프로젝트 루트가 아니면 (서브모듈/임시 디렉토리 등) 조용히 통과 — 잘못된 곳에서 npm run을 시도하지 않도록
const pkgPath = `${cwd}/package.json`
if (!existsSync(pkgPath)) {
  process.exit(0)
}

// type-check 스크립트가 없는 프로젝트(Vue2/JS·AngularJS 등 레거시, 또는 문서 전용 repo)는 통과.
// 없는 스크립트를 `npm run` 하면 에러로 끝나 모든 커밋이 차단되므로, 스크립트 존재를 먼저 확인한다.
let hasTypeCheck = false
try {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  hasTypeCheck = Boolean(pkg?.scripts?.['type-check'])
} catch {
  process.exit(0) // package.json 파싱 실패 시 조용히 통과 (방어)
}
if (!hasTypeCheck) {
  process.stderr.write('ℹ️  package.json에 "type-check" 스크립트가 없어 pre-commit type-check를 건너뜁니다.\n')
  process.exit(0)
}

process.stderr.write('⏳ Pre-commit type-check 시작 (보통 30~60초 소요)...\n')

try {
  execSync('npm run type-check', { stdio: 'inherit', cwd })
  process.exit(0)
} catch {
  console.error('\n❌ Pre-commit type-check 실패 — 커밋이 차단됐습니다.')
  console.error('   타입 에러를 수정한 후 다시 커밋하세요.')
  process.exit(2)
}
