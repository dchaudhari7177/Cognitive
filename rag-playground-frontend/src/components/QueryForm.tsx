'use client';

import { useState } from 'react';

export default function QueryForm({ onSubmit, disabled }: { onSubmit: (query: string, selected: string[]) => void, disabled?: boolean }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const handleCheckboxChange = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(query, selected);
  };

  const options = ['SimpleRAG', 'HybridRAG', 'ReRankerRAG']; // Only include implemented RAG methods

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="text-xl font-semibold text-gray-100 mb-4 block">
          Ask your question
        </label>
        <textarea
          className="w-full bg-gray-900/50 border border-gray-700 p-4 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500"
          rows={4}
          placeholder="What would you like to know about your document?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <span className="text-lg font-semibold text-gray-200 mb-4 block">
          Select Architectures
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700/50 transition"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => handleCheckboxChange(opt)}
                className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                disabled={disabled}
              />
              <span className="text-gray-200">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-gradient-to-r from-blue-500 to-violet-500 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {disabled ? 'Processing...' : 'Generate Response'}
      </button>
    </form>
  );
}
