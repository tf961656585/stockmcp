# ChatBox MCP 配置文件使用说明
## ChatBox 配置指南（精简版）

只需要一份配置即可：打开 ChatBox -> 设置 -> MCP，粘贴下方 JSON（使用通用占位路径，请替换为你的实际路径）：

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

参数说明：
- ALLTICK_TOKEN：必填，AllTick 授权令牌。
- ALLTICK_RATE_MS：可选，默认 11000ms。免费档建议≥11000 规避限频。
- JUHE_API_KEY：可选，启用财经新闻工具（聚合数据）。

提示：若你使用非英文路径或路径包含空格，保持 `cwd` 与 `args` 中路径一致即可（示例为通用占位路径）。
本项目提供了多个ChatBox MCP配置文件，用于不同的使用场景：

注意：请基于同名的 `*.example.json` 复制生成本地配置文件（例如：将 `chatbox-mcp-config.example.json` 复制为 `chatbox-mcp-config.json`）。实际的本地配置文件已被 `.gitignore` 忽略，请勿提交到仓库。

## 配置文件说明（请基于 *.example.json 复制为本地文件）

### 1. `chatbox-mcp-config.json` (默认配置)
- **用途**: 生产环境使用的基础配置
- **特点**: 使用编译后的JavaScript文件运行
- **推荐**: 日常使用

### 2. `chatbox-mcp-production.json` (生产环境配置)
- **用途**: 生产环境的完整配置
- **特点**: 包含详细的元数据信息和功能描述
- **推荐**: 正式部署时使用

### 3. `chatbox-mcp-development.json` (开发环境配置)
- **用途**: 开发调试时使用
- **特点**: 直接运行TypeScript源文件，便于调试
- **推荐**: 开发期间使用

### 4. `chatbox-test-config.json` (测试配置)
- **用途**: 测试环境使用
- **特点**: 简化配置，用于功能测试

## 使用步骤

### 1. 构建项目
在使用生产环境配置前，请先构建项目：
```powershell
npm run build
```

### 2. 配置ChatBox
1. 打开ChatBox应用
2. 进入设置 → MCP服务器配置
3. 选择合适的配置文件导入
4. 重启ChatBox

### 3. 验证配置
导入后可见的 MCP 工具（以实际版本为准）：
- 指数与板块：`get_indices` `get_etfs` `get_sectors` `get_concepts`
- 概览/情绪/结构：`get_market_overview` `get_market_sentiment` `analyze_market_structure`
- 交易相关：`get_realtime_market_data` `get_capital_flow` `get_futures_basis` `get_dragon_tiger`
- 质量与统计：`get_data_quality_report` `get_limit_breadth` `get_limit_streaks`
- 新闻：`get_finance_news` `search_finance_news`（需 `JUHE_API_KEY`）

## 配置参数说明

### 必需参数
- `command`: Node.js可执行文件路径
- `args`: 运行参数数组
- `cwd`: 工作目录路径

### 环境变量
- `ALLTICK_TOKEN`（必填）：AllTick API 访问令牌
- `ALLTICK_RATE_MS`（可选）：全局最小请求间隔（毫秒），默认 11000
- `JUHE_API_KEY`（可选）：开启财经新闻工具所需

### 可选参数
- `metadata`: 服务器元数据信息
- `env`: 环境变量配置

## 故障排除

### 1. 服务启动失败
- 检查Node.js是否已安装
- 确认项目已正确构建 (`npm run build`)
- 验证配置文件路径是否正确

### 2. API调用失败
- 确认 `ALLTICK_TOKEN` 是否有效；免费档注意频率限制
- 查看 ChatBox 日志；对照 AllTick 错误码定位问题

### 3. 权限问题
- 确保ChatBox有访问配置文件的权限
- 检查工作目录的读写权限

## 联系支持

如遇到问题，请参考：
- AllTick API文档: https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md
- 项目 README 与 ALLTICK_SETUP
