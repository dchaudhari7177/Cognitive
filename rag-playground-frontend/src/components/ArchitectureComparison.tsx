import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ArchitectureComparison() {
  const [activeTab, setActiveTab] = useState('comparison');

  const architectures = [
    {
      name: 'SimpleRAG',
      bestFor: ['Quick factual queries', 'Single-context questions', 'When response time is critical'],
      limitations: ['May miss nuanced context', 'Less accurate for complex queries'],
      example: 'Q: "What is the revenue for 2023?"\nBest: SimpleRAG (direct fact lookup)'
    },
    {
      name: 'HybridRAG',
      bestFor: ['Multi-part questions', 'When keyword matching is important', 'Balance of speed and accuracy'],
      limitations: ['Slightly slower than SimpleRAG', 'May return redundant information'],
      example: 'Q: "Compare the sales in Europe vs Asia"\nBest: HybridRAG (combines semantic & keyword search)'
    },
    {
      name: 'ReRankerRAG',
      bestFor: ['Complex analytical questions', 'When accuracy is crucial', 'Multi-context synthesis'],
      limitations: ['Slower processing time', 'Higher computational cost'],
      example: 'Q: "What are the implications of the policy changes?"\nBest: ReRankerRAG (precise context ranking)'
    }
  ];

  const metrics = {
    speed: [
      { arch: 'SimpleRAG', score: 90 },
      { arch: 'HybridRAG', score: 75 },
      { arch: 'ReRankerRAG', score: 60 }
    ],
    accuracy: [
      { arch: 'SimpleRAG', score: 70 },
      { arch: 'HybridRAG', score: 85 },
      { arch: 'ReRankerRAG', score: 95 }
    ]
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Architecture Comparison</h3>
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-lg text-sm ${
            activeTab === 'comparison' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-gray-900/50 text-gray-400'
          }`}
        >
          Compare
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-lg text-sm ${
            activeTab === 'metrics' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-gray-900/50 text-gray-400'
          }`}
        >
          Metrics
        </button>
      </div>

      {activeTab === 'comparison' ? (
        <div className="space-y-4">
          {architectures.map((arch) => (
            <motion.div
              key={arch.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 rounded-lg p-4"
            >
              <h4 className="text-purple-400 font-medium mb-2">{arch.name}</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-green-400 mb-1">Best For:</p>
                  <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                    {arch.bestFor.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-red-400 mb-1">Limitations:</p>
                  <ul className="list-disc pl-4 text-xs text-gray-300 space-y-1">
                    {arch.limitations.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700">
                  <p className="text-xs text-blue-400 mb-1">Example Usage:</p>
                  <p className="text-xs text-gray-400 font-mono">{arch.example}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(metrics).map(([metric, scores]) => (
            <div key={metric} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 capitalize">{metric}</h4>
              <div className="space-y-2">
                {scores.map(({ arch, score }) => (
                  <div key={arch} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{arch}</span>
                      <span className="text-gray-400">{score}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${
                          metric === 'speed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
