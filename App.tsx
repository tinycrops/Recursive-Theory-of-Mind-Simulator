import React, { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { 
  Character, Message, SimulationConfig, Turn, 
  PrimaryArchetype, NarrativeState, ProjectionEvent,
  BeliefChallenge, ShadowTouch
} from "./types";
import { generateAgentTurn } from "./services/geminiService";
import { 
  generateDeepDialogue, 
  createCharacterFromSeed,
} from "./services/narrativeEngine";
import { MindVisualizer } from "./components/MindVisualizer";
import { PsycheVisualizer } from "./components/PsycheVisualizer";
import { ChatInterface } from "./components/ChatInterface";
import { NarrativeView } from "./components/NarrativeView";
import { 
  Play, RotateCcw, Settings, Layers, Brain, 
  Sparkles, BookOpen, ChevronRight, Zap,
  Moon, Sun, Eye, EyeOff
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// RECURSIVE MIND NARRATIVE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// "The psyche is not of today; its ancestry goes back millions of years.
// Individual consciousness is only the flower and fruit of a season."
// — Carl Jung
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO PRESETS - Archetypally Grounded Story Seeds
// ─────────────────────────────────────────────────────────────────────────────

interface ScenarioPreset {
  name: string;
  description: string;
  context: string;
  alice: {
    name: string;
    archetype: PrimaryArchetype;
    core_wound: string;
    secret_goal: string;
    color: string;
  };
  bob: {
    name: string;
    archetype: PrimaryArchetype;
    core_wound: string;
    secret_goal: string;
    color: string;
  };
  theme: string;
  genre: string;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    name: "The Negotiation",
    description: "A classic negotiation where hidden agendas clash",
    context: "Alice and Bob are negotiating the sale of a rare 1965 Mustang. They are old acquaintances but business rivals.",
    alice: {
      name: "Alice",
      archetype: "HERO",
      core_wound: "Never good enough for her father's approval",
      secret_goal: "Buy the vintage car for under $10,000, but don't let Bob know I'm desperate—it was my late father's dream car.",
      color: "#3B82F6"
    },
    bob: {
      name: "Bob",
      archetype: "TRICKSTER",
      core_wound: "Betrayed by a business partner, trusts no one fully",
      secret_goal: "Sell for at least $12,000. I suspect Alice really needs it—use that leverage.",
      color: "#8B5CF6"
    },
    theme: "The masks we wear in pursuit of what we desire",
    genre: "Drama"
  },
  {
    name: "The Reunion",
    description: "Former lovers meet after years apart",
    context: "A chance meeting at a mutual friend's gallery opening. Ten years have passed since their painful breakup.",
    alice: {
      name: "Elena",
      archetype: "SHAPESHIFTER",
      core_wound: "Abandoned by her mother, terrified of being left",
      secret_goal: "Find out if he ever truly loved me, without showing I still care.",
      color: "#EC4899"
    },
    bob: {
      name: "Marcus",
      archetype: "SHADOW",
      core_wound: "Told he was unlovable by his first wife",
      secret_goal: "Apologize for how things ended, but protect myself from rejection.",
      color: "#6366F1"
    },
    theme: "Can we ever return to the people we loved?",
    genre: "Romance/Drama"
  },
  {
    name: "The Mentor's Secret",
    description: "A student discovers their mentor's hidden past",
    context: "Professor Chen's office, late evening. Jordan has discovered documents revealing the professor's involvement in a scandal 30 years ago.",
    alice: {
      name: "Jordan",
      archetype: "HERO",
      core_wound: "Idealized a parent who turned out to be flawed",
      secret_goal: "Understand how someone I admire could have done this, without destroying my faith in mentorship.",
      color: "#10B981"
    },
    bob: {
      name: "Professor Chen",
      archetype: "MENTOR",
      core_wound: "A choice made in weakness that haunts every day since",
      secret_goal: "Protect my legacy while finally releasing this secret. I'm tired of the weight.",
      color: "#F59E0B"
    },
    theme: "How do we reconcile the flaws of those we look up to?",
    genre: "Drama"
  },
  {
    name: "The Threshold",
    description: "A dying parent and their estranged child",
    context: "A hospital room. They haven't spoken in five years. Time is running out.",
    alice: {
      name: "Sam",
      archetype: "CHILD",
      core_wound: "Raised with conditional love, never felt accepted for who they truly are",
      secret_goal: "Get acknowledgment that their way of life is valid. Prove I can forgive without losing myself.",
      color: "#F97316"
    },
    bob: {
      name: "Margaret",
      archetype: "MOTHER",
      core_wound: "Raised to believe her worth was in raising perfect children",
      secret_goal: "Express love without taking back the criticisms I still believe. Find peace before dying.",
      color: "#A855F7"
    },
    theme: "Can we heal lifelong wounds in the time that remains?",
    genre: "Tragedy/Drama"
  },
  {
    name: "The Rival's Game",
    description: "Two rivals forced to cooperate",
    context: "Corporate boardroom. Both vying for CEO position, but the board has demanded they jointly present a unified strategy or both will be passed over.",
    alice: {
      name: "Victoria",
      archetype: "FATHER",
      core_wound: "Was told she had to be twice as good to be seen as equal",
      secret_goal: "Appear collaborative while positioning myself as the obvious leader.",
      color: "#1E40AF"
    },
    bob: {
      name: "David",
      archetype: "THRESHOLD_GUARDIAN",
      core_wound: "Family legacy of business success he must uphold or shame his name",
      secret_goal: "Expose her controlling nature to the board while seeming like the team player.",
      color: "#DC2626"
    },
    theme: "When ambition meets cooperation, what survives?",
    genre: "Thriller"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATES
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PRESET = SCENARIO_PRESETS[0];

const INITIAL_CONFIG: SimulationConfig = {
  aliceGoal: DEFAULT_PRESET.alice.secret_goal,
  bobGoal: DEFAULT_PRESET.bob.secret_goal,
  context: DEFAULT_PRESET.context
};

const createInitialCharacter = (preset: typeof DEFAULT_PRESET.alice | typeof DEFAULT_PRESET.bob): Character => {
  return createCharacterFromSeed({
    name: preset.name,
    archetype: preset.archetype,
    core_wound: preset.core_wound,
    secret_goal: preset.secret_goal,
    color: preset.color
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  // Mode and UI state
  const [mode, setMode] = useState<'simple' | 'deep'>('deep');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ScenarioPreset>(DEFAULT_PRESET);
  const [showPsychology, setShowPsychology] = useState(true);
  const [showSubtext, setShowSubtext] = useState(true);

  // Configuration
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  
  // Conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [turn, setTurn] = useState<Turn>('ALICE');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Psychological events tracking
  const [psychologicalEvents, setPsychologicalEvents] = useState<{
    projections: ProjectionEvent[];
    beliefs: BeliefChallenge[];
    shadows: ShadowTouch[];
  }>({ projections: [], beliefs: [], shadows: [] });

  // Characters (deep mode uses full Character type)
  const [alice, setAlice] = useState<Character>(() => createInitialCharacter(DEFAULT_PRESET.alice));
  const [bob, setBob] = useState<Character>(() => createInitialCharacter(DEFAULT_PRESET.bob));

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleNextTurn = async () => {
    setIsProcessing(true);

    const isAliceTurn = turn === 'ALICE';
    const currentAgent = isAliceTurn ? alice : bob;
    const otherAgent = isAliceTurn ? bob : alice;
    const setAgent = isAliceTurn ? setAlice : setBob;

    try {
      if (mode === 'deep') {
        // Use the deep narrative engine
        const result = await generateDeepDialogue(
          currentAgent,
          otherAgent,
          messages,
          config.context
        );

        // Update character with new mind state
        setAgent(prev => ({
          ...prev,
          mindState: result.mindState,
          conscious: {
            ...prev.conscious,
            emotional_state: {
              ...prev.conscious.emotional_state,
              primary_emotion: result.psychologicalLayers.felt_vs_displayed.felt as any || prev.conscious.emotional_state.primary_emotion,
              displayed_emotion: result.psychologicalLayers.felt_vs_displayed.displayed as any,
            }
          }
        }));

        // Add message with full psychological metadata
        setMessages(prev => [...prev, result.message]);

      } else {
        // Use simple mode (original behavior)
        const result = await generateAgentTurn(
          {
            name: currentAgent.name,
            color: currentAgent.color,
            avatar: currentAgent.avatar,
            secretGoal: currentAgent.secretGoal,
            mindState: currentAgent.mindState
          },
          otherAgent.name,
          messages,
          config.context
        );

        // Update Agent Mind
        setAgent(prev => ({
          ...prev,
          mindState: result.mindState
        }));

        // Add Message
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: currentAgent.name,
          text: result.message,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, newMessage]);
      }

      setTurn(isAliceTurn ? 'BOB' : 'ALICE');

    } catch (error) {
      console.error("Simulation error", error);
      alert("Error calling Gemini API. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setTurn('ALICE');
    setPsychologicalEvents({ projections: [], beliefs: [], shadows: [] });
    setAlice(createInitialCharacter(selectedPreset.alice));
    setBob(createInitialCharacter(selectedPreset.bob));
  };

  const handlePresetChange = (preset: ScenarioPreset) => {
    setSelectedPreset(preset);
    setConfig({
      aliceGoal: preset.alice.secret_goal,
      bobGoal: preset.bob.secret_goal,
      context: preset.context
    });
    setAlice(createInitialCharacter(preset.alice));
    setBob(createInitialCharacter(preset.bob));
    setMessages([]);
    setTurn('ALICE');
    setPsychologicalEvents({ projections: [], beliefs: [], shadows: [] });
  };

  const handleSaveSettings = () => {
    // Update characters with new goals
    setAlice(prev => ({
      ...prev,
      secretGoal: config.aliceGoal,
      conscious: {
        ...prev.conscious,
        conscious_goals: [config.aliceGoal]
      }
    }));
    setBob(prev => ({
      ...prev,
      secretGoal: config.bobGoal,
      conscious: {
        ...prev.conscious,
        conscious_goals: [config.bobGoal]
      }
    }));
    handleReset();
    setShowSettings(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-xl shadow-lg">
            <BrainIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Recursive Mind Narrative Engine
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              Theory of Mind × Archetypal Psychology × Story
              <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {selectedPreset.genre}
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('simple')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'simple' 
                  ? 'bg-white shadow text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Simple
            </button>
            <button
              onClick={() => setMode('deep')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === 'deep' 
                  ? 'bg-white shadow text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Deep Psyche
            </button>
          </div>

          {/* View toggles */}
          {mode === 'deep' && (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <button
                onClick={() => setShowSubtext(!showSubtext)}
                className={`p-1.5 rounded transition-colors ${showSubtext ? 'text-purple-600 bg-purple-50' : 'text-gray-400'}`}
                title="Toggle Subtext"
              >
                {showSubtext ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowPsychology(!showPsychology)}
                className={`p-1.5 rounded transition-colors ${showPsychology ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`}
                title="Toggle Psychology"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Scenario Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          
          <button 
            onClick={handleNextTurn}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md transform active:scale-95 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="animate-pulse">Processing psyche...</span>
              </>
            ) : (
              <>
                Next Turn <Play className="w-4 h-4 fill-current" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS MODAL */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Story Scenario
            </h2>
            
            {/* Preset selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a Scenario Archetype
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetChange(preset)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selectedPreset.name === preset.name
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-800">{preset.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        {preset.alice.archetype}
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                        {preset.bob.archetype}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme display */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-6">
              <div className="text-sm font-semibold text-indigo-600 mb-1">Thematic Question</div>
              <div className="text-gray-800 italic">"{selectedPreset.theme}"</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shared Context</label>
                <textarea 
                  className="w-full p-3 border rounded-xl text-sm"
                  rows={2}
                  value={config.context}
                  onChange={(e) => setConfig({...config, context: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: selectedPreset.alice.color }}>
                    {selectedPreset.alice.name}'s Secret Goal
                    <span className="text-gray-400 font-normal ml-2">({selectedPreset.alice.archetype})</span>
                  </label>
                  <textarea 
                    className="w-full p-3 border rounded-xl text-sm"
                    style={{ borderColor: `${selectedPreset.alice.color}40`, backgroundColor: `${selectedPreset.alice.color}08` }}
                    rows={3}
                    value={config.aliceGoal}
                    onChange={(e) => setConfig({...config, aliceGoal: e.target.value})}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Core Wound:</strong> {selectedPreset.alice.core_wound}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: selectedPreset.bob.color }}>
                    {selectedPreset.bob.name}'s Secret Goal
                    <span className="text-gray-400 font-normal ml-2">({selectedPreset.bob.archetype})</span>
                  </label>
                  <textarea 
                    className="w-full p-3 border rounded-xl text-sm"
                    style={{ borderColor: `${selectedPreset.bob.color}40`, backgroundColor: `${selectedPreset.bob.color}08` }}
                    rows={3}
                    value={config.bobGoal}
                    onChange={(e) => setConfig({...config, bobGoal: e.target.value})}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Core Wound:</strong> {selectedPreset.bob.core_wound}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowSettings(false)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings} 
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
              >
                Save & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        {/* Character A's Mind */}
        <div className="md:col-span-4 h-[50vh] md:h-full overflow-hidden bg-slate-50 border-r border-gray-200">
          {mode === 'deep' ? (
            <PsycheVisualizer 
              character={alice} 
              otherName={bob.name} 
              isThinking={turn === 'ALICE' && isProcessing}
              showDeep={showPsychology}
            />
          ) : (
            <MindVisualizer 
              agent={{
                name: alice.name,
                color: alice.color,
                avatar: alice.avatar,
                secretGoal: alice.secretGoal,
                mindState: alice.mindState
              }} 
              otherName={bob.name} 
              isThinking={turn === 'ALICE' && isProcessing} 
            />
          )}
        </div>

        {/* Narrative / Chat Interface (Center) */}
        <div className="md:col-span-4 h-[40vh] md:h-full overflow-hidden z-0">
          {mode === 'deep' ? (
            <NarrativeView
              messages={messages}
              characters={[alice, bob]}
              currentSpeaker={turn === 'ALICE' ? alice.name : bob.name}
              isProcessing={isProcessing}
              showSubtext={showSubtext}
              showPsychology={showPsychology}
              psychologicalEvents={psychologicalEvents}
            />
          ) : (
            <ChatInterface 
              messages={messages} 
              currentTurn={turn} 
              isProcessing={isProcessing} 
            />
          )}
        </div>

        {/* Character B's Mind */}
        <div className="md:col-span-4 h-[50vh] md:h-full overflow-hidden bg-slate-50 border-l border-gray-200">
          {mode === 'deep' ? (
            <PsycheVisualizer 
              character={bob} 
              otherName={alice.name} 
              isThinking={turn === 'BOB' && isProcessing}
              showDeep={showPsychology}
            />
          ) : (
            <MindVisualizer 
              agent={{
                name: bob.name,
                color: bob.color,
                avatar: bob.avatar,
                secretGoal: bob.secretGoal,
                mindState: bob.mindState
              }} 
              otherName={alice.name} 
              isThinking={turn === 'BOB' && isProcessing} 
            />
          )}
        </div>

      </main>
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MOBILE FOOTER */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden bg-white border-t p-2 text-center text-xs font-bold text-gray-500">
        Current Turn: <span className="text-indigo-600">{turn === 'ALICE' ? alice.name : bob.name}</span>
        {mode === 'deep' && (
          <span className="ml-2 text-purple-500">
            ({(turn === 'ALICE' ? alice : bob).unconscious.dominant_archetype})
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────────────────────────────────────

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
