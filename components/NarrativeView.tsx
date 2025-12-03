import React, { useState, useEffect, useRef } from "react";
import { 
  Character, Message, SceneBeat, Scene, 
  ProjectionEvent, BeliefChallenge, ShadowTouch 
} from "../types";
import { 
  MessageCircle, Eye, Brain, Zap, Ghost, 
  ChevronDown, ChevronUp, Layers, Shield,
  AlertTriangle, Sparkles, Heart, Target
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE VIEW - Where Stories Emerge from Psychology
// ═══════════════════════════════════════════════════════════════════════════
// "We tell ourselves stories in order to live." — Joan Didion
// ═══════════════════════════════════════════════════════════════════════════

interface NarrativeViewProps {
  messages: Message[];
  characters: Character[];
  currentScene?: Scene;
  currentSpeaker?: string;
  isProcessing: boolean;
  showSubtext?: boolean;
  showPsychology?: boolean;
  psychologicalEvents?: {
    projections: ProjectionEvent[];
    beliefs: BeliefChallenge[];
    shadows: ShadowTouch[];
  };
}

export const NarrativeView: React.FC<NarrativeViewProps> = ({
  messages,
  characters,
  currentScene,
  currentSpeaker,
  isProcessing,
  showSubtext = true,
  showPsychology = true,
  psychologicalEvents,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'narrative' | 'screenplay' | 'analysis'>('narrative');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const getCharacterColor = (name: string): string => {
    const character = characters.find(c => c.name === name);
    return character?.color || 'gray';
  };

  const getCharacter = (name: string): Character | undefined => {
    return characters.find(c => c.name === name);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {currentScene && (
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">{currentScene.title}</h3>
                <p className="text-xs text-gray-500">{currentScene.setting}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Stakes</div>
                <div className="text-sm font-medium text-red-600">{currentScene.stakes}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Narrative Layer
            </span>
          </div>
          
          {/* View mode toggle */}
          <div className="flex text-xs border border-gray-200 rounded-lg overflow-hidden">
            {(['narrative', 'screenplay', 'analysis'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 transition-colors ${
                  viewMode === mode 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MESSAGES / BEATS */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg, index) => {
            const character = getCharacter(msg.sender);
            const isExpanded = expandedMessages.has(msg.id);
            
            if (viewMode === 'narrative') {
              return (
                <NarrativeBeat 
                  key={msg.id}
                  message={msg}
                  character={character}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpand(msg.id)}
                  showSubtext={showSubtext}
                  showPsychology={showPsychology}
                  beatNumber={index + 1}
                />
              );
            } else if (viewMode === 'screenplay') {
              return (
                <ScreenplayBeat
                  key={msg.id}
                  message={msg}
                  character={character}
                />
              );
            } else {
              return (
                <AnalysisBeat
                  key={msg.id}
                  message={msg}
                  character={character}
                  beatNumber={index + 1}
                />
              );
            }
          })
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-3 text-gray-500 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{currentSpeaker} is processing...</div>
              <div className="text-xs text-gray-400">Theory of mind active</div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PSYCHOLOGICAL EVENTS PANEL */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showPsychology && psychologicalEvents && (
        <PsychologicalEventsPanel events={psychologicalEvents} characters={characters} />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BEAT RENDERERS
// ═══════════════════════════════════════════════════════════════════════════

interface NarrativeBeatProps {
  message: Message;
  character?: Character;
  isExpanded: boolean;
  onToggle: () => void;
  showSubtext: boolean;
  showPsychology: boolean;
  beatNumber: number;
}

const NarrativeBeat: React.FC<NarrativeBeatProps> = ({
  message, character, isExpanded, onToggle, showSubtext, showPsychology, beatNumber
}) => {
  const color = character?.color || 'gray';
  const archetype = character?.unconscious.dominant_archetype;
  
  return (
    <div className="group relative">
      {/* Beat number indicator */}
      <div className="absolute -left-2 top-4 text-[10px] text-gray-300 font-mono">
        {beatNumber}
      </div>
      
      <div className={`rounded-xl overflow-hidden border-2 transition-all ${
        isExpanded ? 'border-indigo-200 shadow-lg' : 'border-gray-100 hover:border-gray-200'
      }`}>
        {/* Main content */}
        <div className="p-4 bg-white">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-md"
              style={{ backgroundColor: color }}
            >
              {message.sender[0]}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Speaker info */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{message.sender}</span>
                {archetype && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {archetype}
                  </span>
                )}
                {message.emotional_tone && (
                  <span className="text-xs text-gray-400">
                    feeling {message.emotional_tone.toLowerCase()}
                  </span>
                )}
              </div>
              
              {/* Dialogue */}
              <p className="text-gray-800 text-base leading-relaxed">
                "{message.text}"
              </p>
              
              {/* Subtext preview */}
              {showSubtext && message.subtext && !isExpanded && (
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 italic">
                  <Eye className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                  <span className="line-clamp-1">{message.subtext}</span>
                </div>
              )}
            </div>
            
            {/* Expand button */}
            <button
              onClick={onToggle}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Expanded psychological details */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4 space-y-3">
            {/* Subtext */}
            {message.subtext && (
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-purple-600 uppercase">Subtext</span>
                  <p className="text-sm text-gray-700 italic">{message.subtext}</p>
                </div>
              </div>
            )}
            
            {/* Defense mechanism */}
            {message.defense_active && (
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase">Defense Active</span>
                  <p className="text-sm text-gray-700">{message.defense_active}</p>
                </div>
              </div>
            )}
            
            {/* Character's mind state at this moment */}
            {character && (
              <div className="bg-indigo-50 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-2">
                  <Brain className="w-3 h-3" />
                  Mind State
                </div>
                <div className="space-y-2 text-xs">
                  {character.mindState.selfAnalysis && (
                    <div>
                      <span className="text-indigo-500">Internal:</span>
                      <span className="text-gray-700 ml-1">{character.mindState.selfAnalysis}</span>
                    </div>
                  )}
                  {character.mindState.modelOfOther && (
                    <div>
                      <span className="text-purple-500">Model of Other:</span>
                      <span className="text-gray-700 ml-1">{character.mindState.modelOfOther}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ScreenplayBeat: React.FC<{ message: Message; character?: Character }> = ({ message, character }) => {
  return (
    <div className="font-mono text-sm space-y-2">
      {/* Character name */}
      <div className="text-center font-bold uppercase text-gray-800">
        {message.sender}
      </div>
      
      {/* Parenthetical (emotional state) */}
      {message.emotional_tone && (
        <div className="text-center text-gray-500 italic">
          ({message.emotional_tone.toLowerCase()})
        </div>
      )}
      
      {/* Dialogue */}
      <div className="text-center px-16 text-gray-800">
        {message.text}
      </div>
      
      {/* Subtext as action line */}
      {message.subtext && (
        <div className="text-gray-500 italic text-xs px-8">
          [{message.subtext}]
        </div>
      )}
    </div>
  );
};

const AnalysisBeat: React.FC<{ message: Message; character?: Character; beatNumber: number }> = ({ 
  message, character, beatNumber 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-xs text-gray-500">Beat #{beatNumber}</span>
        <span className="text-sm font-bold text-gray-800">{message.sender}</span>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Surface</div>
          <p className="text-gray-800">"{message.text}"</p>
        </div>
        
        <div>
          <div className="text-xs font-bold text-purple-500 uppercase mb-1">Subtext</div>
          <p className="text-gray-700 italic">{message.subtext || "—"}</p>
        </div>
        
        <div>
          <div className="text-xs font-bold text-amber-500 uppercase mb-1">Defense</div>
          <p className="text-gray-700">{message.defense_active || "None active"}</p>
        </div>
        
        <div>
          <div className="text-xs font-bold text-red-500 uppercase mb-1">Emotion</div>
          <p className="text-gray-700">{message.emotional_tone || "Unspecified"}</p>
        </div>
        
        {character && (
          <>
            <div className="col-span-2 border-t border-gray-100 pt-3">
              <div className="text-xs font-bold text-indigo-500 uppercase mb-1">
                Archetype: {character.unconscious.dominant_archetype}
              </div>
              <p className="text-xs text-gray-600">
                Core wound: {character.unconscious.core_wound}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PSYCHOLOGICAL EVENTS PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface PsychologicalEventsPanelProps {
  events: {
    projections: ProjectionEvent[];
    beliefs: BeliefChallenge[];
    shadows: ShadowTouch[];
  };
  characters: Character[];
}

const PsychologicalEventsPanel: React.FC<PsychologicalEventsPanelProps> = ({ events, characters }) => {
  const hasEvents = events.projections.length > 0 || events.beliefs.length > 0 || events.shadows.length > 0;
  
  if (!hasEvents) return null;
  
  const getCharacterName = (id: string) => {
    return characters.find(c => c.id === id)?.name || id;
  };
  
  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-2">
        <Zap className="w-3 h-3" />
        Psychological Events Detected
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Projections */}
        {events.projections.map((proj, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/50 rounded p-2">
            <Ghost className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
            <span>
              <strong>{getCharacterName(proj.projector_id)}</strong> is projecting 
              <em className="text-purple-600"> "{proj.projected_trait}"</em> onto {getCharacterName(proj.recipient_id)}
            </span>
          </div>
        ))}
        
        {/* Belief challenges */}
        {events.beliefs.map((belief, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/50 rounded p-2">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>{getCharacterName(belief.character_id)}</strong>'s belief 
              <em className="text-amber-600"> "{belief.belief_challenged}"</em> is being challenged
            </span>
          </div>
        ))}
        
        {/* Shadow touches */}
        {events.shadows.map((shadow, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/50 rounded p-2">
            <Target className="w-3 h-3 text-gray-600 shrink-0 mt-0.5" />
            <span>
              <strong>{getCharacterName(shadow.character_id)}</strong>'s shadow 
              (<em className="text-gray-600">{shadow.shadow_aspect}</em>) was touched
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
      <Layers className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-700 mb-2">The Stage is Set</h3>
    <p className="text-sm text-gray-500 max-w-xs">
      The characters wait in the wings, their psyches loaded with wounds, desires, 
      and the patterns that will drive the story. Press <strong>Next Turn</strong> to begin.
    </p>
    <div className="mt-6 text-xs text-gray-400 italic">
      "Every story is a kind of dreaming" — Ursula K. Le Guin
    </div>
  </div>
);

export default NarrativeView;
