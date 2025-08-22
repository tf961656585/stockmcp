import { McpTool, ToolContext } from '../tooling.js';

export const getDataQualityReportTool: McpTool = {
  spec: {
    name: 'get_data_quality_report',
    description: '生成AllTick数据质量报告',
    inputSchema: { 
      type: 'object', 
      properties: {
        testCodes: { 
          type: 'array', 
          items: { type: 'string' },
          description: '用于测试的代码列表，如果不提供则使用默认测试列表' 
        }
      }
    }
  },
  async handle(args: any, { dataFetcher }: ToolContext) {
    const testCodes = args?.testCodes || [
      ...dataFetcher.getMainIndicesCodes().slice(0, 2),
      ...dataFetcher.getMainETFCodes().slice(0, 2),
      ...dataFetcher.getMainStockCodes().slice(0, 2)
    ];
    
    const report: any = {
      报告生成时间: new Date().toISOString(),
      测试代码: testCodes,
      数据质量结果: {
        接口可用性: {},
        数据完整性: {},
        响应速度: {}
      }
    };
    
    const startTime = Date.now();
    
    try {
      // 测试实时数据接口
      try {
        const realtimeStart = Date.now();
        const realtimeData = await dataFetcher.getRealtimePrices(testCodes);
        const realtimeEnd = Date.now();
        
        report.数据质量结果.接口可用性.实时数据接口 = {
          状态: realtimeData.ret === 200 ? '正常' : '异常',
          返回码: realtimeData.ret,
          响应时间: `${realtimeEnd - realtimeStart}ms`
        };
        
        report.数据质量结果.数据完整性.实时数据 = {
          请求代码数: testCodes.length,
          返回数据条数: realtimeData.data?.tick_list?.length || 0,
          完整率: `${((realtimeData.data?.tick_list?.length || 0) / testCodes.length * 100).toFixed(2)}%`
        };
      } catch (error) {
        report.数据质量结果.接口可用性.实时数据接口 = {
          状态: '异常',
          错误: error instanceof Error ? error.message : '未知错误'
        };
      }
      
      // 测试K线数据接口
      try {
        const klineStart = Date.now();
        const klineData = await dataFetcher.getKlineData(testCodes[0], 8, 1);
        const klineEnd = Date.now();
        
        report.数据质量结果.接口可用性.K线数据接口 = {
          状态: klineData.ret === 200 ? '正常' : '异常',
          返回码: klineData.ret,
          响应时间: `${klineEnd - klineStart}ms`
        };
        
        report.数据质量结果.数据完整性.K线数据 = {
          请求代码: testCodes[0],
          返回K线条数: klineData.data?.kline_list?.length || 0,
          数据字段完整性: klineData.data?.kline_list?.[0] ? '完整' : '不完整'
        };
      } catch (error) {
        report.数据质量结果.接口可用性.K线数据接口 = {
          状态: '异常',
          错误: error instanceof Error ? error.message : '未知错误'
        };
      }
      
      // 测试静态信息接口
      try {
        const staticStart = Date.now();
        const staticData = await dataFetcher.getStaticInfo(testCodes.slice(0, 2));
        const staticEnd = Date.now();
        
        report.数据质量结果.接口可用性.静态信息接口 = {
          状态: staticData.ret === 200 ? '正常' : '异常',
          返回码: staticData.ret,
          响应时间: `${staticEnd - staticStart}ms`
        };
      } catch (error) {
        report.数据质量结果.接口可用性.静态信息接口 = {
          状态: '异常',
          错误: error instanceof Error ? error.message : '未知错误'
        };
      }
      
      const totalTime = Date.now() - startTime;
      report.数据质量结果.响应速度.总测试时间 = `${totalTime}ms`;
      
      // 生成质量评分
      const availableAPIs = Object.values(report.数据质量结果.接口可用性).filter((api: any) => api.状态 === '正常').length;
      const totalAPIs = Object.keys(report.数据质量结果.接口可用性).length;
      report.质量评分 = {
        接口可用率: `${(availableAPIs / totalAPIs * 100).toFixed(2)}%`,
        总体评价: availableAPIs === totalAPIs ? '优秀' : availableAPIs >= totalAPIs * 0.7 ? '良好' : '需改善'
      };
      
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify(report, null, 2) 
        }] 
      };
    } catch (error) {
      return { 
        content: [{ 
          type: 'text', 
          text: JSON.stringify({
            错误: '数据质量报告生成失败',
            详情: error instanceof Error ? error.message : '未知错误',
            报告生成时间: new Date().toISOString(),
            测试代码: testCodes
          }, null, 2) 
        }],
        isError: true
      };
    }
  }
};

export default getDataQualityReportTool;
