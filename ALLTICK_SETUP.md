# AllTick MCP 服务器配置示例

## 环境变量设置

在运行服务器之前，您需要设置以下环境变量：

```bash
# Windows PowerShell
$env:ALLTICK_TOKEN="your_alltick_token_here"

# Windows CMD
set ALLTICK_TOKEN=your_alltick_token_here

# Linux/macOS
export ALLTICK_TOKEN="your_alltick_token_here"
```

## AllTick Token 获取

请访问以下链接获取免费的 AllTick token：
https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md

## 运行服务器

```bash
# 设置环境变量后运行
npm run build
npm start
```

## ChatBox MCP 配置示例

在 ChatBox 中添加此 MCP 服务器配置：

```json
{
  "name": "AllTick股票数据",
  "command": "node",
  "args": ["./dist/index.js"],
  "cwd": "D:\\软件\\网页下载\\stockmcp",
  "env": {
    "ALLTICK_TOKEN": "your_alltick_token_here"
  }
}
```

## 支持的功能

- 获取主要股指数据（上证、深证、创业板等）
- 获取实时市场数据
- 获取 K 线数据
- 获取股票基本信息
- 市场概览和分析

## 注意事项

- AllTick 提供免费的 API 配额，超出后需要付费
- 请合理使用 API 调用频率
- 如需更多数据类型（如板块、概念等），可能需要额外的数据源或付费升级
