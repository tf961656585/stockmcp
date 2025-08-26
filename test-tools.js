#!/usr/bin/env node

// 设置环境变量
process.env.ALLTICK_TOKEN = "test_token";
process.env.ALLTICK_RATE_MS = "11000";

import { StockMCPServer } from './dist/index.js';

try {
  const server = new StockMCPServer();
  
  // 获取工具列表
  import('./dist/mcp/index.js').then(mcp => {
    console.log('Available tools:');
    mcp.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.spec.name} - ${tool.spec.description}`);
    });
    console.log(`\nTotal tools: ${mcp.tools.length}`);
  });
} catch (error) {
  console.error('Error:', error.message);
}
