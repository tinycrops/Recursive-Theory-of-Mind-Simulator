import React, { useState, useRef } from "react";
import { 
  Mic, MicOff, Video, VideoOff, Type, Send, 
  Sparkles, Brain, TrendingUp, Loader2, 
  FileText, Camera, X
} from "lucide-react";
import { JournalEntry, SystemConfig } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// JOURNAL INPUT - Capture Personal Truth
// ═══════════════════════════════════════════════════════════════════════════

interface JournalInputProps {
  onSubmit: (entry: JournalEntry) => void;
  isProcessing: boolean;
  config: SystemConfig;
  onConfigChange: (config: SystemConfig) => void;
}

export const JournalInput: React.FC<JournalInputProps> = ({
  onSubmit,
  isProcessing,
  config,
  onConfigChange,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'audio' | 'video'>('text');
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!textInput.trim() || isProcessing) return;

    const now = new Date();
    const hour = now.getHours();
    let time_of_day: JournalEntry['time_of_day'];
    if (hour >= 5 && hour < 12) time_of_day = 'MORNING';
    else if (hour >= 12 && hour < 17) time_of_day = 'AFTERNOON';
    else if (hour >= 17 && hour < 21) time_of_day = 'EVENING';
    else time_of_day = 'NIGHT';

    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      timestamp: Date.now(),
      input_type: inputMode === 'text' ? 'TEXT' : inputMode === 'audio' ? 'AUDIO' : 'VIDEO',
      spoken_content: textInput,
      emotional_markers: [],
      time_of_day,
      energy_level: 0.5,
      content_permission: 'FULL',
    };

    onSubmit(entry);
    setTextInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRecordingDuration(0);
      // Start recording timer
      const interval = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
      // Store interval for cleanup
      (window as any).__recordingInterval = interval;
    } else {
      // Stop recording
      clearInterval((window as any).__recordingInterval);
    }
  };

  const modeLabels = {
    JOURNAL_TO_CONTENT: { icon: Sparkles, label: "Content Mode", color: "text-pink-500" },
    JOURNAL_TO_PREDICTION: { icon: TrendingUp, label: "Prediction Mode", color: "text-green-500" },
    BRIDGE_MODE: { icon: Brain, label: "Bridge Mode", color: "text-purple-500" },
    NARRATIVE_MODE: { icon: FileText, label: "Narrative Mode", color: "text-blue-500" },
  };

  const CurrentModeIcon = modeLabels[config.mode].icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Journal Input</h3>
              <p className="text-xs text-gray-500">Share your thoughts, get insights</p>
            </div>
          </div>
          
          {/* Mode selector */}
          <div className="flex items-center gap-2">
            <select
              value={config.mode}
              onChange={(e) => onConfigChange({ ...config, mode: e.target.value as SystemConfig['mode'] })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="BRIDGE_MODE">🌉 Bridge Mode</option>
              <option value="JOURNAL_TO_CONTENT">✨ Content Mode</option>
              <option value="JOURNAL_TO_PREDICTION">📈 Prediction Mode</option>
              <option value="NARRATIVE_MODE">📖 Narrative Mode</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input mode tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            inputMode === 'text' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Type className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => setInputMode('audio')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            inputMode === 'audio' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Mic className="w-4 h-4" />
          Audio
        </button>
        <button
          onClick={() => setInputMode('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            inputMode === 'video' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
      </div>

      {/* Input area */}
      <div className="p-4">
        {inputMode === 'text' && (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? Share a thought, reflection, or observation..."
              className="w-full h-32 p-3 text-gray-800 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {textInput.length} characters • ⌘+Enter to submit
              </div>
              <button
                onClick={handleSubmit}
                disabled={!textInput.trim() || isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  textInput.trim() && !isProcessing
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Process
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {inputMode === 'audio' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <button
              onClick={toggleRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse scale-110' 
                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <div className="text-center">
              {isRecording ? (
                <>
                  <div className="text-2xl font-mono font-bold text-red-500">
                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500">Recording... Click to stop</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-gray-700">Voice Journal</div>
                  <div className="text-sm text-gray-500">Click to start recording</div>
                </>
              )}
            </div>
            {!isRecording && (
              <div className="text-xs text-gray-400 text-center max-w-xs">
                Note: Audio recording requires browser permissions. Your recording will be transcribed automatically.
              </div>
            )}
          </div>
        )}

        {inputMode === 'video' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <div className="text-gray-400">Video capture area</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <VideoOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Start Recording
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400 text-center max-w-xs">
              Note: Video recording requires camera permissions. Perfect for video journal entries.
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-4">
        <div className="text-xs text-gray-500 mb-2">Quick prompts:</div>
        <div className="flex flex-wrap gap-2">
          {[
            "What's one thing I learned today?",
            "What am I feeling uncertain about?",
            "What prediction would I make right now?",
            "What would I tell my past self?",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setTextInput(prompt)}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalInput;
