'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Documentation() {
  const sections = [
    {
      title: "RAG Architectures",
      content: [
        {
          name: "SimpleRAG",
          description: "Basic vector similarity search using embeddings. Best for straightforward queries and quick responses.",
          features: ["Vector similarity search", "Fast response time", "Direct context matching"]
        },
        {
          name: "HybridRAG",
          description: "Combines vector and keyword search for better accuracy. Ideal for complex queries requiring precise matching.",
          features: ["Combined vector + keyword search", "Better context understanding", "Reduced hallucinations"]
        },
        {
          name: "ReRankerRAG",
          description: "Uses cross-encoder to re-rank retrieved passages. Best for maximum accuracy and relevance.",
          features: ["Advanced result reranking", "Highest accuracy", "Better source relevance"]
        }
      ]
    },
    {
      title: "Features",
      content: [
        "PDF text extraction and processing",
        "Multiple RAG architecture comparison",
        "Real-time performance metrics",
        "Source context visualization",
        "Processing time analysis"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Documentation
          </motion.h1>
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Playground
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, i) => (
            <motion.section 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-100 mb-6">{section.title}</h2>
              {Array.isArray(section.content) ? (
                <div className="space-y-6">
                  {section.content.map((item: any) => (
                    <div key={item.name || item} className="space-y-2">
                      {item.name ? (
                        <>
                          <h3 className="text-xl font-semibold text-blue-400">{item.name}</h3>
                          <p className="text-gray-300">{item.description}</p>
                          <ul className="list-disc list-inside text-gray-400 pl-4 space-y-1">
                            {item.features.map((feature: string) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-300">{item}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">{section.content}</p>
              )}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
