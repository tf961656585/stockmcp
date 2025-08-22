import { McpTool, ToolContext } from '../tooling.js';

export const getMarketSentimentTool: McpTool = {
  spec: {
    name: 'get_market_sentiment',
    description: '获取市场情绪数据（注意：AllTick API不直接提供市场情绪分析数据）',
    inputSchema: { 
      type: 'object', 
      properties: {
        codes: { 
          type: 'array', 
          items: { type: 'string' },
          description: '指定个股代码列表来分析，如果不提供则使用默认个股列表' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes = args?.codes || dataFetcher.getMainStockCodes();
    
    try {
      // AllTick 不提供市场情绪数据，但可以获取相关个股数据进行简单分析
      const realtimeData = await dataFetcher.getRealtimePrices(codes);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            说明: 'AllTick API不直接提供市场情绪分析数据（如涨停家数、连板统计、北向资金等）',
            建议: '可以基于个股实时数据进行简单的情绪分析',
            个股实时数据: realtimeData,
            请求参数: {
              查询代码: codes
            },
            数据时间: new Date().toISOString()
          }, null, 2) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '获取市场数据失败',
            说明: 'AllTick API不直接提供市场情绪分析数据',
            详情: error instanceof Error ? error.message : '未知错误',
            请求参数: {
              查询代码: codes
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getMarketSentimentTool;
