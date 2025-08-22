import { McpTool } from './tooling.js';
import getMarketOverview from './get_market_overview/index.js';
import getIndices from './get_indices/index.js';
import getETFs from './get_etfs/index.js';
import getSectors from './get_sectors/index.js';
import getConcepts from './get_concepts/index.js';
import getMarketSentiment from './get_market_sentiment/index.js';
import getCapitalFlow from './get_capital_flow/index.js';
import getFuturesBasis from './get_futures_basis/index.js';
import getDragonTiger from './get_dragon_tiger/index.js';
import analyzeMarketStructure from './analyze_market_structure/index.js';
import getRealtimeMarketData from './get_realtime_market_data/index.js';
import getDataQualityReport from './get_data_quality_report/index.js';

export const tools: McpTool[] = [
  getMarketOverview,
  getIndices,
  getETFs,
  getSectors,
  getConcepts,
  getMarketSentiment,
  getCapitalFlow,
  getFuturesBasis,
  getDragonTiger,
  analyzeMarketStructure,
  getRealtimeMarketData,
  getDataQualityReport,
];

export * from './tooling.js';
