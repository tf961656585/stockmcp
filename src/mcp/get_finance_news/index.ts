import axios from 'axios';
import { McpTool, ToolContext } from '../tooling.js';

const JUHE_API_ENDPOINT = 'http://apis.juhe.cn/fapigx/caijing/query';

async function callJuheFinanceNews(params: Record<string, any>) {
  const key = process.env.JUHE_API_KEY;
  if (!key) {
    throw new Error('缺少 JUHE_API_KEY 环境变量，请在运行前设置聚合数据API Key');
  }

  const resp = await axios.get(JUHE_API_ENDPOINT, {
    params: { key, ...params },
    timeout: 10000,
  });

  const data = resp.data as any;
  if (data?.error_code !== 0) {
    const reason = data?.reason ?? '未知错误';
    const code = data?.error_code ?? -1;
    throw new Error(`Juhe API 错误[${code}]: ${reason}`);
  }
  return data.result;
}

export const getFinanceNewsTool: McpTool = {
  spec: {
    name: 'get_finance_news',
    description: '获取综合财经新闻资讯（来源：聚合数据-财经新闻）。支持数量、分页、随机与关键词筛选。',
    inputSchema: {
      type: 'object',
      properties: {
        num: { type: 'number', description: '返回数量，默认20，最大建议50' },
        page: { type: 'number', description: '页码，从1开始，默认1' },
        rand: { type: 'number', description: '是否随机获取，1为随机，0为否，默认0' },
        word: { type: 'string', description: '检索关键词，可选' },
      },
    },
  },
  async handle(args: any, _ctx: ToolContext) {
    const num = Number.isFinite(args?.num) ? Number(args.num) : undefined;
    const page = Number.isFinite(args?.page) ? Number(args.page) : undefined;
    const rand = args?.rand === 1 || args?.rand === 0 ? args.rand : undefined;
    const word = typeof args?.word === 'string' && args.word.trim() ? args.word.trim() : undefined;

    try {
      const result = await callJuheFinanceNews({ num, page, rand, word });
      return {
        content: [
          { type: 'text', text: JSON.stringify({ 来源: 'juhe', 参数: { num, page, rand, word }, 结果: result }, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                错误: '获取财经新闻失败',
                详情: error instanceof Error ? error.message : String(error),
                提示: '请检查 JUHE_API_KEY 是否正确，以及参数是否符合文档（https://www.juhe.cn/docs/api/id/743）',
                请求参数: { num, page, rand, word },
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  },
};

export const searchFinanceNewsTool: McpTool = {
  spec: {
    name: 'search_finance_news',
    description: '按关键词搜索财经新闻（来源：聚合数据-财经新闻）。word为必填，其它支持分页与数量。',
    inputSchema: {
      type: 'object',
      properties: {
        word: { type: 'string', description: '检索关键词，必填' },
        num: { type: 'number', description: '返回数量，默认20，最大建议50' },
        page: { type: 'number', description: '页码，从1开始，默认1' },
        rand: { type: 'number', description: '是否随机获取，搜索一般无需随机，默认0' },
      },
      required: ['word'],
    },
  },
  async handle(args: any, ctx: ToolContext) {
    return getFinanceNewsTool.handle(args, ctx);
  },
};

const tools = [getFinanceNewsTool, searchFinanceNewsTool];
export default tools;
