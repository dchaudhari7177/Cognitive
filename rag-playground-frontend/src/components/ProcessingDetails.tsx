import { RAGResult } from '@/types/rag';

export default function ProcessingDetails({ result }: { result: RAGResult }) {
  const metadata = result?.metadata || {};

  return (
    <div className="mt-4 bg-gray-900 rounded-lg p-4 text-sm">
      <h4 className="text-gray-300 font-medium mb-2">Processing Details</h4>
      <div className="space-y-2 text-gray-400">
        <div className="flex justify-between">
          <span>Chunks Created:</span>
          <span className="font-mono">{metadata.chunks || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Embedding Model:</span>
          <span className="font-mono text-xs">{metadata.embedding_model || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Retriever Type:</span>
          <span className="font-mono text-xs">{metadata.retriever_type || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Tokens:</span>
          <span className="font-mono">{metadata.total_tokens?.toLocaleString() || 'N/A'}</span>
        </div>
        {metadata.reranker_model && (
          <div className="flex justify-between">
            <span>Reranker Model:</span>
            <span className="font-mono text-xs">{metadata.reranker_model}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
          <span>Processing Time:</span>
          <span className="font-mono">{result.time}s</span>
        </div>
      </div>
    </div>
  );
}
