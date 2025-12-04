import React, { useState } from "react";
import { 
  Brain, Sparkles, TrendingUp, Link2, Zap,
  ChevronDown, ChevronUp, Eye, Target, 
  AlertCircle, CheckCircle, ArrowRight, Layers
} from "lucide-react";
import { 
  SignalBridge, UnifiedThesis, JournalMarketConnection, 
  MarketContentConnection, JournalAnalysis 
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// BRIDGE VISUALIZER - The Connection Hub
// ═══════════════════════════════════════════════════════════════════════════

interface BridgeVisualizerProps {
  bridge: SignalBridge | null;
  isLoading?: boolean;
}

export const BridgeVisualizer: React.FC<BridgeVisualizerProps> = ({
  bridge,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'thesis' | 'connections' | 'insights'>('thesis');

  if (!bridge && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <Link2 className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Signal Bridge</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            The bridge connects your journal insights to content and market predictions. Submit an entry to see the connections.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <div className="animate-spin">
              <Layers className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Building Bridge...</h3>
          <p className="text-sm text-gray-500">
            Connecting insights across dimensions
          </p>
        </div>
      </div>
    );
  }

  const analysis = bridge!.journal_analysis[0];
  const thesis = bridge!.unified_thesis;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Signal Bridge</h3>
              <p className="text-xs text-white/70">
                Journal → Insights → Content + Predictions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {bridge!.journal_analysis.length} analyzed
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {bridge!.content_briefs.length} content
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {bridge!.market_positions.length} positions
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('thesis')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'thesis' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-4 h-4 inline mr-1" />
          Unified Thesis
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'connections' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-1" />
          Connections
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'insights' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'thesis' && (
          <ThesisView thesis={thesis} />
        )}
        {activeTab === 'connections' && (
          <ConnectionsView 
            journalToMarket={bridge!.journal_to_market}
            marketToContent={bridge!.market_to_content}
          />
        )}
        {activeTab === 'insights' && (
          <InsightsView analysis={analysis} />
        )}
      </div>

      {/* Bridge Visualization */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            {/* Journal */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs font-medium text-gray-700">Journal</div>
              <div className="text-[10px] text-gray-500">{bridge!.journal_entries.length} entries</div>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex items-center justify-center">
              <div className="h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 flex-1" />
              <ArrowRight className="w-4 h-4 text-purple-400 mx-1" />
              <div className="h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 flex-1" />
            </div>

            {/* Analysis */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs font-medium text-gray-700">Analysis</div>
              <div className="text-[10px] text-gray-500">{analysis?.key_insights.length || 0} insights</div>
            </div>

            {/* Arrows to outputs */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center w-full">
                <div className="h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 flex-1" />
                <ArrowRight className="w-3 h-3 text-pink-400" />
              </div>
              <div className="flex items-center w-full">
                <div className="h-0.5 bg-gradient-to-r from-purple-300 to-green-300 flex-1" />
                <ArrowRight className="w-3 h-3 text-green-400" />
              </div>
            </div>

            {/* Outputs */}
            <div className="flex flex-col gap-2">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-1 bg-pink-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <div className="text-[10px] font-medium text-gray-700">Content</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-[10px] font-medium text-gray-700">Predictions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thesis View Component
const ThesisView: React.FC<{ thesis: UnifiedThesis }> = ({ thesis }) => (
  <div className="space-y-4">
    {/* Core Belief */}
    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
      <div className="text-xs font-bold text-indigo-600 uppercase mb-2">Core Belief</div>
      <p className="text-gray-800 font-medium text-lg leading-relaxed">
        "{thesis.core_belief}"
      </p>
    </div>

    {/* Conviction */}
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">Conviction Level</span>
          <span className="text-sm font-bold text-indigo-600">{Math.round(thesis.conviction_score * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" 
            style={{ width: `${thesis.conviction_score * 100}%` }} 
          />
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500">Time Horizon</div>
        <div className="text-sm font-medium text-gray-800">{thesis.time_horizon}</div>
      </div>
    </div>

    {/* Evidence Grid */}
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
        <div className="text-xs font-bold text-blue-600 uppercase mb-2">Personal Evidence</div>
        <ul className="text-xs text-gray-700 space-y-1">
          {thesis.personal_evidence.slice(0, 3).map((e, i) => (
            <li key={i} className="flex items-start gap-1">
              <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-green-50 rounded-xl border border-green-100">
        <div className="text-xs font-bold text-green-600 uppercase mb-2">Market Evidence</div>
        <ul className="text-xs text-gray-700 space-y-1">
          {thesis.market_evidence.slice(0, 3).map((e, i) => (
            <li key={i} className="flex items-start gap-1">
              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Content Expression */}
    {thesis.content_expression && (
      <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
        <div className="text-xs font-bold text-pink-600 uppercase mb-2">Content Expression</div>
        <p className="text-xs text-gray-700">{thesis.content_expression}</p>
      </div>
    )}
  </div>
);

// Connections View Component
const ConnectionsView: React.FC<{
  journalToMarket: JournalMarketConnection[];
  marketToContent: MarketContentConnection[];
}> = ({ journalToMarket, marketToContent }) => (
  <div className="space-y-4">
    {/* Journal → Market */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-blue-600" />
        <ArrowRight className="w-3 h-3 text-gray-400" />
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">Journal → Market Connections</span>
      </div>
      {journalToMarket.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No journal-market connections found</div>
      ) : (
        <div className="space-y-2">
          {journalToMarket.map((conn, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-blue-600 mb-1">"{conn.journal_insight}"</div>
                  <div className="text-xs text-gray-600">
                    <ArrowRight className="w-3 h-3 inline mr-1" />
                    {conn.market_application}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs font-bold ${
                    conn.connection_strength > 0.7 ? 'text-green-600' :
                    conn.connection_strength > 0.4 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {Math.round(conn.connection_strength * 100)}%
                  </div>
                  {conn.actionable && (
                    <span className="text-[10px] text-green-600">Actionable</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Market → Content */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <ArrowRight className="w-3 h-3 text-gray-400" />
        <Sparkles className="w-4 h-4 text-pink-600" />
        <span className="text-sm font-medium text-gray-700">Market → Content Connections</span>
      </div>
      {marketToContent.length === 0 ? (
        <div className="text-sm text-gray-500 italic">No market-content connections found</div>
      ) : (
        <div className="space-y-2">
          {marketToContent.map((conn, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-700">{conn.content_angle}</div>
                  {conn.disclosure_required && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      Disclosure required
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500">Interest: {Math.round(conn.audience_interest * 100)}%</div>
                  <div className="text-xs text-gray-500">Educational: {Math.round(conn.educational_value * 100)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Insights View Component
const InsightsView: React.FC<{ analysis: JournalAnalysis }> = ({ analysis }) => {
  const [showAll, setShowAll] = useState(false);
  const insightsToShow = showAll ? analysis.key_insights : analysis.key_insights.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Key Insights */}
      <div>
        <div className="text-xs font-bold text-gray-600 uppercase mb-2">
          Key Insights ({analysis.key_insights.length})
        </div>
        <div className="space-y-2">
          {insightsToShow.map((insight, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-xl border ${
                insight.insight_type === 'MARKET_OBSERVATION' ? 'bg-green-50 border-green-100' :
                insight.insight_type === 'PREDICTION' ? 'bg-amber-50 border-amber-100' :
                insight.insight_type === 'PERSONAL_GROWTH' ? 'bg-purple-50 border-purple-100' :
                'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className={`text-[10px] font-bold uppercase ${
                    insight.insight_type === 'MARKET_OBSERVATION' ? 'text-green-600' :
                    insight.insight_type === 'PREDICTION' ? 'text-amber-600' :
                    insight.insight_type === 'PERSONAL_GROWTH' ? 'text-purple-600' :
                    'text-gray-600'
                  }`}>
                    {insight.insight_type.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs text-gray-700 mt-1">{insight.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-500">
                    Confidence: {Math.round(insight.confidence * 100)}%
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Novelty: {Math.round(insight.novelty * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {analysis.key_insights.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
          >
            {showAll ? 'Show less' : `Show ${analysis.key_insights.length - 5} more...`}
          </button>
        )}
      </div>

      {/* Emotional State */}
      <div className="p-3 bg-gray-50 rounded-xl">
        <div className="text-xs font-bold text-gray-600 uppercase mb-2">Emotional State</div>
        <div className="flex flex-wrap gap-2">
          {analysis.dominant_emotions.map((emotion, i) => (
            <span 
              key={i}
              className="text-xs px-2 py-1 bg-white rounded-full border border-gray-200"
            >
              {emotion}
            </span>
          ))}
        </div>
      </div>

      {/* Belief Statements */}
      {analysis.belief_statements.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-600 uppercase mb-2">
            Belief Statements ({analysis.belief_statements.length})
          </div>
          <div className="space-y-1">
            {analysis.belief_statements.slice(0, 3).map((belief, i) => (
              <div key={i} className="text-xs p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">"{belief.statement}"</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500">{belief.belief_type}</span>
                  {belief.testable && (
                    <span className="text-[10px] text-green-600">Testable</span>
                  )}
                  {belief.market_relevant && (
                    <span className="text-[10px] text-blue-600">Market Relevant</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeVisualizer;
