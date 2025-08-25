import axios from 'axios';
import {
  AllTickKlineResponse,
  AllTickTradeTickResponse,
  AllTickBatchKlineResponse,
  AllTickStaticInfoResponse
} from './types.js';

export class AllTickDataFetcher {
  private token: string;
  private baseURL = 'https://quote.alltick.io';
  private lastRequestTime: number = 0;
  // 注意：免费套餐要求所有HTTP接口累计每10秒仅1次，这里默认设为11秒留出余量
  private minRequestInterval: number = 11000; 
  // 全局串行队列，避免并发导致瞬时多发请求而触发429/605
  private queue: Promise<void> = Promise.resolve();

  constructor(token: string) {
    this.token = token;
  }

  // 设置请求间隔（毫秒）
  setRequestInterval(intervalMs: number): void {
    this.minRequestInterval = intervalMs;
    console.error(`[AllTick] 设置请求间隔为 ${intervalMs}ms`);
  }

  // 简单判断是否股票类code（含市场后缀）
  private isStockCode(code: string): boolean {
    const m = code.match(/\.([A-Z]{2})$/i);
    if (!m) return false;
    const suffix = m[1].toUpperCase();
  // AllTick A股后缀使用 SH/SZ，这里同时兼容历史的 SS
  return ['US', 'HK', 'SH', 'SZ', 'SS'].includes(suffix);
  }

  // 将codes分组为股票端点和通用端点两类
  private groupCodes(codes: string[]): { stock: string[]; general: string[] } {
    const stock: string[] = [];
    const general: string[] = [];
    for (const c of codes) {
      if (this.isStockCode(c)) stock.push(c); else general.push(c);
    }
    return { stock, general };
  }

  // 根据接口名与市场类型，返回正确的endpoint路径
  private getEndpoint(path: 'kline' | 'trade-tick' | 'static_info', isStock: boolean): string {
    if (path === 'static_info') {
      // 官方仅支持股票静态信息
      return '/quote-stock-b-api/static_info';
    }
    return isStock ? `/quote-stock-b-api/${path}` : `/quote-b-api/${path}`;
  }

  // 等待请求间隔
  private async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.error(`[AllTick] 等待 ${waitTime}ms 以避免频率限制...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // 将请求加入全局串行队列，确保严格串行+节流
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    let resolveOuter: (v: T) => void;
    let rejectOuter: (e: any) => void;
    const p = new Promise<T>((resolve, reject) => { resolveOuter = resolve; rejectOuter = reject; });
  // 关键：若上一次任务抛错，确保队列不会中断（吞掉上一次的拒绝，继续后续任务）
  this.queue = this.queue.catch(() => { /* swallow to keep chain alive */ }).then(async () => {
      try {
        await this.waitForNextRequest();
        const result = await task();
        resolveOuter!(result);
      } catch (e) {
    // 将错误传递给当前调用者，但不让内部队列处于 rejected 状态
    try { rejectOuter!(e); } catch { /* noop */ }
      }
    });
    return p;
  }

  // 通用请求方法
  private async makeRequest(endpoint: string, params: any): Promise<any> {
    return this.enqueue(async () => {
      try {
        console.error(`[AllTick] 请求: ${endpoint}`);
          // 注意：不要手动对 query 再次 encode，避免双重编码触发402
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          params: {
            token: this.token,
            ...params
          },
          timeout: 15000
        });

        if (response.data.ret === 200) {
          console.error(`[AllTick] 请求成功: ${endpoint}`);
          return response.data;
        } else {
          // 统一透传非200的服务端返回体（如 400/600/603/604 等）
          const err: any = new Error(`AllTick API Error: ${response.data.msg || 'Unknown error'} (ret=${response.data.ret})`);
          err.alltick = response.data;
          throw err;
        }
      } catch (error) {
        console.error(`AllTick请求失败 [${endpoint}]:`, error);
          // 透传服务端错误体，便于诊断 400/402/600 等
          const resp = (error && typeof error === 'object' && 'response' in error) ? (error as any).response : undefined;
          if (resp?.data) {
            const errBody = resp.data;
            const msg = `HTTP ${resp.status} - ${errBody.msg || 'Unknown'} (ret=${errBody.ret ?? 'n/a'})`;
            const e = new Error(msg) as any;
            e.alltick = errBody;
            throw e;
          }
        throw error;
      }
    });
  }

  // 通用POST请求方法
  private async makePostRequest(endpoint: string, data: any): Promise<any> {
    return this.enqueue(async () => {
      try {
        console.error(`[AllTick] POST请求: ${endpoint}`);
        const response = await axios.post(`${this.baseURL}${endpoint}?token=${this.token}`, data, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });

        if (response.data.ret === 200) {
          console.error(`[AllTick] POST请求成功: ${endpoint}`);
          return response.data;
        } else {
          throw new Error(`AllTick API Error: ${response.data.msg || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`AllTick POST请求失败 [${endpoint}]:`, error);
        throw error;
      }
    });
  }

  // 获取K线数据
  async getKlineData(code: string, klineType: number = 8, numKlines: number = 1): Promise<AllTickKlineResponse> {
    const query = JSON.stringify({
      trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: {
        code: code,
        kline_type: klineType, // 1:1分钟, 2:5分钟, 3:15分钟, 4:30分钟, 5:1小时, 8:日线
        kline_timestamp_end: 0, // 0表示最新数据
        query_kline_num: numKlines,
        adjust_type: 0 // 0:除权
      }
    });
    const endpoint = this.getEndpoint('kline', this.isStockCode(code));
    return await this.makeRequest(endpoint, {
      // 仅一次编码由axios负责
      query
    });
  }

  // 获取实时价格
  async getRealtimePrices(codes: string[]): Promise<AllTickTradeTickResponse> {
    const { stock, general } = this.groupCodes(codes);
    const MAX_CODES_PER_REQ = 5; // 免费档限制

    const mergeTickLists: any[] = [];
    const invalidCodes: string[] = [];

    const runChunks = async (list: string[], isStock: boolean) => {
      for (let i = 0; i < list.length; i += MAX_CODES_PER_REQ) {
        const chunk = list.slice(i, i + MAX_CODES_PER_REQ);
        const symbolList = chunk.map(code => ({ code }));
        const query = JSON.stringify({
          trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          data: { symbol_list: symbolList }
        });
        const endpoint = this.getEndpoint('trade-tick', isStock);
        try {
          const resp = await this.makeRequest(endpoint, { query });
          if (resp?.data?.tick_list) mergeTickLists.push(...resp.data.tick_list);
        } catch (e: any) {
          // 如果是 code invalid(600)，则逐个code回退检测，过滤无效code，其余继续
          const ret = e?.alltick?.ret;
          const msg = e?.alltick?.msg || e?.message;
          if (ret === 600) {
            console.error(`[AllTick] 分片含无效code，启动单码回退检测: ${chunk.join(', ')} | 原因: ${msg}`);
            for (const code of chunk) {
              const singleQuery = JSON.stringify({
                trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                data: { symbol_list: [{ code }] }
              });
              try {
                const singleResp = await this.makeRequest(endpoint, { query: singleQuery });
                if (singleResp?.data?.tick_list && singleResp.data.tick_list.length > 0) {
                  mergeTickLists.push(...singleResp.data.tick_list);
                } else {
                  console.error(`[AllTick] 无数据返回，标记为无效code: ${code}`);
                  invalidCodes.push(code);
                }
              } catch (e2: any) {
                const ret2 = e2?.alltick?.ret;
                if (ret2 === 600) {
                  console.error(`[AllTick] 确认为无效code: ${code}`);
                  invalidCodes.push(code);
                } else {
                  // 非600错误不屏蔽，直接抛出（如401/402/603/605等）
                  throw e2;
                }
              }
            }
          } else {
            // 非600错误不屏蔽，直接抛出
            throw e;
          }
        }
      }
    };

    // 串行执行，遵守全局节流（避免429）
    if (stock.length > 0) {
      await runChunks(stock, true);
    }
    if (general.length > 0) {
      await runChunks(general, false);
    }

    const result: any = {
      ret: 200,
      msg: 'OK',
      data: { tick_list: mergeTickLists }
    };
    if (invalidCodes.length > 0) {
      // 附带无效代码信息，便于上层展示与排查
      result.meta = { invalid_codes: invalidCodes };
    }
    return result as AllTickTradeTickResponse;
  }

  // 批量获取K线数据 - 改为顺序请求以避免频率限制
  async getBatchKlineData(requests: Array<{
    code: string;
    klineType?: number;
    numKlines?: number;
  }>): Promise<AllTickBatchKlineResponse> {
    const dataList: AllTickKlineResponse['data'][] = [];
    
    console.error(`[AllTick] 开始批量获取 ${requests.length} 个标的的K线数据...`);
    
    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      console.error(`[AllTick] 处理 ${i + 1}/${requests.length}: ${req.code}`);
      
      try {
        const klineData = await this.getKlineData(
          req.code, 
          req.klineType || 8, 
          req.numKlines || 1
        );
        
        dataList.push(klineData.data);
        console.error(`[AllTick] ✓ ${req.code} 数据获取成功`);
      } catch (error) {
        console.error(`[AllTick] ✗ ${req.code} 数据获取失败:`, error);
        // 对于失败的请求，添加空数据
        dataList.push({
          kline_list: []
        });
      }
    }
    
    return {
      ret: 200,
      msg: 'OK',
      data: {
        data_list: dataList
      }
    };
  }

  // 获取静态信息
  async getStaticInfo(codes: string[]): Promise<AllTickStaticInfoResponse> {
    // 仅支持股票类code，过滤非股票避免600
    const stockCodes = codes.filter(c => this.isStockCode(c));
    const ignored = codes.filter(c => !this.isStockCode(c));
    if (ignored.length > 0) {
      console.error(`[AllTick] static_info 仅支持股票类code，已忽略: ${ignored.join(', ')}`);
    }

    const MAX_CODES_PER_REQ = 5; // 免费档限制
    const merged: any[] = [];

    for (let i = 0; i < stockCodes.length; i += MAX_CODES_PER_REQ) {
      const chunk = stockCodes.slice(i, i + MAX_CODES_PER_REQ);
      const symbolList = chunk.map(code => ({ code }));
      const query = JSON.stringify({
        trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: { symbol_list: symbolList }
      });
      const endpoint = this.getEndpoint('static_info', true);
      const resp = await this.makeRequest(endpoint, { query });
      if (resp?.data?.static_info_list) merged.push(...resp.data.static_info_list);
    }

    return {
      ret: 200,
      msg: 'OK',
      data: { static_info_list: merged }
    } as AllTickStaticInfoResponse;
  }

  // 获取主要指数代码列表
  getMainIndicesCodes(): string[] {
    return [
  '000001.SH',    // 上证指数
  '399001.SZ',    // 深证成指
  '399006.SZ',    // 创业板指
  '000688.SH',    // 科创50
  '000300.SH',    // 沪深300
  '000905.SH',    // 中证500
  '000852.SH'     // 中证1000
    ];
  }

  // 获取主要ETF代码列表
  getMainETFCodes(): string[] {
    return [
  '510050.SH', // 上证50ETF
  '510300.SH', // 沪深300ETF
  '510500.SH', // 中证500ETF
      '159919.SZ', // 沪深300ETF
      '159915.SZ', // 创业板ETF
  '512100.SH', // ETF（请以产品列表为准）
    ];
  }

  // 获取A股个股代码列表 (示例，实际可能需要更多)
  getMainStockCodes(): string[] {
    return [
      '000001.SZ', // 平安银行
      '000002.SZ', // 万科A
  '600000.SH', // 浦发银行
  '600036.SH', // 招商银行
      '000858.SZ', // 五粮液
  '600519.SH', // 贵州茅台
      '000799.SZ', // 酒鬼酒
      '002415.SZ', // 海康威视
      '000166.SZ', // 申万宏源
    ];
  }
}
