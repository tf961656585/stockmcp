# AllTick 股票数据 MCP 服务器

基于 AllTick 数据源的实时股票市场数据 MCP（Model Context Protocol）服务器，为 AI 助手提供A股、港股、美股等金融数据接口。

## 特性

- 🚀 **实时数据**：提供实时股票行情、指数数据
- 🌐 **多市场支持**：支持A股、港股、美股、加密货币、外汇等
- 📊 **K线数据**：获取各种时间周期的K线数据
- 🔒 **可靠数据源**：使用 AllTick 官方 API
- 🆓 **免费使用**：AllTick 提供免费配额

## 快速开始

### 1. 获取 AllTick Token

访问 [AllTick Token 申请页面](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md) 申请免费 token。

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

```bash
# Windows PowerShell
$env:ALLTICK_TOKEN="your_token_here"

# Linux/macOS
export ALLTICK_TOKEN="your_token_here"
```

### 4. 构建和运行

```bash
npm run build
npm start
```

## ChatBox 配置

在 ChatBox 中添加 MCP 服务器配置：

```json
{
  "mcpServers": {
    "alltick-stock-mcp": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/stockmcp",
      "env": {
        "ALLTICK_TOKEN": "your_token_here"
      }
    }
  }
}
```

## 支持的工具

| 工具名称 | 描述 |
|---------|------|
| `get_indices` | 获取主要股指数据 |
| `get_realtime_market_data` | 获取实时市场数据 |
| `get_validated_market_data` | 获取验证过的市场数据 |
| `get_data_quality_report` | 获取数据质量报告 |
| `get_market_overview` | 获取市场概览 |
| `get_market_sentiment` | 获取市场情绪 |
| `get_etfs` | 获取ETF数据 |
| `get_sectors` | 获取板块数据 |
| `get_concepts` | 获取概念数据 |
| `get_capital_flow` | 获取资金流数据 |
| `get_futures_basis` | 获取期货数据 |
| `get_dragon_tiger` | 获取龙虎榜数据 |
| `analyze_market_structure` | 分析市场结构 |

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

## API 限制

- AllTick 提供免费配额，超出后需要付费
- 请合理控制 API 调用频率
- 详细限制请参考 [AllTick 接口限制说明](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/interface_limitation_cn.md)

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
