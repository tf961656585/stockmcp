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
  private minRequestInterval: number = 6000; // 6秒间隔，适配免费用户限制

  constructor(token: string) {
    this.token = token;
  }

  // 设置请求间隔（毫秒）
  setRequestInterval(intervalMs: number): void {
    this.minRequestInterval = intervalMs;
    console.error(`[AllTick] 设置请求间隔为 ${intervalMs}ms`);
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

  // 通用请求方法
  private async makeRequest(endpoint: string, params: any): Promise<any> {
    // 等待请求间隔
    await this.waitForNextRequest();
    
    try {
      console.error(`[AllTick] 请求: ${endpoint}`);
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params: {
          token: this.token,
          ...params
        },
        timeout: 15000 // 增加超时时间
      });

      if (response.data.ret === 200) {
        console.error(`[AllTick] 请求成功: ${endpoint}`);
        return response.data;
      } else {
        throw new Error(`AllTick API Error: ${response.data.msg || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`AllTick请求失败 [${endpoint}]:`, error);
      throw error;
    }
  }

  // 通用POST请求方法
  private async makePostRequest(endpoint: string, data: any): Promise<any> {
    // 等待请求间隔
    await this.waitForNextRequest();
    
    try {
      console.error(`[AllTick] POST请求: ${endpoint}`);
      const response = await axios.post(`${this.baseURL}${endpoint}?token=${this.token}`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 增加超时时间
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

    return await this.makeRequest('/quote-stock-b-api/kline', {
      query: encodeURIComponent(query)
    });
  }

  // 获取实时价格
  async getRealtimePrices(codes: string[]): Promise<AllTickTradeTickResponse> {
    const symbolList = codes.map(code => ({ code }));
    const query = JSON.stringify({
      trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: {
        symbol_list: symbolList
      }
    });

    return await this.makeRequest('/quote-stock-b-api/trade-tick', {
      query: encodeURIComponent(query)
    });
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
    const symbolList = codes.map(code => ({ code }));
    const query = JSON.stringify({
      trace: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: {
        symbol_list: symbolList
      }
    });

    return await this.makeRequest('/quote-stock-b-api/static_info', {
      query: encodeURIComponent(query)
    });
  }

  // 获取主要指数代码列表
  getMainIndicesCodes(): string[] {
    return [
      'SHCOMP.SS',    // 上证指数
      'SZCOMP.SZ',    // 深证成指  
      'CYBCOMP.SZ',   // 创业板指
      'KECHUANG50.SS', // 科创50
      'CSI300.SS',    // 沪深300
      'CSI500.SS',    // 中证500
      'CSI1000.SS'    // 中证1000
    ];
  }

  // 获取主要ETF代码列表
  getMainETFCodes(): string[] {
    return [
      '510050.SS', // 上证50ETF
      '510300.SS', // 沪深300ETF
      '510500.SS', // 中证500ETF
      '159919.SZ', // 沪深300ETF
      '159915.SZ', // 创业板ETF
      '512100.SS', // 中证1000ETF
    ];
  }

  // 获取A股个股代码列表 (示例，实际可能需要更多)
  getMainStockCodes(): string[] {
    return [
      '000001.SZ', // 平安银行
      '000002.SZ', // 万科A
      '600000.SS', // 浦发银行
      '600036.SS', // 招商银行
      '000858.SZ', // 五粮液
      '600519.SS', // 贵州茅台
      '000799.SZ', // 酒鬼酒
      '002415.SZ', // 海康威视
      '000166.SZ', // 申万宏源
    ];
  }
}
