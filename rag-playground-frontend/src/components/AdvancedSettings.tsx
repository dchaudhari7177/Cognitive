import { useState } from 'react';

interface SettingsChangeHandler {
  (settings: RAGSettings): void;
}

interface InputChangeEvent {
  target: {
    name: string;
    value: string | number;
  }
}

export interface RAGSettings {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  temperature: number;
  embeddingModel: string;
}

export default function AdvancedSettings({ onSettingsChange }: { onSettingsChange: SettingsChangeHandler }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<RAGSettings>({
    chunkSize: 500,
    chunkOverlap: 50,
    topK: 3,
    temperature: 0.7,
    embeddingModel: "all-MiniLM-L6-v2"
  });

  const handleChange = (field: keyof RAGSettings, value: string | number) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    handleChange(name as keyof RAGSettings, value);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-gray-300 hover:text-gray-100"
      >
        <span className="font-medium">Advanced Settings</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Chunk Size
              </label>
              <input
                type="number"
                name="chunkSize"
                value={settings.chunkSize}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Chunk Overlap
              </label>
              <input
                type="number"
                name="chunkOverlap"
                value={settings.chunkOverlap}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Embedding Model
            </label>
            <select
              name="embeddingModel"
              value={settings.embeddingModel}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-100"
            >
              <option value="all-MiniLM-L6-v2">MiniLM-L6-v2 (Fast)</option>
              <option value="BAAI/bge-large-en-v1.5">BGE-Large (Accurate)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
