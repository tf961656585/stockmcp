# ChatBox MCP 配置文件使用说明

本项目提供了多个ChatBox MCP配置文件，用于不同的使用场景：

## 配置文件说明

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
```bash
npm run build
```

### 2. 配置ChatBox
1. 打开ChatBox应用
2. 进入设置 → MCP服务器配置
3. 选择合适的配置文件导入
4. 重启ChatBox

### 3. 验证配置
导入配置后，您应该能看到以下MCP工具：
- `get_realtime_market_data` - 获取实时市场数据
- `get_capital_flow` - 获取资金流向数据
- `get_dragon_tiger` - 获取龙虎榜数据
- `get_concepts` - 获取概念板块数据
- `get_etfs` - 获取ETF数据
- `get_futures_basis` - 获取期货基差数据
- `get_indices` - 获取指数数据
- `get_sectors` - 获取行业板块数据
- `get_market_overview` - 获取市场概览
- `get_market_sentiment` - 获取市场情绪分析
- `analyze_market_structure` - 分析市场结构
- `get_data_quality_report` - 获取数据质量报告

## 配置参数说明

### 必需参数
- `command`: Node.js可执行文件路径
- `args`: 运行参数数组
- `cwd`: 工作目录路径

### 环境变量
- `NODE_ENV`: 运行环境 (production/development)
- `ALLTICK_TOKEN`: AllTick API访问令牌

### 可选参数
- `metadata`: 服务器元数据信息
- `env`: 环境变量配置

## 故障排除

### 1. 服务启动失败
- 检查Node.js是否已安装
- 确认项目已正确构建 (`npm run build`)
- 验证配置文件路径是否正确

### 2. API调用失败
- 确认AllTick Token是否有效
- 检查网络连接
- 查看ChatBox日志获取详细错误信息

### 3. 权限问题
- 确保ChatBox有访问配置文件的权限
- 检查工作目录的读写权限

## 联系支持

如遇到问题，请参考：
- AllTick API文档: https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md
- 项目README文件
