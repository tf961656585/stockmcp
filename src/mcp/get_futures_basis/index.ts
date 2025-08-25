import { McpTool, ToolContext } from '../tooling.js';

const toNum = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : NaN;
};

export const getFuturesBasisTool: McpTool = {
  spec: {
    name: 'get_futures_basis',
  description: '计算期指基差：期货实时价-对应现货指数实时价（基于AllTick行情）',
    inputSchema: { 
      type: 'object', 
      properties: {
        codes: { 
          type: 'array', 
          items: { type: 'string' },
          description: '期货代码列表，如["IF2412.CFE", "IC2412.CFE", "IH2412.CFE"]等' 
        },
        klineType: { 
          type: 'number', 
          description: 'K线类型：1=1分钟, 2=5分钟, 3=15分钟, 4=30分钟, 5=1小时, 8=日线(默认)' 
        },
        spotMapping: {
          type: 'object',
          description: '期货到现货指数的映射，默认{"IF":"000300.SH","IC":"000905.SH","IH":"000016.SH"}'
        },
        useRealtime: { type: 'boolean', description: '是否拉取实时价格计算，默认true；false时基于最新日K收盘近似' }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes = args?.codes || ['IF2412.CFE', 'IC2412.CFE', 'IH2412.CFE']; // 默认期货代码
    const klineType = args?.klineType || 8; // 默认日线
    const useRealtime: boolean = args?.useRealtime !== false;
    const spotMapping: Record<string, string> = args?.spotMapping || {
      IF: '000300.SH', IC: '000905.SH', IH: '000016.SH'
    };
    
    try {
      // 1) 提取期货主代码前缀映射到现货指数code
      const futuresToSpot: Record<string, string> = {};
      for (const f of codes) {
        const m = f.match(/^([A-Z]{2})/i);
        const prefix = m ? m[1].toUpperCase() : '';
        if (prefix && spotMapping[prefix]) futuresToSpot[f] = spotMapping[prefix];
      }

      const spotCodes = Object.values(futuresToSpot);

      // 2) 获取实时价格（优先）或回退到日K收盘价
      let rtFut: Map<string, number> = new Map();
      let rtSpot: Map<string, number> = new Map();

      if (useRealtime) {
        const [rtF, rtS] = await Promise.all([
          dataFetcher.getRealtimePrices(codes),
          dataFetcher.getRealtimePrices(spotCodes)
        ]);
        if (rtF?.data?.tick_list) rtF.data.tick_list.forEach(t => rtFut.set(t.code, toNum(t.price)));
        if (rtS?.data?.tick_list) rtS.data.tick_list.forEach(t => rtSpot.set(t.code, toNum(t.price)));
      }

  const needKlineF = codes.filter((c: string) => !rtFut.has(c));
  const needKlineS = spotCodes.filter((c: string) => !rtSpot.has(c));
      if (needKlineF.length > 0) {
  const r = await dataFetcher.getBatchKlineData(needKlineF.map((code: string) => ({ code, klineType, numKlines: 1 })));
        r?.data?.data_list?.forEach((d, i) => {
          const code = needKlineF[i];
          const last = d?.kline_list?.[d.kline_list.length - 1];
          if (last) rtFut.set(code, toNum(last.close_price));
        });
      }
      if (needKlineS.length > 0) {
  const r = await dataFetcher.getBatchKlineData(needKlineS.map((code: string) => ({ code, klineType, numKlines: 1 })));
        r?.data?.data_list?.forEach((d, i) => {
          const code = needKlineS[i];
          const last = d?.kline_list?.[d.kline_list.length - 1];
          if (last) rtSpot.set(code, toNum(last.close_price));
        });
      }

      // 3) 计算基差
      const rows: Array<{ future: string; spot: string | null; futurePrice: number | null; spotPrice: number | null; basis: number | null }>
        = [];
      for (const fut of codes) {
        const spot = futuresToSpot[fut] || null;
        const fP = rtFut.has(fut) ? rtFut.get(fut)! : null;
        const sP = spot && rtSpot.has(spot) ? rtSpot.get(spot)! : null;
        const basis = Number.isFinite(fP as any) && Number.isFinite(sP as any) ? (fP! - sP!) : null;
        rows.push({ future: fut, spot, futurePrice: fP, spotPrice: sP, basis });
      }

      const result = {
        统计时间: new Date().toISOString(),
        使用实时: useRealtime,
        基差: rows,
        说明: '基差=期指价-现货指数价；若实时缺失则回退到最新日K收盘价。'
      };

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '获取期货数据失败',
            详情: error instanceof Error ? error.message : '未知错误',
            说明: '请确保期货代码格式正确，如IF2412.CFE',
            请求参数: { 期货代码: codes, K线类型: klineType }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getFuturesBasisTool;
