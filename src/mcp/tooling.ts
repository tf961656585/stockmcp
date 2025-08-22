import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AllTickDataFetcher } from '../alltick-data-fetcher.js';

export interface ToolContext {
  dataFetcher: AllTickDataFetcher;
}

export interface McpTool {
  spec: Tool;
  handle: (args: any, context: ToolContext) => Promise<{ content: any[]; isError?: boolean }>;
}
