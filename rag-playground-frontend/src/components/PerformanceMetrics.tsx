import { motion } from 'framer-motion';
import { Metrics } from '@/types/rag';

interface PerformanceMetricsProps {
  metrics: Metrics | undefined;
  architecture?: string;  // Make optional since it's not used
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  if (!metrics?.performance_metrics) return null;

  const {
    diversity_score,
    context_usage,
    confidence_score
  } = metrics.performance_metrics;

  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-4 space-y-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Analysis</h3>
      
      {/* Scores Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-blue-400 mb-1">Context Usage</div>
          <div className="text-xl font-bold text-gray-200">
            {(context_usage * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-purple-400 mb-1">Diversity</div>
          <div className="text-xl font-bold text-gray-200">
            {(diversity_score * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Confidence Score</span>
          <span>{(confidence_score * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence_score * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {/* Memory Usage */}
      <div className="text-xs text-gray-600 dark:text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Memory Usage</span>
          <span>{(metrics.memory_usage?.embedding_size / 1024).toFixed(2)} KB</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Chunk Size</span>
          <span>{Math.round(metrics.memory_usage?.avg_chunk_size || 0)} chars</span>
        </div>
      </div>
    </div>
  );
}
