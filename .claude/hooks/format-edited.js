#!/usr/bin/env node
/**
 * PostToolUse hook: Edit|Write 직후 변경 파일을 prettier로 포맷한다 (실패해도 통과).
 *
 * settings의 PostToolUse 커맨드는 환경변수로 파일 경로를 받기 어렵고
 * (`$CLAUDE_TOOL_OUTPUT_PATH`는 제공되지 않음), 셸 리다이렉트(`2>/dev/null || true`)는
 * Windows 기본 셸에서 깨진다. 그래서 다른 훅들처럼 stdin PostToolUse JSON에서
 * file_path를 파싱해 prettier를 실행한다.
 *
 * stdin JSON:
 *   { "tool_name": "Edit"|"Write", "tool_input": { "file_path": "..." }, ... }
 *
 * 종료 코드: 항상 0 (통과). prettier 미설치/포맷 실패는 조용히 무시.
 */

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path ?? ''
if (!filePath) process.exit(0)

// prettier가 다루는 확장자만 대상 (그 외는 건너뜀)
if (!/\.(ts|tsx|js|jsx|mjs|cjs|vue|json|jsonc|scss|css|less|md|ya?ml|html)$/i.test(filePath)) {
  process.exit(0)
}

try {
  // execFileSync(shell 미사용)라 경로에 공백/특수문자가 있어도 주입 위험 없음.
  // --no-install: 미설치 시 네트워크에서 임의 패키지를 받아 실행하지 않음.
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  execFileSync(npx, ['--no-install', 'prettier', '--write', filePath], { stdio: 'ignore' })
} catch {
  // prettier 미설치 또는 포맷 실패 — 통과 (포맷은 선택적 보조)
}

process.exit(0)
