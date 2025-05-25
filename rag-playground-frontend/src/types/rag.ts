export interface Source {
  content: string;
  page?: number;
  score?: number;
  retriever?: string;
}

export interface MetricStep {
  name: string;
  duration: number;
  chunks?: number;
  vectors?: number;
}

export interface MemoryUsage {
  embedding_size: number;
  total_chunks: number;
  avg_chunk_size: number;
}

export interface PerformanceMetrics {
  relevance_scores: number[];
  diversity_score: number;
  context_usage: number;
  confidence_score: number;
}

export interface Metrics {
  start_time: number;
  total_duration: number;
  steps: MetricStep[];
  memory_usage: MemoryUsage;
  performance_metrics: PerformanceMetrics;
}

export interface RAGResult {
  architecture: string;
  answer: string;
  sources: Source[];
  metadata: {
    chunks: number;
    embedding_model: string;
    total_tokens: number;
    retriever_type: string;
    reranker_model?: string;
  };
  metrics?: Metrics;
  time: number;
}
