param()

# Auto install deps and start MCP server (prefer dist, fallback to tsx on TS sources)
$ErrorActionPreference = 'Stop'

# Switch to repo root (this script is under scripts/)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "[start-mcp] Working directory: $repoRoot"

# Ensure dependencies (prefer npm ci if package-lock exists)
if (-not (Test-Path 'node_modules')) {
  if (Test-Path 'package-lock.json') {
    Write-Host '[start-mcp] node_modules missing, found package-lock.json -> running: npm ci'
    npm ci
  } else {
    Write-Host '[start-mcp] node_modules missing, no package-lock.json -> running: npm install'
    npm install
  }
}

# If dist exists, use build output; otherwise run TS directly with tsx
if (Test-Path 'dist/index.js') {
  Write-Host '[start-mcp] Using dist/index.js to start server'
  node .\dist\index.js
} else {
  Write-Host '[start-mcp] dist not found, using tsx to run src/index.ts'
  npx tsx .\src\index.ts
}
