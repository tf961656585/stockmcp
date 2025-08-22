import { McpTool, ToolContext } from '../tooling.js';

export const getCapitalFlowTool: McpTool = {
  spec: {
    name: 'get_capital_flow',
    description: '获取资金流向数据（注意：AllTick API不直接提供资金流向分析数据）',
    inputSchema: { 
      type: 'object', 
      properties: {
        codes: { 
          type: 'array', 
          items: { type: 'string' },
          description: '指定代码列表查看成交量数据，如果不提供则使用默认列表' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const codes = args?.codes || [...dataFetcher.getMainIndicesCodes(), ...dataFetcher.getMainETFCodes()];
    
    try {
      // AllTick 不提供资金流向数据，但可以获取成交量等基础数据
      const [klineData, realtimeData] = await Promise.all([
        dataFetcher.getBatchKlineData(codes.map((code: string) => ({ code, klineType: 8, numKlines: 1 }))),
        dataFetcher.getRealtimePrices(codes)
      ]);
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            说明: 'AllTick API不直接提供资金流向分析数据（如北向资金、两融余额、ETF申赎等）',
            建议: '可以基于成交量和价格数据进行简单的资金流向分析',
            K线数据: klineData,
            实时数据: realtimeData,
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
            错误: '获取数据失败',
            说明: 'AllTick API不直接提供资金流向分析数据',
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

export default getCapitalFlowTool;
