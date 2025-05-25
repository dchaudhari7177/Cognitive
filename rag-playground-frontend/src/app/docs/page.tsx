'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Documentation() {
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
            RAG Playground Documentation
          </motion.h1>
          <p className="text-lg text-gray-300 mb-4">
            Official guide for using and understanding the RAG Playground platform.
          </p>
          <Link 
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Playground
          </Link>
        </div>

        {/* Introduction */}
        <section className="max-w-3xl mx-auto mb-12">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">What is RAG Playground?</h2>
            <p className="text-gray-300 mb-2">
              RAG Playground is an interactive platform to compare and analyze different Retrieval-Augmented Generation (RAG) architectures on your own PDF documents.
              It enables you to upload documents, ask questions, and see how various RAG pipelines retrieve and generate answers, with full transparency into sources, metrics, and performance.
            </p>
            <ul className="list-disc pl-6 text-gray-400 text-sm space-y-1">
              <li>Upload and process PDF documents (text-based, up to 10MB)</li>
              <li>Choose from multiple RAG architectures for querying</li>
              <li>Compare answers, sources, and analytics side-by-side</li>
              <li>View detailed performance and confidence metrics</li>
            </ul>
          </div>
        </section>

        {/* Architecture Details */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Supported RAG Architectures</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-300">SimpleRAG</h3>
                <p className="text-gray-300 mb-1">Performs fast vector similarity search using embeddings. Best for direct factual queries and quick lookups.</p>
                <ul className="list-disc pl-6 text-gray-400 text-sm">
                  <li>Uses vector database (FAISS) for retrieval</li>
                  <li>Low latency, high throughput</li>
                  <li>May miss nuanced or multi-part queries</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-300">HybridRAG</h3>
                <p className="text-gray-300 mb-1">Combines semantic vector search and keyword-based BM25 retrieval for improved accuracy and recall.</p>
                <ul className="list-disc pl-6 text-gray-400 text-sm">
                  <li>Retrieves with both vector and keyword search</li>
                  <li>Balances speed and accuracy</li>
                  <li>Reduces hallucinations and increases context coverage</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-300">ReRankerRAG</h3>
                <p className="text-gray-300 mb-1">Uses a cross-encoder to re-rank retrieved passages for maximum answer relevance and precision.</p>
                <ul className="list-disc pl-6 text-gray-400 text-sm">
                  <li>Reranks top retrieved chunks using a cross-encoder</li>
                  <li>Best for analytical or multi-context questions</li>
                  <li>Higher computational cost, but highest accuracy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="max-w-3xl mx-auto mb-12">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 text-gray-300 space-y-2">
              <li>Upload a text-based PDF document (max 10MB).</li>
              <li>Select one or more RAG architectures to compare.</li>
              <li>Type your question in the query box.</li>
              <li>Click <span className="text-blue-400 font-semibold">Generate Response</span>.</li>
              <li>Review answers, sources, and analytics for each architecture.</li>
            </ol>
            <div className="mt-4 text-xs text-gray-400">
              <span className="font-semibold text-blue-400">Tip:</span> For best results, use clear and specific questions.
            </div>
          </div>
        </section>

        {/* Metrics & Analytics */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Metrics & Analytics</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><span className="text-blue-400 font-semibold">Processing Time:</span> Time taken for each step (chunking, embedding, retrieval, generation).</li>
              <li><span className="text-purple-400 font-semibold">Context Usage:</span> How much of the retrieved context was used in the answer.</li>
              <li><span className="text-green-400 font-semibold">Diversity:</span> Measures the uniqueness of retrieved sources.</li>
              <li><span className="text-yellow-400 font-semibold">Confidence Score:</span> Indicates the model's confidence in the answer.</li>
              <li><span className="text-pink-400 font-semibold">Memory Usage:</span> Embedding and chunk statistics for each query.</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mb-12">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4 text-gray-300 text-sm">
              <div>
                <span className="font-semibold text-blue-300">Q:</span> What types of PDFs are supported?<br/>
                <span className="ml-6">A: Only text-based PDFs. Scanned/image-only PDFs are not supported.</span>
              </div>
              <div>
                <span className="font-semibold text-blue-300">Q:</span> Can I upload multiple PDFs?<br/>
                <span className="ml-6">A: Currently, only one PDF can be uploaded at a time.</span>
              </div>
              <div>
                <span className="font-semibold text-blue-300">Q:</span> What models are used?<br/>
                <span className="ml-6">A: Llama 3 (70B) for generation, HuggingFace MiniLM for embeddings, BM25 for keyword retrieval, and a cross-encoder for reranking.</span>
              </div>
              <div>
                <span className="font-semibold text-blue-300">Q:</span> Where can I get support?<br/>
                <span className="ml-6">A: Visit <a href="https://dipakchaudhari.com" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">dipakchaudhari.com</a> for help or to contact the author.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} RAG Playground. Made by <a href="https://dipakchaudhari.com" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">Dipak Chaudhari</a>
        </div>
      </div>
    </div>
  );
}
