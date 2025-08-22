import { McpTool, ToolContext } from '../tooling.js';

export const getFuturesBasisTool: McpTool = {
  spec: {
    name: 'get_futures_basis',
    description: '获取期货数据（AllTick支持期货数据获取）',
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
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes = args?.codes || ['IF2412.CFE', 'IC2412.CFE', 'IH2412.CFE']; // 默认期货代码
    const klineType = args?.klineType || 8; // 默认日线
    
    try {
      // 获取期货K线数据
      const requests = codes.map((code: string) => ({
        code,
        klineType,
        numKlines: 1
      }));
      
      const result = await dataFetcher.getBatchKlineData(requests);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            期货数据: result,
            说明: '基差需要通过期货价格与现货价格对比计算得出',
            请求参数: {
              期货代码: codes,
              K线类型: klineType
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
            错误: '获取期货数据失败',
            详情: error instanceof Error ? error.message : '未知错误',
            说明: '请确保期货代码格式正确，如IF2412.CFE',
            请求参数: {
              期货代码: codes,
              K线类型: klineType
            }
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getFuturesBasisTool;
