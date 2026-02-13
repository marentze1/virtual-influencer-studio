export type TrendSignal = {
  source: string;
  title: string;
  snippet: string;
  url?: string;
};

export interface TrendConnector {
  id: string;
  label: string;
  description: string;
  fetchSignals(query: string): Promise<TrendSignal[]>;
}

export class GoogleTrendsLikeConnector implements TrendConnector {
  id = "google-trends-like";
  label = "Google Trends-like Adapter";
  description = "Interface stub to wire an official trend API provider later.";

  async fetchSignals(query: string): Promise<TrendSignal[]> {
    void query;
    return [];
  }
}

export class RssTrendsConnector implements TrendConnector {
  id = "rss-feeds";
  label = "RSS Feed Adapter";
  description = "Reads trend signals from configured RSS feeds (stub for MVP).";

  async fetchSignals(query: string): Promise<TrendSignal[]> {
    void query;
    return [];
  }
}

export const trendConnectors: TrendConnector[] = [
  new GoogleTrendsLikeConnector(),
  new RssTrendsConnector()
];
