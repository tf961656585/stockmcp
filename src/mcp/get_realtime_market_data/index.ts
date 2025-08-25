import { McpTool, ToolContext } from '../tooling.js';

export const getRealtimeMarketDataTool: McpTool = {
  spec: {
    name: 'get_realtime_market_data',
    description: '获取实时市场数据（主要指数、ETF等实时报价）',
    inputSchema: { 
      type: 'object', 
      properties: {
        includeIndices: { type: 'boolean', description: '是否包含指数数据，默认true' },
        includeETFs: { type: 'boolean', description: '是否包含ETF数据，默认false' },
        includeStocks: { type: 'boolean', description: '是否包含个股数据，默认false' }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const includeIndices = args?.includeIndices !== false; // 默认true
    const includeETFs = args?.includeETFs === true; // 默认false
    const includeStocks = args?.includeStocks === true; // 默认false
    
    const codes: string[] = [];
    
    if (includeIndices) {
      codes.push(...dataFetcher.getMainIndicesCodes());
    }
    
    if (includeETFs) {
      codes.push(...dataFetcher.getMainETFCodes());
    }
    
    if (includeStocks) {
      codes.push(...dataFetcher.getMainStockCodes());
    }
    
    try {
      const result = await dataFetcher.getRealtimePrices(codes);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            实时市场数据: result,
            请求参数: {
              包含指数: includeIndices,
              包含ETF: includeETFs,
              包含个股: includeStocks,
              代码列表: codes
            },
            数据时间: new Date().toISOString()
          }, null, 2) 
        }] 
      };
    } catch (error) {
      const e: any = error;
      const extra = e?.alltick ? { allTickBody: e.alltick } : undefined;
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '获取实时市场数据失败',
            详情: error instanceof Error ? error.message : '未知错误',
            ...(extra ? { AllTick返回: extra.allTickBody } : {}),
            请求参数: {
              包含指数: includeIndices,
              包含ETF: includeETFs,
              包含个股: includeStocks,
              代码列表: codes
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getRealtimeMarketDataTool;
