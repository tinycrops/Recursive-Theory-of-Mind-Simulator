import React, { useState } from "react";
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  CheckCircle, XCircle, Brain, Shield, Target,
  ChevronDown, ChevronUp, Zap, BarChart3, Scale
} from "lucide-react";
import { MarketPosition, AdversarialAnalysis, PredictionMarket, PredictorMindState } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// PREDICTION PANEL - Market Position Visualizer
// ═══════════════════════════════════════════════════════════════════════════

interface PredictionPanelProps {
  positions: MarketPosition[];
  adversarialAnalyses?: Map<string, AdversarialAnalysis>;
  markets?: Map<string, PredictionMarket>;
  mindState?: PredictorMindState;
  isLoading?: boolean;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  positions,
  adversarialAnalyses,
  markets,
  mindState,
  isLoading = false,
}) => {
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [showMindState, setShowMindState] = useState(false);

  if (positions.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Market Predictions</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Add prediction markets and submit journal entries to generate AI-assisted position recommendations.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Analyzing Markets...</h3>
          <p className="text-sm text-gray-500">
            Adversarial mind is stress-testing your beliefs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Market Positions</h3>
              <p className="text-xs text-gray-500">
                {positions.length} position{positions.length !== 1 ? 's' : ''} generated
              </p>
            </div>
          </div>
          
          {mindState && (
            <button
              onClick={() => setShowMindState(!showMindState)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Brain className="w-3 h-3" />
              Mind State
              {showMindState ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Predictor Mind State */}
      {showMindState && mindState && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-semibold text-indigo-600">My Thesis:</span>
              <p className="text-gray-700 mt-1">{mindState.my_thesis}</p>
            </div>
            <div>
              <span className="font-semibold text-indigo-600">Confidence:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all" 
                    style={{ width: `${mindState.my_confidence * 100}%` }} 
                  />
                </div>
                <span className="font-bold text-indigo-600">{Math.round(mindState.my_confidence * 100)}%</span>
              </div>
            </div>
            <div>
              <span className="font-semibold text-amber-600">Blind Spots:</span>
              <ul className="text-gray-700 mt-1">
                {mindState.my_blind_spots.slice(0, 2).map((bs, i) => (
                  <li key={i}>• {bs}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold text-red-600">Best Counter-Argument:</span>
              <p className="text-gray-700 mt-1">{mindState.best_argument_against_me}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${mindState.am_i_being_rational ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600">
                {mindState.am_i_being_rational ? 'Rational' : 'Emotional'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">Emotional Contamination:</span>
              <span className={`text-xs font-bold ${
                mindState.emotional_contamination > 0.5 ? 'text-red-600' : 'text-green-600'
              }`}>
                {Math.round(mindState.emotional_contamination * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Positions List */}
      <div className="divide-y divide-gray-100">
        {positions.map((position) => {
          const market = markets?.get(position.market_id);
          const analysis = adversarialAnalyses?.get(position.id);
          const isExpanded = expandedPosition === position.id;

          return (
            <div key={position.id} className="p-4">
              {/* Position Header */}
              <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
              >
                {/* Direction Indicator */}
                <div className={`p-2 rounded-lg ${
                  position.direction === 'YES' 
                    ? 'bg-green-100 text-green-600' 
                    : position.direction === 'NO'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {position.direction === 'YES' && <TrendingUp className="w-5 h-5" />}
                  {position.direction === 'NO' && <TrendingDown className="w-5 h-5" />}
                  {position.direction === 'ABSTAIN' && <Minus className="w-5 h-5" />}
                </div>

                {/* Position Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${
                      position.direction === 'YES' ? 'text-green-600' :
                      position.direction === 'NO' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {position.direction}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      position.size_recommendation === 'LARGE' || position.size_recommendation === 'MAX'
                        ? 'bg-purple-100 text-purple-600'
                        : position.size_recommendation === 'MEDIUM'
                        ? 'bg-blue-100 text-blue-600'
                        : position.size_recommendation === 'SMALL'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {position.size_recommendation}
                    </span>
                    {analysis?.recommendation && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        analysis.recommendation === 'PROCEED' ? 'bg-green-100 text-green-600' :
                        analysis.recommendation === 'REDUCE_SIZE' ? 'bg-amber-100 text-amber-600' :
                        analysis.recommendation === 'SKIP' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {analysis.recommendation}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 mt-1 line-clamp-2">
                    {position.thesis}
                  </h4>
                  {market && (
                    <p className="text-xs text-gray-500 mt-1">
                      Market: {market.question.slice(0, 60)}...
                    </p>
                  )}
                </div>

                {/* Conviction Meter */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(position.conviction * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">conviction</div>
                </div>

                {/* Expand Icon */}
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pl-12 space-y-4">
                  {/* Evidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-1 text-xs font-bold text-green-600 uppercase mb-2">
                        <CheckCircle className="w-3 h-3" />
                        Supporting Evidence
                      </div>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {position.primary_evidence.map((e, i) => (
                          <li key={i}>• {e}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-1 text-xs font-bold text-red-600 uppercase mb-2">
                        <XCircle className="w-3 h-3" />
                        Adversarial Challenges
                      </div>
                      <ul className="text-xs text-gray-700 space-y-1">
                        {position.adversarial_challenge.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Trade Parameters */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Entry</div>
                      <div className="font-bold text-gray-800">{Math.round(position.entry_price_target * 100)}%</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Target</div>
                      <div className="font-bold text-green-600">{Math.round(position.exit_price_target * 100)}%</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Stop Loss</div>
                      <div className="font-bold text-red-600">
                        {position.stop_loss ? `${Math.round(position.stop_loss * 100)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Horizon</div>
                      <div className="font-bold text-gray-800 text-sm">{position.time_horizon}</div>
                    </div>
                  </div>

                  {/* Edge Source */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Edge Source:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      position.edge_source === 'INFORMATION' ? 'bg-blue-100 text-blue-600' :
                      position.edge_source === 'PSYCHOLOGY' ? 'bg-purple-100 text-purple-600' :
                      position.edge_source === 'NARRATIVE' ? 'bg-pink-100 text-pink-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {position.edge_source}
                    </span>
                  </div>

                  {/* Adversarial Analysis */}
                  {analysis && (
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase mb-2">
                        <Scale className="w-3 h-3" />
                        Adversarial Analysis
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-green-600 font-medium">Best Bull Case:</span>
                          <p className="text-gray-700 mt-0.5">{analysis.best_bull_case}</p>
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">Best Bear Case:</span>
                          <p className="text-gray-700 mt-0.5">{analysis.best_bear_case}</p>
                        </div>
                      </div>
                      {analysis.biases_detected.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">
                            Biases detected: {analysis.biases_detected.map(b => b.bias_type).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            ⚠️ Not financial advice. For educational purposes only.
          </span>
          <span>
            Always do your own research.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;
