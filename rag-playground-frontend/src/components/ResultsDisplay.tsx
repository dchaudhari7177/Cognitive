import ProcessingDetails from './ProcessingDetails';
import ProcessingAnalytics from './ProcessingAnalytics';
import PerformanceMetrics from './PerformanceMetrics';
import { motion } from 'framer-motion';

export default function ResultsDisplay({ results }: { results: any[] }) {
  // Add null check and default to empty array
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {results.map((result, index) => (
        <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Result Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="h-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl flex flex-col"
            >
              {/* Architecture Header */}
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-xl">{index + 1}</span>
                  </div>
                  <h2 className="font-bold text-xl text-gray-100">{result?.architecture || 'Unknown'}</h2>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-4 overflow-auto">
                {/* Answer Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Answer:</h3>
                  <div className={`${result?.answer?.startsWith('Error:') ? 'text-red-400' : 'text-gray-200'}`}>
                    {result?.answer || 'No answer available'}
                  </div>
                </div>

                {/* Sources Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h3>
                  <ul className="space-y-2 text-sm">
                    {result?.sources?.length ? (
                      result.sources.map((src: any, i: number) => (
                        <li key={i} className="bg-gray-900/50 rounded p-2">
                          <span className="font-mono text-gray-300">{src?.content?.slice(0, 100) || ''}...</span>
                          <div className="flex items-center mt-1 space-x-2 text-xs">
                            {src?.page && (
                              <span className="text-blue-400">[Page {src.page}]</span>
                            )}
                            {src?.score && (
                              <span className="text-green-400">Score: {src.score.toFixed(3)}</span>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="italic text-gray-500">No sources</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                <ProcessingDetails result={result} />
                <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                  <span>Processing Time:</span>
                  <span className="font-mono text-blue-400">{result?.time || 0}s</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Analytics Panel */}
          <div className="lg:col-span-1 space-y-4">
            <ProcessingAnalytics metrics={result?.metrics} />
            <PerformanceMetrics 
              metrics={result?.metrics}
              architecture={result?.architecture}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
