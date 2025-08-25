# AllTick 数据源接口说明（仅使用 AllTick）

- 官方文档：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md
- 代码位置：`src/alltick-data-fetcher.ts`
- 基础域名：`https://quote.alltick.io`

## 本项目用到的 REST 端点

- K 线（股票）：GET `/quote-stock-b-api/kline`
- 实时报价（成交）：
  - 股票：GET `/quote-stock-b-api/trade-tick`
  - 其它（如加密/外汇等通用）：GET `/quote-b-api/trade-tick`
- 静态信息（股票）：GET `/quote-stock-b-api/static_info`

查询参数统一通过 `query` 携带 JSON 字符串，axios 负责编码；所有请求需附带 `token`。

示例（K 线）中的 `kline_type`：1=1m, 2=5m, 3=15m, 4=30m, 5=60m, 8=1d。

## 代码与约束要点

- 所有请求串行并设置最小间隔（默认 11000ms），避免触发免费档频率限制
- 静态信息接口仅支持股票类代码，非股票代码会被忽略
- 批量实时报价按 5 只为一组分片请求；若返回 600（无效代码），自动逐码回退过滤
- 统一透传 AllTick 错误体（包含 ret/msg），便于排查 400/402/600/603/605 等

## 代码格式与产品代码后缀

- 股票常见后缀：.SH / .SZ（历史兼容 .SS）
- 主要指数示例：`000001.SH`、`399001.SZ`、`399006.SZ`、`000300.SH` 等

## 配额与错误

- 限频与配额请参阅官方说明：
  - HTTP 限制：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/interface_limitation_cn.md
  - 错误码表：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/error_code_description_cn.md

## 相关链接

- 官网：https://alltick.co / https://alltick.io
- 产品代码表：
  - A 股：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_A_stock_cn.md
  - 港股：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_HK_stock_cn.md
  - 美股：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_US_stock_cn.md
