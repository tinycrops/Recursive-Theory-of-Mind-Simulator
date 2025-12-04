import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { 
  Brain, Sparkles, TrendingUp, Settings, RotateCcw,
  Layers, Zap, BookOpen, ChevronRight, Link2,
  Moon, Sun, Play, Pause, Plus, X, BarChart3
} from "lucide-react";

// Types
import { 
  JournalEntry, SystemConfig, SignalBridge, PredictionMarket,
  UserPersona, ContentBrief, MarketPosition, JournalAnalysis
} from "./types";

// Services
import { processJournalInput, createDefaultConfig, createSampleMarket } from "./services/signalBridge";

// Components
import { JournalInput } from "./components/JournalInput";
import { ContentPreview } from "./components/ContentPreview";
import { PredictionPanel } from "./components/PredictionPanel";
import { BridgeVisualizer } from "./components/BridgeVisualizer";

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL-ALPHA-CONTENT BRIDGE
// ═══════════════════════════════════════════════════════════════════════════
// "Between stimulus and response there is a space. In that space is our power
// to choose our response. In our response lies our growth and our freedom."
// — Viktor Frankl
//
// This system bridges:
// - Personal video journal inputs → Engaging YouTube Short content
// - Journal insights → Prediction market alpha generation
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE MARKETS FOR DEMO
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE_MARKETS: PredictionMarket[] = [
  {
    id: "market-1",
    platform: "POLYMARKET",
    question: "Will AI systems achieve human-level reasoning by 2027?",
    current_price: 0.35,
    volume: 150000,
    liquidity: 50000,
    resolution_date: "2027-12-31",
    category: "AI/Technology",
  },
  {
    id: "market-2",
    platform: "MANIFOLD",
    question: "Will remote work remain the norm for tech workers in 2025?",
    current_price: 0.62,
    volume: 25000,
    liquidity: 10000,
    resolution_date: "2025-12-31",
    category: "Work/Society",
  },
  {
    id: "market-3",
    platform: "POLYMARKET",
    question: "Will Bitcoin reach new ATH in 2025?",
    current_price: 0.55,
    volume: 500000,
    liquidity: 200000,
    resolution_date: "2025-12-31",
    category: "Crypto/Finance",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  // Core state
  const [config, setConfig] = useState<SystemConfig>(createDefaultConfig('BRIDGE_MODE'));
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Bridge state
  const [currentBridge, setCurrentBridge] = useState<SignalBridge | null>(null);
  const [bridgeHistory, setBridgeHistory] = useState<SignalBridge[]>([]);
  
  // Markets state
  const [activeMarkets, setActiveMarkets] = useState<PredictionMarket[]>(SAMPLE_MARKETS);
  const [showMarketManager, setShowMarketManager] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'content' | 'prediction' | 'bridge'>('split');

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleJournalSubmit = async (entry: JournalEntry) => {
    setIsProcessing(true);

    try {
      const bridge = await processJournalInput(entry, config, {
        markets: activeMarkets,
        previousAnalyses: bridgeHistory.flatMap(b => b.journal_analysis),
      });

      setCurrentBridge(bridge);
      setBridgeHistory(prev => [...prev, bridge]);

    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing journal entry. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentBridge(null);
  };

  const handleClearHistory = () => {
    setBridgeHistory([]);
    setCurrentBridge(null);
  };

  const handleAddMarket = (question: string) => {
    const market = createSampleMarket(question, 0.5, 'POLYMARKET');
    setActiveMarkets(prev => [...prev, market]);
  };

  const handleRemoveMarket = (id: string) => {
    setActiveMarkets(prev => prev.filter(m => m.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col font-sans text-gray-900">
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-2.5 rounded-xl shadow-lg">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Signal-Alpha-Content Bridge
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              Journal → Content + Predictions
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                config.mode === 'BRIDGE_MODE' ? 'bg-purple-100 text-purple-600' :
                config.mode === 'JOURNAL_TO_CONTENT' ? 'bg-pink-100 text-pink-600' :
                config.mode === 'JOURNAL_TO_PREDICTION' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {config.mode.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'split' 
                  ? 'bg-white shadow text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewMode('content')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'content' 
                  ? 'bg-white shadow text-pink-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Content
            </button>
            <button
              onClick={() => setViewMode('prediction')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'prediction' 
                  ? 'bg-white shadow text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Predict
            </button>
            <button
              onClick={() => setViewMode('bridge')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'bridge' 
                  ? 'bg-white shadow text-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Bridge
            </button>
          </div>

          {/* Markets button */}
          <button 
            onClick={() => setShowMarketManager(!showMarketManager)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Markets ({activeMarkets.length})
          </button>

          {/* Action buttons */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS PANEL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                System Configuration
              </h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: 'BRIDGE_MODE', label: 'Bridge Mode', desc: 'Content + Predictions', icon: Link2, color: 'purple' },
                    { mode: 'JOURNAL_TO_CONTENT', label: 'Content Only', desc: 'YouTube Shorts focus', icon: Sparkles, color: 'pink' },
                    { mode: 'JOURNAL_TO_PREDICTION', label: 'Prediction Only', desc: 'Market alpha focus', icon: TrendingUp, color: 'green' },
                    { mode: 'NARRATIVE_MODE', label: 'Narrative Mode', desc: 'Deep story analysis', icon: BookOpen, color: 'blue' },
                  ].map(({ mode, label, desc, icon: Icon, color }) => (
                    <button
                      key={mode}
                      onClick={() => setConfig({ ...config, mode: mode as SystemConfig['mode'] })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        config.mode === mode
                          ? `border-${color}-500 bg-${color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${config.mode === mode ? `text-${color}-600` : 'text-gray-400'}`} />
                      <div className="font-medium text-gray-800">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Style</label>
                <select
                  value={config.content_style}
                  onChange={(e) => setConfig({ ...config, content_style: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="STORYTELLER">Storyteller - Narrative journeys</option>
                  <option value="TEACHER">Teacher - Educational content</option>
                  <option value="ENTERTAINER">Entertainer - Maximum engagement</option>
                  <option value="PROVOCATEUR">Provocateur - Challenge assumptions</option>
                  <option value="CONFESSIONALIST">Confessionalist - Raw vulnerability</option>
                  <option value="ANALYST">Analyst - Data-driven breakdown</option>
                </select>
              </div>

              {/* Market Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Market Analysis Style</label>
                <select
                  value={config.market_style}
                  onChange={(e) => setConfig({ ...config, market_style: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="ORACLE">Oracle - Pattern recognition</option>
                  <option value="CONTRARIAN">Contrarian - Against the crowd</option>
                  <option value="NARRATIVE">Narrative - Story-driven trading</option>
                  <option value="VALUE">Value - Find mispricings</option>
                  <option value="SAGE">Sage - Long-term macro</option>
                </select>
              </div>

              {/* Depth Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Psychological Depth: {Math.round(config.psychological_depth * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.psychological_depth * 100}
                    onChange={(e) => setConfig({ ...config, psychological_depth: Number(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adversarial Intensity: {Math.round(config.adversarial_intensity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.adversarial_intensity * 100}
                    onChange={(e) => setConfig({ ...config, adversarial_intensity: Number(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MARKET MANAGER PANEL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {showMarketManager && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Active Markets
              </h2>
              <button onClick={() => setShowMarketManager(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {activeMarkets.map((market) => (
                <div key={market.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500">{market.platform}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{market.category}</span>
                      </div>
                      <h4 className="font-medium text-gray-800">{market.question}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Current: <strong className="text-gray-800">{Math.round(market.current_price * 100)}%</strong></span>
                        <span>Volume: ${market.volume.toLocaleString()}</span>
                        <span>Resolves: {new Date(market.resolution_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMarket(market.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Add Custom Market</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).elements.namedItem('question') as HTMLInputElement;
                  if (input.value.trim()) {
                    handleAddMarket(input.value);
                    input.value = '';
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="question"
                  type="text"
                  placeholder="Enter prediction market question..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 p-6 overflow-auto">
        <div className={`max-w-7xl mx-auto grid gap-6 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}>
          
          {/* LEFT COLUMN: Input + Bridge */}
          <div className={`space-y-6 ${viewMode === 'content' || viewMode === 'prediction' ? 'hidden' : ''}`}>
            {/* Journal Input */}
            <JournalInput
              onSubmit={handleJournalSubmit}
              isProcessing={isProcessing}
              config={config}
              onConfigChange={setConfig}
            />

            {/* Bridge Visualizer */}
            {(viewMode === 'split' || viewMode === 'bridge') && (
              <BridgeVisualizer
                bridge={currentBridge}
                isLoading={isProcessing}
              />
            )}
          </div>

          {/* RIGHT COLUMN: Outputs */}
          <div className={`space-y-6 ${viewMode === 'bridge' ? 'hidden' : ''}`}>
            {/* Content Preview */}
            {(viewMode === 'split' || viewMode === 'content') && (
              <ContentPreview
                brief={currentBridge?.content_briefs[0] || null}
                isLoading={isProcessing && (config.mode === 'JOURNAL_TO_CONTENT' || config.mode === 'BRIDGE_MODE')}
              />
            )}

            {/* Prediction Panel */}
            {(viewMode === 'split' || viewMode === 'prediction') && (
              <PredictionPanel
                positions={currentBridge?.market_positions || []}
                markets={new Map(activeMarkets.map(m => [m.id, m]))}
                isLoading={isProcessing && (config.mode === 'JOURNAL_TO_PREDICTION' || config.mode === 'BRIDGE_MODE')}
              />
            )}
          </div>
        </div>

        {/* History Bar */}
        {bridgeHistory.length > 0 && (
          <div className="max-w-7xl mx-auto mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Session History</span>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {bridgeHistory.map((bridge, i) => (
                  <button
                    key={bridge.id}
                    onClick={() => setCurrentBridge(bridge)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentBridge?.id === bridge.id
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Entry {i + 1}
                    <span className="ml-2 text-gray-400">
                      {bridge.content_briefs.length > 0 && '✨'}
                      {bridge.market_positions.length > 0 && '📈'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>🌉 Signal-Alpha-Content Bridge</span>
            <span className="text-gray-300">|</span>
            <span>Journal → Insights → Content + Alpha</span>
          </div>
          <div className="flex items-center gap-4">
            <span>⚠️ Not financial advice</span>
            <span className="text-gray-300">|</span>
            <span>Powered by Gemini</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────────────────────────────────────

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
