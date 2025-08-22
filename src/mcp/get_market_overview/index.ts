import { McpTool, ToolContext } from '../tooling.js';

export const getMarketOverviewTool: McpTool = {
  spec: {
    name: 'get_market_overview',
    description: '获取A股市场概览数据，包括主要指数、ETF等综合数据',
    inputSchema: { 
      type: 'object', 
      properties: {
        includeRealtime: { type: 'boolean', description: '是否包含实时报价，默认true' },
        includeKline: { type: 'boolean', description: '是否包含K线数据，默认true' }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const includeRealtime = args?.includeRealtime !== false; // 默认true
    const includeKline = args?.includeKline !== false; // 默认true
    
    try {
      const results: any = {
        市场概览: {
          更新时间: new Date().toISOString()
        }
      };
      
      if (includeRealtime) {
        // 获取实时报价数据
        const indicesCodes = dataFetcher.getMainIndicesCodes();
        const etfCodes = dataFetcher.getMainETFCodes();
        const allCodes = [...indicesCodes, ...etfCodes];
        
        const realtimeData = await dataFetcher.getRealtimePrices(allCodes);
        results.市场概览.实时数据 = realtimeData;
      }
      
      if (includeKline) {
        // 获取K线数据
        const indicesCodes = dataFetcher.getMainIndicesCodes();
        const requests = indicesCodes.map((code: string) => ({
          code,
          klineType: 8, // 日线
          numKlines: 1
        }));
        
        const klineData = await dataFetcher.getBatchKlineData(requests);
        results.市场概览.K线数据 = klineData;
      }
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(results, null, 2) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '获取市场概览数据失败',
            详情: error instanceof Error ? error.message : '未知错误',
            请求参数: {
              包含实时数据: includeRealtime,
              包含K线数据: includeKline
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getMarketOverviewTool;
