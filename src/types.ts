// AllTick API 响应类型定义

// AllTick K线数据响应
export interface AllTickKlineResponse {
  ret: number;
  msg: string;
  data: {
    kline_list: Array<{
      timestamp: string;
      open_price: string;
      close_price: string;
      high_price: string;
      low_price: string;
      volume: string;
      turnover: string;
    }>;
  };
}

// AllTick 实时报价响应
export interface AllTickTradeTickResponse {
  ret: number;
  msg: string;
  data: {
    tick_list: Array<{
      code: string;
      price: string;
      volume: string;
      turnover: string;
      timestamp: string;
    }>;
  };
}

// AllTick 批量K线响应
export interface AllTickBatchKlineResponse {
  ret: number;
  msg: string;
  data: {
    data_list: AllTickKlineResponse['data'][];
  };
}

// AllTick 静态信息响应
export interface AllTickStaticInfoResponse {
  ret: number;
  msg: string;
  data: {
    symbol_list: Array<{
      code: string;
      name: string;
      exchange: string;
      type: string;
    }>;
  };
}