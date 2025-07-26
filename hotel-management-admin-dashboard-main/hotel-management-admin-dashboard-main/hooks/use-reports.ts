import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useReports(reportType: string, startDate: string, endDate: string) {
  const { data, error, mutate } = useSWR(
    reportType && startDate && endDate 
      ? `/api/reports/${reportType}?startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false, // Don't auto-refresh on focus for reports
    }
  );

  return {
    report: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useOccupancyReport(startDate: string, endDate: string) {
  const { data, error, mutate } = useSWR(
    startDate && endDate 
      ? `/api/reports/occupancy?startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  return {
    occupancyReport: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useRevenueReport(startDate: string, endDate: string) {
  const { data, error, mutate } = useSWR(
    startDate && endDate 
      ? `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  return {
    revenueReport: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useUtilizationReport(startDate: string, endDate: string) {
  const { data, error, mutate } = useSWR(
    startDate && endDate 
      ? `/api/reports/utilization?startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  return {
    utilizationReport: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useComprehensiveReport(startDate: string, endDate: string) {
  const { data, error, mutate } = useSWR(
    startDate && endDate 
      ? `/api/reports/comprehensive?startDate=${startDate}&endDate=${endDate}`
      : null,
    fetcher,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  return {
    comprehensiveReport: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}