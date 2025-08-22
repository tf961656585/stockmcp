import { McpTool, ToolContext } from '../tooling.js';

export const getDragonTigerTool: McpTool = {
  spec: {
    name: 'get_dragon_tiger',
    description: '获取龙虎榜数据（注意：AllTick API不提供龙虎榜数据）',
    inputSchema: { 
      type: 'object', 
      properties: {
        codes: { 
          type: 'array', 
          items: { type: 'string' },
          description: '指定个股代码列表来查看相关成交数据' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes = args?.codes || dataFetcher.getMainStockCodes();
    
    try {
      // AllTick 不提供龙虎榜数据，但可以获取相关个股的成交数据
      const result = await dataFetcher.getRealtimePrices(codes);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: 'AllTick API不提供龙虎榜数据',
            说明: '龙虎榜数据需要从交易所或其他金融数据提供商获取',
            替代方案: '可以查看个股的成交量数据作为参考',
            个股实时数据: result,
            请求参数: {
              查询代码: codes
            },
            数据时间: new Date().toISOString()
          }, null, 2) 
        }],
        isError: true
      };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '获取数据失败',
            说明: 'AllTick API不提供龙虎榜数据',
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

export default getDragonTigerTool;
