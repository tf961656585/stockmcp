# AllTick 股票数据 MCP 服务器

基于 AllTick 数据源的实时股票市场数据 MCP（Model Context Protocol）服务器，为 AI 助手提供 A 股及相关市场数据接口。

## 特性

- 实时与日线级行情能力（统一使用 AllTick 官方 API）
- 多市场代码兼容（.SH/.SZ 等）
- 简洁稳定：内置串行节流，贴合免费配额

## 快速开始

### 1) 获取 AllTick Token

访问官方申请页面获取免费 token：
https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md

### 2) 安装依赖

```powershell
npm install
```

### 3) 设置环境变量（至少需要 ALLTICK_TOKEN）

- 必填：ALLTICK_TOKEN – AllTick 授权令牌
- 可选：ALLTICK_RATE_MS – 请求最小间隔（毫秒），默认 11000。免费档建议 ≥11000 以规避限频
- 可选：JUHE_API_KEY – 若需启用财经新闻工具（聚合数据）

示例（Windows PowerShell）：

```powershell
$env:ALLTICK_TOKEN="your_token_here"
# 可选
$env:ALLTICK_RATE_MS="11000"
$env:JUHE_API_KEY="your_juhe_key"
```

### 4) 构建与运行（本地源码方式）

```powershell
npm run build
npm start
```

### 5) 通过 npm/npx 一键运行（推荐给使用者）

无需克隆仓库，直接用 npx 运行已发布的 CLI（需 Node.js >= 18.17）：

```powershell
# 设置必要环境变量
$env:ALLTICK_TOKEN = "your_alltick_token_here"
# 可选
$env:ALLTICK_RATE_MS = "11000"
$env:JUHE_API_KEY = "your_juhe_api_key_here"

# 直接启动（自动下载并运行；固定版本避免拉取旧包）
npx -y alltick-stock-mcp-server@1.0.2
```

也可以全局安装后运行：

```powershell
npm i -g alltick-stock-mcp-server
stock-mcp
```

## ChatBox 一键配置（复制即用）

推荐：使用 npx（无需克隆仓库，最简配置，建议固定版本）

```json
{
  "mcpServers": {
    "alltick-stock-mcp": {
      "command": "npx",
      "args": ["-y", "alltick-stock-mcp-server@1.0.2"],
      "env": {
        "ALLTICK_TOKEN": "your_alltick_token_here",
        "ALLTICK_RATE_MS": "11000",
        "JUHE_API_KEY": "your_juhe_api_key_here"
      }
    }
  }
}
```

说明：
- 必填 `ALLTICK_TOKEN`（AllTick 授权令牌）。
- 可选 `ALLTICK_RATE_MS` 默认 11000ms（免费档建议保留）。
- 可选 `JUHE_API_KEY` 启用财经新闻工具（聚合数据）。
- 为避免 npx 拉取旧包，建议固定版本号（例如 `@1.0.2`）。
- 若需本地源码方式运行，请参考上文“快速开始”的构建与运行章节。

## 支持的工具

当前服务内置以下 MCP 工具（详见 `src/mcp`）：

- get_indices, get_etfs, get_sectors, get_concepts
- get_market_overview, get_market_sentiment
- get_capital_flow, get_futures_basis, get_dragon_tiger
- analyze_market_structure
- get_realtime_market_data, get_data_quality_report
- get_limit_breadth, get_limit_streaks
- get_finance_news, search_finance_news（需 JUHE_API_KEY）

## 项目结构

```
stockmcp/
├── src/
│   ├── alltick-data-fetcher.ts    # AllTick 数据获取器
│   ├── types.ts                   # 类型定义
│   ├── index.ts                   # 服务器入口
│   └── mcp/                       # MCP 工具定义
│       ├── index.ts
│       ├── tooling.ts
│       └── */index.ts             # 各个工具实现
├── DATA_SOURCES.md               # 数据源说明
├── ALLTICK_SETUP.md             # 配置指南
└── package.json
```

## 数据源说明

本项目使用 AllTick 作为唯一数据源：

- **官网**：https://alltick.co
- **GitHub**：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api
- **文档**：见 `DATA_SOURCES.md`

## 频率与配额

- 免费档建议将 ALLTICK_RATE_MS 设为 11000ms（每 ~11 秒 1 请求）
- 超出配额会返回限频相关错误码，请参考官方错误码文档

## 开发指南

### 添加新的数据获取方法

在 `src/alltick-data-fetcher.ts` 中添加新方法：

```typescript
async getNewData(): Promise<any> {
  return this.makeRequest('/endpoint', params);
}
```

### 添加新的 MCP 工具

1. 在 `src/mcp/` 下创建新目录
2. 实现工具接口
3. 在 `src/mcp/index.ts` 中注册

## 问题反馈

如有问题请通过以下方式反馈：

1. 数据源相关：访问 [AllTick GitHub](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/issues)
2. 项目相关：创建 Issue

## 许可证

本项目基于 MIT 许可证开源。

## 相关链接

- [AllTick 官网](https://alltick.co)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [ChatBox](https://chatboxai.app)
