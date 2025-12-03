import React, { useState } from "react";
import { Character, PrimaryArchetype, Emotion, DefenseMechanism } from "../types";
import { 
  Brain, Eye, EyeOff, Heart, Shield, Sparkles, 
  Ghost, Sun, Moon, Layers, Target, User,
  ChevronDown, ChevronUp, Zap, Lock, Unlock
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// PSYCHE VISUALIZER - Deep Mind Visualization
// ═══════════════════════════════════════════════════════════════════════════
// "Until you make the unconscious conscious, it will direct your life
// and you will call it fate." — Carl Jung
// ═══════════════════════════════════════════════════════════════════════════

interface PsycheVisualizerProps {
  character: Character;
  otherName: string;
  isThinking: boolean;
  showDeep?: boolean;
}

const ARCHETYPE_SYMBOLS: Record<PrimaryArchetype, { icon: string; glyph: string }> = {
  HERO: { icon: "⚔️", glyph: "♈" },
  SHADOW: { icon: "🌑", glyph: "♇" },
  MENTOR: { icon: "📜", glyph: "♄" },
  HERALD: { icon: "📯", glyph: "☿" },
  THRESHOLD_GUARDIAN: { icon: "🚪", glyph: "♅" },
  SHAPESHIFTER: { icon: "🎭", glyph: "☾" },
  TRICKSTER: { icon: "🃏", glyph: "☿" },
  ALLY: { icon: "🤝", glyph: "♀" },
  MOTHER: { icon: "🌙", glyph: "☽" },
  FATHER: { icon: "👑", glyph: "♃" },
  CHILD: { icon: "✨", glyph: "☉" },
  SELF: { icon: "☯️", glyph: "⊕" },
};

const EMOTION_COLORS: Partial<Record<Emotion, string>> = {
  JOY: "bg-yellow-400",
  SADNESS: "bg-blue-400",
  ANGER: "bg-red-500",
  FEAR: "bg-purple-500",
  DISGUST: "bg-green-600",
  SURPRISE: "bg-pink-400",
  LOVE: "bg-rose-400",
  SHAME: "bg-gray-500",
  GUILT: "bg-amber-600",
  HOPE: "bg-emerald-400",
  DESPAIR: "bg-gray-800",
};

const DEFENSE_DESCRIPTIONS: Partial<Record<DefenseMechanism, string>> = {
  PROJECTION: "Seeing own traits in others",
  DENIAL: "Refusing to accept reality",
  RATIONALIZATION: "Logical excuses for emotional decisions",
  DISPLACEMENT: "Redirecting emotions to safer targets",
  REPRESSION: "Pushing thoughts out of awareness",
  REACTION_FORMATION: "Acting opposite to true feelings",
  REGRESSION: "Reverting to childlike behaviors",
  SUBLIMATION: "Channeling into acceptable outlets",
  INTELLECTUALIZATION: "Detaching through analysis",
};

export const PsycheVisualizer: React.FC<PsycheVisualizerProps> = ({
  character,
  otherName,
  isThinking,
  showDeep = true,
}) => {
  const [expandedLayers, setExpandedLayers] = useState({
    conscious: true,
    preconscious: false,
    unconscious: false,
    persona: true,
  });

  const toggleLayer = (layer: keyof typeof expandedLayers) => {
    setExpandedLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const archetype = character.unconscious.dominant_archetype;
  const archetypeInfo = ARCHETYPE_SYMBOLS[archetype];
  const emotionColor = EMOTION_COLORS[character.conscious.emotional_state.primary_emotion] || "bg-gray-400";

  // Calculate psychological state indicators
  const suppressedEmotion = character.conscious.emotional_state.suppressed_emotion;
  const displayedEmotion = character.conscious.emotional_state.displayed_emotion;
  const isInConflict = suppressedEmotion !== undefined && suppressedEmotion !== character.conscious.emotional_state.primary_emotion;

  return (
    <div className={`flex flex-col w-full h-full overflow-auto transition-all duration-500 ${
      isThinking ? 'opacity-60' : 'opacity-100'
    }`}>
      
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HEADER: Identity & Archetype */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar with emotional halo */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${
              character.color === 'blue' ? 'bg-blue-600' : 
              character.color === 'purple' ? 'bg-purple-600' : 
              `bg-${character.color}-600`
            }`} style={{ backgroundColor: character.color }}>
              {character.avatar}
            </div>
            {/* Emotional intensity ring */}
            <div 
              className={`absolute inset-0 rounded-full border-4 ${emotionColor} opacity-50`}
              style={{ 
                transform: `scale(${1 + character.conscious.emotional_state.intensity * 0.2})`,
                transition: 'transform 0.3s ease'
              }}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">{character.name}</h2>
              <span className="text-2xl" title={archetype}>{archetypeInfo.icon}</span>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {archetype} • {character.character_arc.current_stage.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Transformation progress */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Arc Progress</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-gray-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${character.character_arc.transformation_progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* THE LAYERED PSYCHE */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 p-4 space-y-3 bg-gradient-to-b from-white to-gray-50">

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* PERSONA - The Mask */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <LayerCard
          title="Persona"
          subtitle="The Mask Shown to the World"
          icon={<User className="w-4 h-4" />}
          color="gray"
          expanded={expandedLayers.persona}
          onToggle={() => toggleLayer('persona')}
        >
          <div className="space-y-2">
            <InfoRow label="Public Identity" value={character.persona.public_identity} />
            <InfoRow label="Style" value={character.persona.presentation_style} />
            {character.persona.hidden_from_others.length > 0 && (
              <div className="flex items-start gap-2 text-xs">
                <Lock className="w-3 h-3 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-500">Hidden: </span>
                  <span className="text-gray-700 italic">{character.persona.hidden_from_others[0]}</span>
                </div>
              </div>
            )}
          </div>
        </LayerCard>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CONSCIOUS - Current Awareness */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <LayerCard
          title="Conscious"
          subtitle="Current Awareness"
          icon={<Eye className="w-4 h-4" />}
          color="blue"
          expanded={expandedLayers.conscious}
          onToggle={() => toggleLayer('conscious')}
          glow={isThinking}
        >
          <div className="space-y-3">
            {/* Emotional state */}
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${emotionColor.replace('bg-', 'text-')}`} />
              <span className="text-sm font-medium">
                {character.conscious.emotional_state.primary_emotion}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${emotionColor} transition-all`}
                  style={{ width: `${character.conscious.emotional_state.intensity * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {Math.round(character.conscious.emotional_state.intensity * 100)}%
              </span>
            </div>

            {/* Conflict indicator */}
            {isInConflict && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <Zap className="w-3 h-3" />
                <span>Suppressing: {suppressedEmotion}</span>
                {displayedEmotion && <span>• Showing: {displayedEmotion}</span>}
              </div>
            )}

            {/* Current focus */}
            {character.conscious.current_focus && (
              <div className="text-sm">
                <span className="text-gray-500">Focus: </span>
                <span className="text-gray-800">{character.conscious.current_focus}</span>
              </div>
            )}

            {/* Mind state */}
            {character.mindState.selfAnalysis && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 mb-1">
                  <Brain className="w-3 h-3" />
                  Internal Monologue
                </div>
                <p className="text-sm text-blue-900 italic">"{character.mindState.selfAnalysis}"</p>
              </div>
            )}
          </div>
        </LayerCard>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* THEORY OF MIND */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <LayerCard
          title={`Model of ${otherName}`}
          subtitle="Theory of Mind"
          icon={<Ghost className="w-4 h-4" />}
          color="purple"
          expanded={true}
          onToggle={() => {}}
          nested
        >
          <div className="space-y-3">
            {character.mindState.modelOfOther && (
              <div className="text-sm">
                <span className="text-purple-600 font-medium">What I think they want: </span>
                <span className="text-gray-700">{character.mindState.modelOfOther}</span>
              </div>
            )}
            
            {character.mindState.modelOfOthersModel && (
              <div className="bg-purple-50 p-2 rounded border border-purple-100 border-dashed">
                <div className="text-xs text-purple-500 mb-1">
                  ↩️ What I think {otherName} thinks of ME:
                </div>
                <p className="text-sm text-purple-800">{character.mindState.modelOfOthersModel}</p>
              </div>
            )}
          </div>
        </LayerCard>

        {showDeep && (
          <>
            {/* ─────────────────────────────────────────────────────────────── */}
            {/* PRECONSCIOUS - Accessible but not active */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <LayerCard
              title="Preconscious"
              subtitle="Accessible Patterns & Beliefs"
              icon={<EyeOff className="w-4 h-4" />}
              color="amber"
              expanded={expandedLayers.preconscious}
              onToggle={() => toggleLayer('preconscious')}
            >
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold text-amber-600">Core Beliefs:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {character.preconscious.core_beliefs.map((belief, i) => (
                      <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {belief}
                      </span>
                    ))}
                  </div>
                </div>
                
                <InfoRow label="Attachment Style" value={character.preconscious.attachment_style} />
                
                {character.preconscious.learned_patterns.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-amber-600">Patterns:</span>
                    <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {character.preconscious.learned_patterns.slice(0, 3).map((pattern, i) => (
                        <li key={i}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </LayerCard>

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* UNCONSCIOUS - The Deep */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <LayerCard
              title="Unconscious"
              subtitle="The Deep Waters"
              icon={<Moon className="w-4 h-4" />}
              color="indigo"
              expanded={expandedLayers.unconscious}
              onToggle={() => toggleLayer('unconscious')}
              isDeep
            >
              <div className="space-y-3">
                {/* Core wound */}
                <div className="bg-red-50 p-2 rounded border border-red-200">
                  <span className="text-xs font-bold text-red-600">🩸 Core Wound:</span>
                  <p className="text-sm text-red-800 mt-1">{character.unconscious.core_wound}</p>
                </div>

                {/* Fear & Desire */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-purple-50 p-2 rounded">
                    <span className="text-xs font-semibold text-purple-600">Deepest Fear:</span>
                    <p className="text-xs text-purple-800 mt-0.5">{character.unconscious.deepest_fear}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <span className="text-xs font-semibold text-green-600">Deepest Desire:</span>
                    <p className="text-xs text-green-800 mt-0.5">{character.unconscious.deepest_desire}</p>
                  </div>
                </div>

                {/* Shadow */}
                <div className="bg-gray-800 p-2 rounded text-white">
                  <span className="text-xs font-bold">🌑 Shadow:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {character.unconscious.shadow_traits.map((trait, i) => (
                      <span key={i} className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Defense mechanisms */}
                <div>
                  <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Defense Mechanisms:
                  </span>
                  <div className="space-y-1 mt-1">
                    {character.unconscious.defense_mechanisms.map((defense, i) => (
                      <div key={i} className="text-xs flex items-center gap-2">
                        <span className="font-medium text-gray-700">{defense}:</span>
                        <span className="text-gray-500 italic">
                          {DEFENSE_DESCRIPTIONS[defense] || defense}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </LayerCard>

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* CHARACTER ARC */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <LayerCard
              title="Character Arc"
              subtitle="The Journey of Transformation"
              icon={<Sparkles className="w-4 h-4" />}
              color="rose"
              expanded={true}
              onToggle={() => {}}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-50 p-2 rounded">
                    <span className="text-xs font-semibold text-red-600">The Lie Believed:</span>
                    <p className="text-xs text-red-800 mt-0.5 italic">"{character.character_arc.lie_believed}"</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded">
                    <span className="text-xs font-semibold text-emerald-600">The Truth to Learn:</span>
                    <p className="text-xs text-emerald-800 mt-0.5 italic">"{character.character_arc.truth_to_learn}"</p>
                  </div>
                </div>
                
                {/* Journey stages */}
                <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1">
                  {(['ORDINARY_WORLD', 'CALL_TO_ADVENTURE', 'CROSSING_THRESHOLD', 'ORDEAL', 'RETURN_WITH_ELIXIR'] as const).map((stage, i) => {
                    const isActive = character.character_arc.current_stage === stage;
                    const isPast = getStageOrder(character.character_arc.current_stage) > getStageOrder(stage);
                    return (
                      <React.Fragment key={stage}>
                        <div className={`px-2 py-1 rounded whitespace-nowrap ${
                          isActive ? 'bg-indigo-500 text-white font-bold' :
                          isPast ? 'bg-gray-200 text-gray-500' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {stage.replace(/_/g, ' ').slice(0, 10)}...
                        </div>
                        {i < 4 && <span className="text-gray-300">→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </LayerCard>
          </>
        )}
      </div>

      {/* Thinking indicator */}
      {isThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none">
          <div className="flex items-center gap-2 text-gray-600 animate-pulse">
            <Brain className="w-6 h-6" />
            <span className="font-medium">Processing psyche...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface LayerCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  glow?: boolean;
  nested?: boolean;
  isDeep?: boolean;
}

const LayerCard: React.FC<LayerCardProps> = ({ 
  title, subtitle, icon, color, expanded, onToggle, children, glow, nested, isDeep 
}) => {
  const colorClasses: Record<string, { border: string; bg: string; text: string; header: string }> = {
    gray: { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600', header: 'bg-gray-100' },
    blue: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-600', header: 'bg-blue-100' },
    purple: { border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-600', header: 'bg-purple-100' },
    amber: { border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-600', header: 'bg-amber-100' },
    indigo: { border: 'border-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-600', header: 'bg-indigo-900' },
    rose: { border: 'border-rose-300', bg: 'bg-rose-50', text: 'text-rose-600', header: 'bg-rose-100' },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all ${
      glow ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
    } ${nested ? 'ml-4' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 ${
          isDeep ? 'bg-indigo-900 text-white' : colors.header
        } transition-colors hover:opacity-90`}
      >
        <div className="flex items-center gap-2">
          <span className={isDeep ? 'text-indigo-200' : colors.text}>{icon}</span>
          <div className="text-left">
            <span className={`font-bold text-sm ${isDeep ? 'text-white' : 'text-gray-800'}`}>{title}</span>
            <span className={`text-xs ml-2 ${isDeep ? 'text-indigo-300' : 'text-gray-500'}`}>{subtitle}</span>
          </div>
        </div>
        {expanded ? 
          <ChevronUp className={`w-4 h-4 ${isDeep ? 'text-indigo-300' : 'text-gray-400'}`} /> : 
          <ChevronDown className={`w-4 h-4 ${isDeep ? 'text-indigo-300' : 'text-gray-400'}`} />
        }
      </button>
      {expanded && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-xs flex items-start gap-2">
    <span className="text-gray-500 whitespace-nowrap">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

function getStageOrder(stage: string): number {
  const order = [
    'ORDINARY_WORLD', 'CALL_TO_ADVENTURE', 'REFUSAL', 'MEETING_MENTOR',
    'CROSSING_THRESHOLD', 'TESTS_AND_ALLIES', 'APPROACH', 'ORDEAL',
    'REWARD', 'ROAD_BACK', 'RESURRECTION', 'RETURN_WITH_ELIXIR'
  ];
  return order.indexOf(stage);
}

export default PsycheVisualizer;
