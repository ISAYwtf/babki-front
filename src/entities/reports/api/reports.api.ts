import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type MonthSummaryQuery,
  monthSummaryQuerySchema,
  summarySchema,
  type YearSummaryQuery,
  yearSummaryQuerySchema,
} from '../model/schemas';

class ReportsApi {
  private readonly client = apiClient;

  async getMonthlySummary(query: MonthSummaryQuery) {
    const params = monthSummaryQuerySchema.parse(query);
    const response = await this.client.get('/summaries/month', { params });

    return parseWithSchema(summarySchema, response.data);
  }

  async getYearlySummary(query: YearSummaryQuery) {
    const params = yearSummaryQuerySchema.parse(query);
    const response = await this.client.get('/summaries/year', { params });

    return parseWithSchema(summarySchema, response.data);
  }
}

export const reportsApi = new ReportsApi();
