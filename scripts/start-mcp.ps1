# 自动安装依赖并启动 MCP 服务（优先 dist，其次 tsx 直跑）
param()

$ErrorActionPreference = "Stop"

# 切到仓库根目录（脚本位于 scripts/ 下）
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "[start-mcp] Working directory: $repoRoot"

# 如果缺少依赖则安装（优先 npm ci，否则回退 npm install）
if (-not (Test-Path "node_modules")) {
  if (Test-Path "package-lock.json") {
    Write-Host "[start-mcp] node_modules 缺失，发现 package-lock.json，执行 npm ci…"
    npm ci
  } else {
    Write-Host "[start-mcp] node_modules 缺失，未发现 package-lock.json，执行 npm install…"
    npm install
  }
}

# 如果有 dist 优先用构建产物；否则使用 tsx 直跑 TS 源码
if (Test-Path "dist/index.js") {
  Write-Host "[start-mcp] 发现 dist/index.js，使用构建产物启动"
  node .\dist\index.js
} else {
  Write-Host "[start-mcp] 未发现 dist，使用 tsx 直跑 src/index.ts"
  npx -y tsx .\src\index.ts
}
