import React, { useState } from "react";
import { 
  Play, Pause, Copy, Check, RefreshCw, Edit2, 
  TrendingUp, Eye, Share2, AlertCircle, Sparkles,
  ChevronDown, ChevronUp, Clock, Target, Zap
} from "lucide-react";
import { ContentBrief, ContentScript, EngagementPrediction } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT PREVIEW - YouTube Short Script Visualizer
// ═══════════════════════════════════════════════════════════════════════════

interface ContentPreviewProps {
  brief: ContentBrief | null;
  onRefresh?: () => void;
  onEdit?: (script: ContentScript) => void;
  isLoading?: boolean;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  brief,
  onRefresh,
  onEdit,
  isLoading = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  if (!brief && !isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Content Preview</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Submit a journal entry to generate content. Your authentic thoughts will be transformed into engaging short-form content.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Forging Content...</h3>
          <p className="text-sm text-gray-500">
            Transforming your insights into engaging content
          </p>
        </div>
      </div>
    );
  }

  const script = brief!.script;
  const prediction = brief!.predicted_engagement;

  const copyScript = () => {
    navigator.clipboard.writeText(script.full_script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-green-500";
    if (score >= 0.4) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.7) return "bg-green-100";
    if (score >= 0.4) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Content Preview</h3>
              <p className="text-xs text-gray-500">
                {brief!.target_archetype} • {brief!.platform_optimization.platform}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(script)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Predictions */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase">Predicted Performance</span>
          <span className="text-xs text-gray-400">{script.reading_time_seconds}s read time</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard
            label="Hook"
            value={prediction.predicted_view_rate}
            icon={<Eye className="w-3 h-3" />}
          />
          <MetricCard
            label="Retention"
            value={prediction.predicted_completion_rate}
            icon={<Clock className="w-3 h-3" />}
          />
          <MetricCard
            label="Engagement"
            value={prediction.predicted_engagement_rate}
            icon={<Target className="w-3 h-3" />}
          />
          <MetricCard
            label="Viral"
            value={prediction.viral_potential}
            icon={<Zap className="w-3 h-3" />}
          />
        </div>
      </div>

      {/* Script Preview */}
      <div className="p-4">
        {/* Hook */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-pink-600 uppercase">Hook (0-3s)</span>
            <span className="text-xs text-gray-400">Stop the scroll</span>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl border border-pink-100">
            <p className="text-gray-800 font-medium">{script.hook_segment}</p>
          </div>
        </div>

        {/* Body */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-indigo-600 uppercase">Body</span>
            <span className="text-xs text-gray-400">Deliver value</span>
          </div>
          <div className="space-y-2">
            {script.body_segments.map((segment, i) => (
              <div 
                key={i}
                className={`p-3 rounded-xl border transition-all ${
                  currentBeat === i + 1 && isPlaying
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <p className="text-gray-700 text-sm">{segment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Close/CTA */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-green-600 uppercase">Close (CTA)</span>
            <span className="text-xs text-gray-400">Drive action</span>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
            <p className="text-gray-800 font-medium">{script.close_segment}</p>
          </div>
        </div>

        {/* Full Script (expandable) */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Full Script</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showDetails && (
            <div className="p-4 bg-white">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {script.full_script}
              </pre>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {script.spoken_word_count} words
                </span>
                <button
                  onClick={copyScript}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Interrupts & Quotes */}
        {(script.pattern_interrupts.length > 0 || script.shareable_quotes.length > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {script.pattern_interrupts.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-xs font-bold text-amber-600 uppercase mb-2">Pattern Interrupts</div>
                <ul className="text-xs text-gray-700 space-y-1">
                  {script.pattern_interrupts.slice(0, 3).map((pi, i) => (
                    <li key={i}>• {pi}</li>
                  ))}
                </ul>
              </div>
            )}
            {script.shareable_quotes.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-xs font-bold text-purple-600 uppercase mb-2">Shareable Quotes</div>
                <ul className="text-xs text-gray-700 space-y-1">
                  {script.shareable_quotes.slice(0, 3).map((quote, i) => (
                    <li key={i}>""{quote.slice(0, 50)}..."</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Preview'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {prediction.controversy_score > 0.5 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              High controversy
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
            <Share2 className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => {
  const getColor = (v: number) => {
    if (v >= 0.7) return { text: "text-green-600", bg: "bg-green-100", bar: "bg-green-500" };
    if (v >= 0.4) return { text: "text-amber-600", bg: "bg-amber-100", bar: "bg-amber-500" };
    return { text: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" };
  };
  
  const colors = getColor(value);

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${colors.bg} ${colors.text} text-xs font-bold mb-1`}>
        {icon}
        {Math.round(value * 100)}%
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${colors.bar} transition-all`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
};

export default ContentPreview;
