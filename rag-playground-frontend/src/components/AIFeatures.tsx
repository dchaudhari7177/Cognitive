import { useState } from 'react';

interface AISettings {
  temperature: number;
  maxTokens: number;
  chunkSize: number;
  modelType: string;
}

export default function AIFeatures({ onSettingsChange }: { onSettingsChange: (settings: AISettings) => void }) {
  const [settings, setSettings] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 2000,
    chunkSize: 500,
    modelType: 'llama3-70b-8192'
  });

  const handleChange = (key: keyof AISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-100 mb-4">AI Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-gray-300 mb-2 block">Model Selection</label>
          <select
            value={settings.modelType}
            onChange={(e) => handleChange('modelType', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-100"
          >
            <option value="llama3-70b-8192">Llama 3 (70B)</option>
            <option value="mixtral-8x7b">Mixtral 8x7B</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
        </div>

        <div>
          <label className="text-gray-300 mb-2 block">
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
          <div className="flex justify-between text-xs text-gray-500">
            <span>More Focused</span>
            <span>More Creative</span>
          </div>
        </div>

        <div>
          <label className="text-gray-300 mb-2 block">
            Text Chunk Size: {settings.chunkSize}
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={settings.chunkSize}
            onChange={(e) => handleChange('chunkSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Smaller Chunks</span>
            <span>Larger Chunks</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Processing Pipeline</h4>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mb-1">1</div>
            <span>Text Extraction</span>
          </div>
          <div className="flex-1 h-px bg-gray-700 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mb-1">2</div>
            <span>Chunking</span>
          </div>
          <div className="flex-1 h-px bg-gray-700 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mb-1">3</div>
            <span>Embedding</span>
          </div>
          <div className="flex-1 h-px bg-gray-700 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mb-1">4</div>
            <span>Response</span>
          </div>
        </div>
      </div>
    </div>
  );
}
