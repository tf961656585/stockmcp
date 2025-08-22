#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { AllTickDataFetcher } from './alltick-data-fetcher.js';
import { tools as mcpTools, ToolContext } from './mcp/index.js';

class StockMCPServer {
  private server: Server;
  private dataFetcher: AllTickDataFetcher;

  constructor() {
    this.server = new Server(
      {
        name: 'stock-mcp-server',
        version: '1.0.0',
      }
    );

    // 从环境变量获取 AllTick token
    const token = process.env.ALLTICK_TOKEN;
    if (!token) {
      throw new Error('ALLTICK_TOKEN environment variable is required');
    }

    this.dataFetcher = new AllTickDataFetcher(token);
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    const context: ToolContext = {
      dataFetcher: this.dataFetcher,
    };

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: mcpTools.map(t => t.spec) as Tool[] };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      try {
        const tool = mcpTools.find(t => t.spec.name === name);
        if (!tool) throw new Error(`未知工具: ${name}`);
        return await tool.handle(args, context);
      } catch (error) {
        return {
          content: [{ type: 'text', text: `执行工具 ${name} 时发生错误: ${error instanceof Error ? error.message : String(error)}` }],
        };
      }
    });
  }

  // 下面保留分析与时间辅助函数，供其它文件参考复用

  private getMarketStatus(): string {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    if (day === 0 || day === 6) return '休市';
    const currentTime = hour * 60 + minute;
    const morningStart = 9 * 60 + 30;
    const morningEnd = 11 * 60 + 30;
    const afternoonStart = 13 * 60;
    const afternoonEnd = 15 * 60;
    if (currentTime >= morningStart && currentTime <= morningEnd) return '上午交易中';
    if (currentTime >= afternoonStart && currentTime <= afternoonEnd) return '下午交易中';
    if (currentTime > morningEnd && currentTime < afternoonStart) return '午间休市';
    if (currentTime < morningStart) return '开盘前';
    return '收盘后';
  }

  // 其余原内联工具处理函数已迁移到 src/mcp/*

  

  

  

  

  

  

  private analyzeSentiment(data: any): string {
    const { sentiment, indices, hotSectors } = data;
    
    return `
市场情绪分析 (${new Date().toLocaleString('zh-CN')})

## 情绪温度计
- 涨停家数: ${sentiment.limitUpCount}家
- 跌停家数: ${sentiment.limitDownCount}家
- 涨跌停比: ${sentiment.limitUpCount > 0 ? (sentiment.limitUpCount / (sentiment.limitUpCount + sentiment.limitDownCount) * 100).toFixed(1) : 0}%

## 主要指数表现
${indices.slice(0, 4).map((idx: any) => 
  `- ${idx.name}: ${idx.changePercent > 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`
).join('\n')}

## 板块活跃度
${hotSectors.slice(0, 5).map((sector: any, index: number) => 
  `${index + 1}. ${sector.name}: ${sector.changePercent > 0 ? '+' : ''}${sector.changePercent.toFixed(2)}%`
).join('\n')}

## 资金流向
- 北向资金: ${sentiment.northboundFlow > 0 ? '净流入' : '净流出'} ${Math.abs(sentiment.northboundFlow / 10000).toFixed(2)}亿
 - 北向资金: ${sentiment.northboundFlow > 0 ? '净流入' : '净流出'} ${Math.abs(sentiment.northboundFlow).toFixed(2)}亿

## 情绪判断
${this.getSentimentLevel(sentiment, indices)}
    `.trim();
  }

  private analyzeRotation(data: any): string {
    const { hotSectors, hotConcepts, etfs } = data;
    
    return `
板块轮动分析 (${new Date().toLocaleString('zh-CN')})

## 热门行业轮动
${hotSectors.slice(0, 8).map((sector: any, index: number) => 
  `${index + 1}. ${sector.name}: ${sector.changePercent > 0 ? '+' : ''}${sector.changePercent.toFixed(2)}%`
).join('\n')}

## 概念题材活跃度
${hotConcepts.slice(0, 8).map((concept: any, index: number) => 
  `${index + 1}. ${concept.name}: ${concept.changePercent > 0 ? '+' : ''}${concept.changePercent.toFixed(2)}%`
).join('\n')}

## ETF资金偏好
${etfs.slice(0, 5).map((etf: any) => 
  `- ${etf.name}: ${etf.changePercent > 0 ? '+' : ''}${etf.changePercent.toFixed(2)}%`
).join('\n')}

## 轮动特征
${this.getRotationPattern(hotSectors, hotConcepts)}
    `.trim();
  }

  private analyzeRisk(data: any): string {
    const { sentiment, indices } = data;
    
    return `
风险监控分析 (${new Date().toLocaleString('zh-CN')})

## 市场风险指标
- 跌停家数: ${sentiment.limitDownCount}家
- 主要指数跌幅: ${indices.filter((idx: any) => idx.changePercent < 0).length}个下跌

## 资金面风险
- 北向资金流向: ${sentiment.northboundFlow > 0 ? '流入' : '流出'}
- 两融余额: ${sentiment.marginBalance}亿

## 风险等级
${this.getRiskLevel(sentiment, indices)}
    `.trim();
  }

  private getSentimentLevel(sentiment: any, indices: any): string {
    const upCount = sentiment.limitUpCount;
    const downCount = sentiment.limitDownCount;
    const mainIndexChange = indices[0]?.changePercent || 0;
    
    if (upCount > 100 && mainIndexChange > 1) {
      return "情绪偏强，市场活跃度较高";
    } else if (upCount > 50 && mainIndexChange > 0) {
      return "情绪中性偏强，有一定赚钱效应";
    } else if (downCount > 50 || mainIndexChange < -1) {
      return "情绪偏弱，风险偏好下降";
    } else {
      return "情绪震荡，观望情绪较浓";
    }
  }

  private getRotationPattern(sectors: any[], concepts: any[]): string {
    const strongSectors = sectors.filter(s => s.changePercent > 3).length;
    const strongConcepts = concepts.filter(c => c.changePercent > 5).length;
    
    if (strongSectors > 3 && strongConcepts > 5) {
      return "板块轮动活跃，题材扩散明显";
    } else if (strongSectors > 1) {
      return "有明确主线，轮动相对集中";
    } else {
      return "缺乏明确主线，资金观望为主";
    }
  }

  private getRiskLevel(sentiment: any, indices: any): string {
    const downCount = sentiment.limitDownCount;
    const negativeIndices = indices.filter((idx: any) => idx.changePercent < -2).length;
    
    if (downCount > 100 || negativeIndices > 2) {
      return "风险等级：高";
    } else if (downCount > 30 || negativeIndices > 1) {
      return "风险等级：中";
    } else {
      return "风险等级：低";
    }
  }

  private analyzeOverall(data: any): string {
    return `
综合市场分析 (${new Date().toLocaleString('zh-CN')})

${this.analyzeSentiment(data)}

${this.analyzeRotation(data)}

${this.analyzeRisk(data)}
    `.trim();
  }

  

  

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // 已移除缓存更新调度器

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('股市MCP服务器已启动');
  }
}

const server = new StockMCPServer();
server.run().catch(console.error);