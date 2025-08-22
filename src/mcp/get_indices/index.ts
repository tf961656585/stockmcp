import { McpTool, ToolContext } from '../tooling.js';

export const getIndicesTool: McpTool = {
  spec: {
    name: 'get_indices',
    description: '获取主要股指数据（上证、深证、创业板等）的K线数据',
    inputSchema: { 
      type: 'object', 
      properties: {
        klineType: { 
          type: 'number', 
          description: 'K线类型：1=1分钟, 2=5分钟, 3=15分钟, 4=30分钟, 5=1小时, 8=日线(默认)' 
        },
        numKlines: { 
          type: 'number', 
          description: '获取K线数量，默认为1' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const klineType = args?.klineType || 8; // 默认日线
    const numKlines = args?.numKlines || 1; // 默认1根
    
    const indicesCodes = dataFetcher.getMainIndicesCodes();
    
    try {
      // 批量获取指数K线数据
      const requests = indicesCodes.map((code: string) => ({
        code,
        klineType,
        numKlines
      }));
      
      const result = await dataFetcher.getBatchKlineData(requests);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            指数K线数据: result,
            请求参数: {
              K线类型: klineType,
              K线数量: numKlines,
              指数代码: indicesCodes
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
            错误: '获取指数数据失败',
            详情: error instanceof Error ? error.message : '未知错误',
            请求参数: {
              K线类型: klineType,
              K线数量: numKlines,
              指数代码: indicesCodes
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getIndicesTool;
