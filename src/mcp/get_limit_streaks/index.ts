import { McpTool, ToolContext } from '../tooling.js';

const toNum = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : NaN;
};

function computePct(prev: number, cur: number): number {
  if (!Number.isFinite(prev) || prev <= 0 || !Number.isFinite(cur)) return NaN;
  return (cur - prev) / prev;
}

export const getLimitStreaksTool: McpTool = {
  spec: {
    name: 'get_limit_streaks',
    description: '统计给定股票池的连板高度与晋级率（用固定阈值近似涨停判定）',
    inputSchema: {
      type: 'object',
      properties: {
        codes: { type: 'array', items: { type: 'string' }, description: '股票列表；不传则用内置示例' },
        lookbackDays: { type: 'number', description: '回溯日数(含当日)，默认6个交易日' },
        upThreshold: { type: 'number', description: '涨停阈值，默认0.0985' },
        includeSamples: { type: 'boolean', description: '是否返回样本与序列，默认false' }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes: string[] = Array.isArray(args?.codes) && args.codes.length > 0
      ? args.codes
      : dataFetcher.getMainStockCodes();
    const lookback: number = typeof args?.lookbackDays === 'number' ? Math.max(2, Math.floor(args.lookbackDays)) : 6;
    const upThr: number = typeof args?.upThreshold === 'number' ? args.upThreshold : 0.0985;
    const includeSamples: boolean = args?.includeSamples === true;

    try {
      // 取lookback+1根，便于计算每日相对前收涨幅
      const requests = codes.map(code => ({ code, klineType: 8, numKlines: lookback + 1 }));
      const batch = await dataFetcher.getBatchKlineData(requests);

      type Seq = { code: string; limitFlags: number[]; highestStreak: number; todayStreak: number };
      const seqs: Seq[] = [];

      batch?.data?.data_list?.forEach((d, idx) => {
        const code = codes[idx];
        const list = Array.isArray(d?.kline_list) ? d.kline_list.slice() : [];
        // 升序
        list.sort((a, b) => toNum(a.timestamp) - toNum(b.timestamp));
        if (list.length < 2) return; // 无法判断

        // 最近lookback日，逐日判定是否涨停（close/prev_close-1 >= upThr）
        const flags: number[] = [];
        for (let i = Math.max(1, list.length - lookback); i < list.length; i++) {
          const prev = toNum(list[i - 1]?.close_price);
          const cur = toNum(list[i]?.close_price);
          const pct = computePct(prev, cur);
          flags.push(Number(pct >= upThr));
        }
        // 最高连板高度
        let maxRun = 0, curRun = 0;
        for (const f of flags) {
          if (f) { curRun += 1; maxRun = Math.max(maxRun, curRun); } else { curRun = 0; }
        }
        // 今日（序列最后一日）是否延续连板
        let todayStreak = 0;
        for (let i = flags.length - 1; i >= 0; i--) {
          if (flags[i] === 1) todayStreak += 1; else break;
        }
        seqs.push({ code, limitFlags: flags, highestStreak: maxRun, todayStreak });
      });

      // 晋级率：上一日有连板(>=1)，且今日继续连板的样本数 / 上一日有连板的样本数
      let prevLimit = 0;
      let advanced = 0;
      for (const s of seqs) {
        const len = s.limitFlags.length;
        if (len < 2) continue;
        const ytdWasLimit = s.limitFlags[len - 2] === 1; // 昨日涨停
        const todayLimit = s.limitFlags[len - 1] === 1;  // 今日涨停
        if (ytdWasLimit) {
          prevLimit += 1;
          if (todayLimit) advanced += 1;
        }
      }
      const promotionRate = prevLimit > 0 ? advanced / prevLimit : 0;

      // 最高连板高度
      const highest = seqs.reduce((m, s) => Math.max(m, s.highestStreak), 0);
      const todayHighest = seqs.reduce((m, s) => Math.max(m, s.todayStreak), 0);

      const result = {
        统计时间: new Date().toISOString(),
        样本数: codes.length,
        参数: { lookbackDays: lookback, upThreshold: upThr },
        指标: {
          最高连板高度: highest,
          今日连板高度: todayHighest,
          晋级率: promotionRate
        },
        说明: '阈值近似，不区分ST/20cm/不同板制度；以日K收盘对比前收估算涨停。',
        样本: includeSamples ? seqs : undefined
      } as any;

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            错误: '连板统计失败',
            详情: error instanceof Error ? error.message : '未知错误'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
};

export default getLimitStreaksTool;
