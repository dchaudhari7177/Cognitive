import { motion } from 'framer-motion';
import { AnalyticsProps } from '@/types';

export default function Analytics({ processing, metadata }: AnalyticsProps) {
  const stages = [
    { name: 'Text Extraction', color: 'blue' },
    { name: 'Chunking', color: 'purple' },
    { name: 'Embedding', color: 'green' },
    { name: 'Generation', color: 'orange' }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Processing Analytics</h3>
      
      <div className="space-y-4">
        {/* Processing Pipeline */}
        <div className="flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xs
                  bg-${stage.color}-500/20 border border-${stage.color}-500/50`}
                animate={processing ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                } : {}}
                transition={{
                  duration: 2,
                  delay: index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {index + 1}
              </motion.div>
              <span className="mt-2 text-xs text-gray-400">{stage.name}</span>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Chunks</div>
            <motion.div
              className="text-2xl font-bold text-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {metadata?.chunks || 0}
            </motion.div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Tokens</div>
            <motion.div
              className="text-2xl font-bold text-purple-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {metadata?.total_tokens?.toLocaleString() || 0}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
