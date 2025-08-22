import { McpTool, ToolContext } from '../tooling.js';

export const analyzeMarketStructureTool: McpTool = {
  spec: {
    name: 'analyze_market_structure',
    description: '基于AllTick数据分析市场结构',
    inputSchema: { 
      type: 'object', 
      properties: {
        period: { 
          type: 'string', 
          enum: ['1m', '5m', '15m', '30m', '1h', '1d'],
          description: '分析周期，默认为1d(日线)' 
        },
        numKlines: { 
          type: 'number', 
          description: '用于分析的K线数量，默认为5' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const periodMap: { [key: string]: number } = {
      '1m': 1, '5m': 2, '15m': 3, '30m': 4, '1h': 5, '1d': 8
    };
    const period = args?.period || '1d';
    const klineType = periodMap[period] || 8;
    const numKlines = args?.numKlines || 5;
    
    try {
      // 获取主要指数和ETF的K线数据用于分析
      const indicesCodes = dataFetcher.getMainIndicesCodes();
      const etfCodes = dataFetcher.getMainETFCodes();
      const stockCodes = dataFetcher.getMainStockCodes();
      
      const requests = [
        ...indicesCodes.map((code: string) => ({ code, klineType, numKlines })),
        ...etfCodes.slice(0, 3).map((code: string) => ({ code, klineType, numKlines })),
        ...stockCodes.slice(0, 5).map((code: string) => ({ code, klineType, numKlines }))
      ];
      
      const [klineData, realtimeData] = await Promise.all([
        dataFetcher.getBatchKlineData(requests),
        dataFetcher.getRealtimePrices([...indicesCodes, ...etfCodes.slice(0, 3)])
      ]);
      
      // 简单的市场结构分析
      const analysis = {
        分析周期: period,
        K线数量: numKlines,
        指数表现: '基于获取的指数K线数据分析',
        ETF表现: '基于获取的ETF K线数据分析',
        个股表现: '基于获取的个股K线数据分析',
        建议: '请根据K线数据中的价格、成交量变化判断市场结构',
        数据时间: new Date().toISOString()
      };
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            市场结构分析: analysis,
            K线数据: klineData,
            实时数据: realtimeData,
            请求参数: {
              分析周期: period,
              K线类型: klineType,
              K线数量: numKlines
            }
          }, null, 2) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '市场结构分析失败',
            详情: error instanceof Error ? error.message : '未知错误',
            请求参数: {
              分析周期: period,
              K线类型: klineType,
              K线数量: numKlines
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default analyzeMarketStructureTool;
