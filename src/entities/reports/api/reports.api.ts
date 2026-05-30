import {
  type FindMonthlyReportsByQuery,
  type ReportPeriod,
  reportPeriodSchema,
} from '@/entities/reports/model/schemas';
import {
  apiClient,
  parseWithSchema,
} from '@/shared/api';

class ReportsApi {
  private readonly client = apiClient;

  getMonthly = async (params?: FindMonthlyReportsByQuery) => {
    const response = await this.client.get<ReportPeriod[]>('/reports/months', { params });
    return parseWithSchema(reportPeriodSchema.array(), response.data);
  };

  getYearly = async () => {
    const response = await this.client.get<ReportPeriod[]>('/reports/years');
    return parseWithSchema(reportPeriodSchema.array(), response.data);
  };
}

export const reportsApi = new ReportsApi();
