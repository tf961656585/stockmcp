# AllTick 股票数据 MCP 服务器

基于 AllTick 数据源的实时股票市场数据 MCP（Model Context Protocol）服务器，为 AI 助手提供 A 股及相关市场数据接口。

## 特性

- 实时与日线级行情能力（统一使用 AllTick 官方 - 新闻：`get_finance_news`、`search_finance_news`（需 `JUHE_API_K## 故障排除（常见问题）

### 服务启动问题

- **启动时报错 "ALLTICK_TOKEN environment variable is required"**
  - 说明：未设置必需的环境变量
  - 处理：在 PowerShell 设置后再启动：
    ```powershell
    $env:ALLTICK_TOKEN = "your_alltick_token_here"
    ```

- **Node.js版本问题**
  - 要求：Node.js >= 18.17
  - 处理：升级Node.js到最新LTS版本

### API调用问题

- **请求被限频或返回 AllTick 错误码**
  - 说明：免费档或套餐限额触发
  - 处理：
    - 将 `$env:ALLTICK_RATE_MS` 设为 `11000` 或更高
    - 减少并发请求
    - 查看 [AllTick 错误码表](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/error_code_description_cn.md)

- **Token无效或过期**
  - 处理：重新申请 [AllTick Token](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md)

### ChatBox 配置问题

- **ChatBox 无法启动 MCP**
  - 检查项：
    - Node.js 版本是否符合要求（>= 18.17）
    - 网络代理设置
    - 环境变量是否在 ChatBox 进程中可见
    - 配置文件JSON格式是否正确
  
- **使用 npx 方案的注意事项**
  - 确认配置使用 `alltick-stock-mcp-server@latest`
  - 确认命令调用 `stock-mcp-server`
  - 检查网络连接，确保能访问npm仓库

### 权限问题

- **文件访问权限错误**
  - 确保ChatBox有访问配置文件的权限
  - 检查工作目录的读写权限
  - Windows系统确保路径正确（支持中文路径）

### 数据获取问题

- **财经新闻功能无法使用**
  - 确认已设置 `JUHE_API_KEY` 环境变量
  - 验证聚合数据API密钥是否有效
  - 查看 [聚合数据文档](https://www.juhe.cn/docs/api/id/743)

- **数据返回异常**
  - 检查股票代码格式（如：000001.SH、399001.SZ）
  - 参考 [A股产品代码表](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_A_stock_cn.md)构.SH/.SZ 等）
- 简洁稳定：内置串行节流，贴合免费配额

## 用户必读（速览）

- 必备：Node.js >= 18.17；有效的 AllTick Token
- 环境变量：至少设置 ALLTICK_TOKEN（免费档建议 ALLTICK_RATE_MS=11000）
- 一键运行（推荐）：npx --yes -p alltick-stock-mcp-server@latest stock-mcp-server
- ChatBox 配置：使用 npx + @latest（见下文“一键配置”）
- 错误码/限频：完全遵循 AllTick 官方文档

## 快速开始

### 1) 获取 AllTick Token

访问官方申请页面获取免费 token：
https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md

### 2) 安装依赖

```powershell
npm install
```

### 3) 设置环境变量（至少需要 ALLTICK_TOKEN）

#### 环境变量说明

- **ALLTICK_TOKEN**（必填）：AllTick 授权令牌
  - 申请地址：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md
- **ALLTICK_RATE_MS**（可选）：全局最小请求间隔（毫秒），默认 11000
  - 免费档建议设置为 11000ms 或更高以规避限频
- **JUHE_API_KEY**（可选）：聚合数据API密钥
  - 用于启用财经新闻工具
  - 申请地址：https://www.juhe.cn/docs/api/id/743

#### 设置方法（Windows PowerShell）

```powershell
# 必填：AllTick 授权令牌
$env:ALLTICK_TOKEN = "your_alltick_token_here"

# 可选：全局最小请求间隔（毫秒），免费档建议 11000ms
$env:ALLTICK_RATE_MS = "11000"

# 可选：若启用财经新闻工具（聚合数据）
$env:JUHE_API_KEY = "your_juhe_api_key_here"
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

# 直接启动（始终使用最新版本）
npx --yes -p alltick-stock-mcp-server@latest stock-mcp-server
```

也可以全局安装后运行：

```powershell
npm i -g alltick-stock-mcp-server
stock-mcp
```

## ChatBox 配置指南

### 推荐配置（一键配置）

使用 npx 方式，无需克隆仓库，最简配置，始终拉取最新版本：

```json
{
  "mcpServers": {
    "alltick-stock-mcp": {
      "command": "npx",
      "args": [
        "--yes",
        "-p",
        "alltick-stock-mcp-server@latest",
        "stock-mcp-server"
      ],
      "env": {
        "ALLTICK_TOKEN": "your_alltick_token_here",
        "ALLTICK_RATE_MS": "11000",
        "JUHE_API_KEY": "your_juhe_api_key_here"
      }
    }
  }
}
```

### 配置步骤

1. **构建项目**（如果使用本地源码）
   ```powershell
   npm run build
   ```

2. **配置ChatBox**
   - 打开ChatBox应用
   - 进入设置 → MCP服务器配置
   - 粘贴上方JSON配置
   - 替换环境变量为真实值

3. **重启ChatBox**
   - 配置完成后重启ChatBox生效

### 配置说明

- **必填参数**：
  - `ALLTICK_TOKEN`：AllTick 授权令牌
- **可选参数**：
  - `ALLTICK_RATE_MS`：默认 11000ms（免费档建议保留）
  - `JUHE_API_KEY`：启用财经新闻工具（聚合数据）
- **版本选择**：
  - 推荐使用 `@latest` 自动跟随更新
  - 若需稳定性优先，可改为固定版本号（如 `@1.0.3`）

### 验证配置

配置成功后，可在ChatBox中看到以下MCP工具：
- 指数与板块：`get_indices`、`get_etfs`、`get_sectors`、`get_concepts`
- 概览/情绪/结构：`get_market_overview`、`get_market_sentiment`、`analyze_market_structure`
- 交易相关：`get_realtime_market_data`、`get_capital_flow`、`get_futures_basis`、`get_dragon_tiger`
- 质量与统计：`get_data_quality_report`、`get_limit_breadth`、`get_limit_streaks`
- 新闻：`get_finance_news`、`search_finance_news`（需 `JUHE_API_KEY`）
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
├── scripts/                       # 构建与验证脚本
├── docs/summarys/                 # 变更记录
├── chatbox-mcp-config.example.json # ChatBox 配置示例
├── README.md                      # 项目说明文档（本文件）
└── package.json
```

## 数据源说明

本项目使用 AllTick 作为唯一数据源：

- **官网**：https://alltick.co / https://alltick.io
- **GitHub**：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api
- **中文文档**：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md

### 技术细节
- **基础域名**：`https://quote.alltick.io`
- **主要端点**：K线(`/quote-stock-b-api/kline`)、实时报价(`/quote-stock-b-api/trade-tick`)、静态信息(`/quote-stock-b-api/static_info`)
- **代码格式**：股票后缀 .SH/.SZ，指数示例 `000001.SH`、`399001.SZ`、`000300.SH`
- **频控机制**：串行请求 + 最小间隔（默认11000ms），批量请求按5只分组
- **错误处理**：透传 AllTick 原始错误体，便于排查 400/402/600/603/605 等

### 官方参考链接
- [HTTP接口限制说明](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/interface_limitation_cn.md)
- [错误码说明](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/error_code_description_cn.md)
- [A股产品代码表](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_A_stock_cn.md)

## 频率与配额

- 免费档建议将 ALLTICK_RATE_MS 设为 11000ms（每 ~11 秒 1 请求）
- 超出配额会返回限频相关错误码，请参考官方错误码文档

## 故障排除（常见问题）

- 启动时报错 “ALLTICK_TOKEN environment variable is required”
  - 说明：未设置必需的环境变量
  - 处理：在 PowerShell 设置后再启动：
    ```powershell
    $env:ALLTICK_TOKEN = "your_alltick_token_here"
    ```
- 请求被限频或返回 AllTick 错误码
  - 说明：免费档或套餐限额触发；参考官方错误码/限频文档
  - 建议：将 `$env:ALLTICK_RATE_MS` 设为 `11000` 或更高；减少并发
- ChatBox 无法启动 MCP
  - 检查：Node 版本、网络代理、环境变量是否在 ChatBox 进程可见
  - npx 方案：确认配置使用 `alltick-stock-mcp-server@latest` 并调用 `stock-mcp-server`

## 版本与更新策略

- 本项目通过 npm 的 `latest` 标签发布稳定版本
- 推荐在配置中使用 `@latest`，可自动跟随更新，无需手动改配置
- 若偏好稳定可控：将 `@latest` 固定为具体版本（如 `@1.0.3`）

验证当前发布版本（可选）：

```powershell
npm view alltick-stock-mcp-server version
npm dist-tag ls alltick-stock-mcp-server
```

## 安全与路径注意事项

- 请勿把真实 `ALLTICK_TOKEN`/`JUHE_API_KEY` 提交到 Git 仓库
- Windows 非英文或含空格路径可正常使用，确保 `cwd` 与 `args` 路径一致
- 本项目所有对外数据严格来自 AllTick 官方接口

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
