"use client";

import { useState } from "react";
import PDFUpload from "@/components/PDFUpload";
import QueryForm from "@/components/QueryForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIFeatures from '@/components/AIFeatures';
import Analytics from '@/components/Analytics';
import ArchitectureComparison from '@/components/ArchitectureComparison';
import { AISettings, ProcessingMetadata, RAGResult } from "@/types";
import { API_URL } from '@/config';

export default function Home() {
  const [results, setResults] = useState<RAGResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSettings, setAISettings] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 2000,
    chunkSize: 500,
    modelType: 'llama3-70b-8192'
  });
  const [processingMetadata, setProcessingMetadata] = useState<ProcessingMetadata | null>(null);

  const handleQuery = async (query: string, architectures: string[]) => {
    if (!selectedFile) {
      setError("Please upload a PDF first");
      return;
    }

    setLoading(true);
    setProcessingMetadata(null);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    formData.append("query", query);
    formData.append("architectures", JSON.stringify(architectures));
    formData.append('settings', JSON.stringify(aiSettings));
    console.log(formData)
    try {
      const response = await fetch(`http://localhost:8000/query`, {
  method: "POST",
  body: formData,
});

      const data = await response.json();
      
      if (data.results?.[0]?.metadata) {
        setProcessingMetadata(data.results[0].metadata);
      }
      
      setResults(data.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error:", errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-b from-blue-900/20 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-6">
            RAG Playground
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experiment with different RAG architectures and compare their performance
            using your own documents.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              SimpleRAG
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              HybridRAG
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              ReRankerRAG
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Workflow */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <PDFUpload onUpload={setSelectedFile} />
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <Analytics 
                processing={loading} 
                metadata={processingMetadata} 
              />
              <QueryForm onSubmit={handleQuery} disabled={loading} />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-gray-400">Processing your query...</span>
              </div>
            )}

            {error && (
              <div className="text-red-400 bg-red-400/10 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="min-h-[200px]">
              <ResultsDisplay results={results} />
            </div>
          </div>

          {/* Right Column - Settings & Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <AIFeatures onSettingsChange={setAISettings} />
            <ArchitectureComparison />
            
            {/* Enhanced About RAG Section */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">About RAG</h3>
                <div className="space-y-4 text-sm text-gray-400">
                  {/* Technology Overview */}
                  <div className="border-l-2 border-blue-500 pl-4">
                    <h4 className="text-blue-400 font-medium mb-2">RAG Technology</h4>
                    <p className="mb-2">Retrieval-Augmented Generation (RAG) enhances LLM responses with context from your documents:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Real-time document processing</li>
                      <li>Semantic search capabilities</li>
                      <li>Context-aware responses</li>
                      <li>Source verification</li>
                    </ul>
                  </div>

                  {/* Architecture Comparison */}
                  <div className="bg-gray-900/50 rounded-lg p-4 my-4">
                    <h4 className="text-purple-400 font-medium mb-3">Architecture Comparison</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-gray-300 font-medium">SimpleRAG</h5>
                        <p className="text-xs">Fast vector similarity search using embeddings. Best for straightforward queries.</p>
                      </div>
                      <div>
                        <h5 className="text-gray-300 font-medium">HybridRAG</h5>
                        <p className="text-xs">Combines semantic and keyword search. Ideal for complex queries needing precise matching.</p>
                      </div>
                      <div>
                        <h5 className="text-gray-300 font-medium">ReRankerRAG</h5>
                        <p className="text-xs">Advanced result reranking for highest accuracy. Best when precision is critical.</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-2">
                    <h4 className="text-green-400 font-medium">Technical Stack</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900/50 p-2 rounded">
                        <div className="text-xs text-green-400">Backend</div>
                        <div className="text-xs">FastAPI + LangChain</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <div className="text-xs text-green-400">Frontend</div>
                        <div className="text-xs">Next.js + TailwindCSS</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <div className="text-xs text-green-400">Embeddings</div>
                        <div className="text-xs">HuggingFace Models</div>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <div className="text-xs text-green-400">Vector DB</div>
                        <div className="text-xs">FAISS</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-orange-400 font-medium mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-2xl font-bold text-orange-400">~2s</div>
                        <div className="text-xs">Avg. Response</div>
                      </div>
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-2xl font-bold text-orange-400">10MB</div>
                        <div className="text-xs">Max File</div>
                      </div>
                      <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-2xl font-bold text-orange-400">95%</div>
                        <div className="text-xs">Accuracy</div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips Section */}
                  <div className="mt-6 bg-blue-500/10 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">Pro Tips</h4>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Use specific questions for better context retrieval
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Compare architectures for different query types
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Check source contexts to verify accuracy
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        Use HybridRAG for complex queries
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ThemeToggle />
    </div>
  );
}
