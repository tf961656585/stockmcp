import { McpTool, ToolContext } from '../tooling.js';

// 辅助：将字符串数字安全转为number
const toNum = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : NaN;
};

export const getLimitBreadthTool: McpTool = {
  spec: {
    name: 'get_limit_breadth',
    description: '统计给定股票池的涨停/跌停家数（基于AllTick实时报价+日K前收，简化阈值判定）',
    inputSchema: {
      type: 'object',
      properties: {
        codes: { type: 'array', items: { type: 'string' }, description: '股票代码列表，如["000001.SZ","600519.SH"]；不传则用内置示例股票池' },
        upThreshold: { type: 'number', description: '涨停判定阈值(比例)，默认0.0985≈+9.85%' },
        downThreshold: { type: 'number', description: '跌停判定阈值(比例)，默认-0.0985≈-9.85%' },
        includeLists: { type: 'boolean', description: '是否返回达标股票清单，默认false' },
        useRealtime: { type: 'boolean', description: '是否使用实时报价作为当前价，默认true；若无实时则回退到最新日K收盘' }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes: string[] = Array.isArray(args?.codes) && args.codes.length > 0
      ? args.codes
      : dataFetcher.getMainStockCodes();
    const upThr: number = typeof args?.upThreshold === 'number' ? args.upThreshold : 0.0985;
    const downThr: number = typeof args?.downThreshold === 'number' ? args.downThreshold : -0.0985;
    const includeLists: boolean = args?.includeLists === true;
    const useRealtime: boolean = args?.useRealtime !== false; // 默认true

    try {
      // 1) 获取日K(至少2根，用于前收)；2) 获取实时(可选)
      const [klineBatch, realtime] = await Promise.all([
        dataFetcher.getBatchKlineData(codes.map(code => ({ code, klineType: 8, numKlines: 2 }))),
        useRealtime ? dataFetcher.getRealtimePrices(codes) : Promise.resolve(null as any)
      ]);

      const prevCloseMap = new Map<string, number>();
      const latestCloseMap = new Map<string, number>();
      klineBatch?.data?.data_list?.forEach((d, idx) => {
        const code = codes[idx];
        const list = Array.isArray(d?.kline_list) ? d.kline_list.slice() : [];
        // 假设按时间升序，否则排序
        list.sort((a, b) => toNum(a.timestamp) - toNum(b.timestamp));
        if (list.length >= 1) {
          const last = list[list.length - 1];
          latestCloseMap.set(code, toNum(last?.close_price));
        }
        if (list.length >= 2) {
          const prev = list[list.length - 2];
          prevCloseMap.set(code, toNum(prev?.close_price));
        }
      });

      const rtMap = new Map<string, number>();
      const invalidCodes = (realtime as any)?.meta?.invalid_codes || [];
      if (realtime?.data?.tick_list) {
        for (const t of realtime.data.tick_list) {
          rtMap.set(t.code, toNum(t.price));
        }
      }

      let upCount = 0;
      let downCount = 0;
      const upList: string[] = [];
      const downList: string[] = [];
      const details: Array<{ code: string; pct: number; used: 'realtime' | 'kline' | 'skip'; reason?: string }>
        = [];

      for (const code of codes) {
        const prev = prevCloseMap.get(code);
        if (!Number.isFinite(prev) || prev! <= 0) {
          details.push({ code, pct: NaN, used: 'skip', reason: 'no_prev_close' });
          continue;
        }
        const cur = useRealtime && rtMap.has(code) ? rtMap.get(code)! : latestCloseMap.get(code);
        if (!Number.isFinite(cur) || cur! <= 0) {
          details.push({ code, pct: NaN, used: 'skip', reason: 'no_current_price' });
          continue;
        }
        const pct = (cur! - prev!) / prev!;
        const used: any = useRealtime && rtMap.has(code) ? 'realtime' : 'kline';
        if (pct >= upThr) {
          upCount += 1;
          if (includeLists) upList.push(code);
        } else if (pct <= downThr) {
          downCount += 1;
          if (includeLists) downList.push(code);
        }
        details.push({ code, pct, used });
      }

      const result = {
        统计时间: new Date().toISOString(),
        总样本数: codes.length,
        阈值: { 涨停: upThr, 跌停: downThr },
        结果: { 涨停家数: upCount, 跌停家数: downCount },
        清单: includeLists ? { 涨停: upList, 跌停: downList } : undefined,
        数据来源: { 使用实时: useRealtime, 实时不可用回退日K: true },
        实时无效代码: invalidCodes?.length ? invalidCodes : undefined,
        说明: '未使用交易所涨跌停价字段，采用固定阈值近似，ST/20cm等标的会有偏差。'
      } as any;

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            错误: '统计失败',
            详情: error instanceof Error ? error.message : '未知错误',
            请求参数: { codes, upThr, downThr }
          }, null, 2)
        }],
        isError: true
      };
    }
  }
};

export default getLimitBreadthTool;
