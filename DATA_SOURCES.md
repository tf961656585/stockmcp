# AllTick 数据源接口说明

本项目使用 AllTick 作为唯一数据源，提供实时金融市场数据 API 服务。

- 更新时间：2025-08-22
- 官方文档：https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md
- 代码参考位置：`src/alltick-data-fetcher.ts`

## 数据源简介

AllTick 提供免费开源的实时金融数据 API，支持：
- 沪深A股实时行情和K线数据
- 港股、美股实时行情
- 加密货币、外汇、贵金属实时数据
- 实时盘口数据
- 产品基础信息查询

---

## AllTick REST 接口

- 官网与文档：
  - 官网（中文）：https://alltick.co/ 或 https://alltick.io/
  - REST & WebSocket 文档（官方 GitHub）：
    - 访问指南（含 REST）https://github.com/alltick/realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/access_guide_cn.md
    - 快速入门（示例代码）https://github.com/alltick/realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/README_cn.md
  - 基础 API 域名：`https://quote.alltick.io`

### 主要功能特性

- 免费开源
- 获取港股实时行情API
- 获取港股实时10档盘口API
- 获取港股K线数据API
- 获取美股实时行情API
- 获取美股实时一档盘口API
- 获取美股K线数据API
- 获取沪深A股实时行情API
- 获取沪深A股实时5档盘口API
- 获取沪深A股K线数据API
- 获取加密货币实时行情API
- 获取加密货币实时多档盘口API
- 获取加密货币K线数据API
- 获取外汇实时行情API
- 获取外汇实时5档盘口API
- 获取外汇K线数据API
- 获取贵金属实时行情API
- 获取贵金属实时5档盘口API
- 获取贵金属K线数据API

### 1) 单品种 K 线
- 端点：`GET /quote-stock-b-api/kline`
- 认证：`token` 查询参数必填
- 查询参数：
  - `token=...`
  - `query=` URL 编码后的 JSON 字符串，形如：
    ```json
    {
      "trace": "<任意字符串用于追踪>",
      "data": {
        "code": "SHCOMP.SS",     
        "kline_type": 8,          
        "kline_timestamp_end": 0, 
        "query_kline_num": 2,
        "adjust_type": 0          
      }
    }
    ```
- `kline_type` 映射（项目约定）：1=1分, 2=5分, 3=15分, 4=30分, 5=60分, 8=日 K
- 返回要点：`data.kline_list[*]` 包含 `timestamp, open_price, close_price, high_price, low_price, volume, turnover`

### 2) 实时报价（逐笔/成交）
- 端点：`GET /quote-stock-b-api/trade-tick`
- 参数：与上类似，通过 `query` 传入 `symbol_list`（如 `[{"code":"SHCOMP.SS"}]`）
- 用法：项目用于指数/个股实时价格补充

### 3) 批量 K 线
- 端点：`POST /quote-stock-b-api/batch-kline?token=...`
- 请求体（JSON）：
  ```json
  {
    "trace": "<追踪>",
    "data": { "data_list": [
      {"code":"SHCOMP.SS","kline_type":8,"kline_timestamp_end":0,"query_kline_num":2,"adjust_type":0},
      ...
    ]}
  }
  ```
- 返回：按 `data_list` 顺序给出各品种 K 线列表

### 4) 静态信息
- 端点：`GET /quote-stock-b-api/static_info`
- 参数：`query` 携带 `symbol_list`
- 用法：项目用于批量取基础信息

### 5) 最新成交价查询
- 端点：批量获取最新成交价（最新价、当前价）
- 用法：获取实时价格数据

### 6) 盘口数据查询
- 端点：获取最新盘口(Order Book)
- 用法：获取买卖盘口数据

## 代码映射与注意事项

- A 股指数代码在 AllTick 与本地代码格式不同，项目内有映射与转换逻辑（见 `src/alltick-data-fetcher.ts`）
- 所有 AllTick 请求均要求 `token`，注意频率与配额（见官网定价页）
- 支持的产品代码列表：
  - [产品code列表-A股](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_A_stock_cn.md)
  - [产品code列表-港股](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_HK_stock_cn.md)
  - [产品code列表-美股](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_US_stock_cn.md)
  - [产品code列表-加密货币](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_cryptocurrency_cn.md)
  - [产品code列表-外汇](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_forex_cn.md)
  - [产品code列表-商品贵金属](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/product_code_list_commodities_gold_cn.md)

## Token 获取

免费 token 获取方式：
- [token申请](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/token_application_cn.md)

## 使用示例

项目支持多种编程语言的示例：
- [Python HTTP 示例](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/example/python/http_python_example.py)
- [Python WebSocket 示例](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/example/python/websocket_python_example.py)
- [Java HTTP 示例](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/example/java/HttpJavaExample.java)
- [Go HTTP 示例](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/example/go/http_go_example.go)
- [PHP HTTP 示例](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/example/php/php_http_curl.php)

## 接口限制

- [HTTP接口限制](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/interface_limitation_cn.md)
- [WebSocket接口限制](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/websocket_interface/interface_limitation_cn.md)

## 错误处理

- [错误码说明](https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/error_code_description_cn.md)

## 联系方式

- Email: support@alltick.co
- 官网：https://alltick.co
- 备用官网：https://alltick.io

---

## 变更日志

- 2025-08-22 重构项目：移除所有其他数据源，只保留 AllTick 作为唯一数据源。
