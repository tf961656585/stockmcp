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

### 4) 构建与运行

```powershell
npm run build
npm start
```

## ChatBox 一键配置（复制即用）

方案 A：零构建直跑（推荐，免 dist）

```json
{
  "mcpServers": {
    "alltick-stock-mcp": {
      "command": "powershell.exe",
      "args": [
        "-ExecutionPolicy",
        "Bypass",
        "-NoProfile",
        "-File",
        ".\\scripts\\start-mcp.ps1"
      ],
      "cwd": "D:/path/to/stockmcp",
      "env": {
        "ALLTICK_TOKEN": "your_alltick_token_here",
        "ALLTICK_RATE_MS": "11000",
        "JUHE_API_KEY": "your_juhe_api_key_here"
      }
    }
  }
}
```

方案 B：已构建后使用 dist：

```json
{
  "mcpServers": {
    "alltick-stock-mcp": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "D:/path/to/stockmcp",
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
 - 方案 A 首次运行会自动安装依赖（npm ci）并用 tsx 启动；后续若你执行了 `npm run build`，脚本会自动切换到 dist 运行。

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
