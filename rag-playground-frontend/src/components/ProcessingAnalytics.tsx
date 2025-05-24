import { motion } from 'framer-motion';

interface ProcessingStep {
  name: string;
  duration: number;
  chunks?: number;
  vectors?: number;
}

interface Metrics {
  start_time: number;
  total_duration: number;
  steps: ProcessingStep[];
}

export default function ProcessingAnalytics({ metrics }: { metrics?: Metrics }) {
  if (!metrics) return null;

  const getStepColor = (step: string) => {
    switch (step) {
      case 'text_processing': return 'from-blue-500 to-blue-600';
      case 'embedding': return 'from-purple-500 to-purple-600';
      case 'generation': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Processing Analytics</h3>
      
      {/* Timeline */}
      <div className="space-y-4 mb-6">
        {metrics.steps.map((step, index) => (
          <div key={step.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 capitalize">
                {step.name.replace('_', ' ')}
              </span>
              <span className="text-gray-400">{step.duration.toFixed(2)}s</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step.duration / metrics.total_duration) * 100}%` }}
                className={`h-full rounded-full bg-gradient-to-r ${getStepColor(step.name)}`}
              />
            </div>
            {step.chunks && (
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  {step.chunks} chunks processed
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Time</div>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.total_duration.toFixed(2)}s
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Steps</div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics.steps.length}
          </div>
        </div>
      </div>

      {/* Memory Usage (if available) */}
      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Resource Usage</div>
        <div className="space-y-2">
          {metrics.steps.map(step => step.vectors && (
            <div key={`${step.name}_memory`} className="flex justify-between text-xs">
              <span className="text-gray-500">Embeddings</span>
              <span className="text-gray-400">{step.vectors} vectors</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
