import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AgentState, Message, SimulationConfig, Turn } from "./types";
import { generateAgentTurn } from "./services/geminiService";
import { MindVisualizer } from "./components/MindVisualizer";
import { ChatInterface } from "./components/ChatInterface";
import { Play, RotateCcw, Settings, ArrowRight } from "lucide-react";

const INITIAL_CONFIG: SimulationConfig = {
  aliceGoal: "Buy the vintage car for under $10,000, but don't let Bob know I'm desperate.",
  bobGoal: "Sell the vintage car for at least $12,000. I suspect Alice really needs it for a collection.",
  context: "Alice and Bob are negotiating the sale of a rare 1965 Mustang. They are old acquaintances but business rivals."
};

const INITIAL_MIND_STATE = {
  selfAnalysis: "",
  modelOfOther: "",
  modelOfOthersModel: "",
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [showSettings, setShowSettings] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [turn, setTurn] = useState<Turn>('ALICE');
  const [isProcessing, setIsProcessing] = useState(false);

  const [alice, setAlice] = useState<AgentState>({
    name: "Alice",
    color: "blue",
    avatar: "A",
    secretGoal: INITIAL_CONFIG.aliceGoal,
    mindState: { ...INITIAL_MIND_STATE }
  });

  const [bob, setBob] = useState<AgentState>({
    name: "Bob",
    color: "purple",
    avatar: "B",
    secretGoal: INITIAL_CONFIG.bobGoal,
    mindState: { ...INITIAL_MIND_STATE }
  });

  const handleNextTurn = async () => {
    setIsProcessing(true);

    const isAliceTurn = turn === 'ALICE';
    const currentAgent = isAliceTurn ? alice : bob;
    const otherAgentName = isAliceTurn ? "Bob" : "Alice";
    const setAgent = isAliceTurn ? setAlice : setBob;

    try {
      const result = await generateAgentTurn(
        currentAgent,
        otherAgentName,
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
    setAlice(prev => ({ ...prev, secretGoal: config.aliceGoal, mindState: { ...INITIAL_MIND_STATE } }));
    setBob(prev => ({ ...prev, secretGoal: config.bobGoal, mindState: { ...INITIAL_MIND_STATE } }));
  };

  const handleSaveSettings = () => {
    setAlice(prev => ({ ...prev, secretGoal: config.aliceGoal }));
    setBob(prev => ({ ...prev, secretGoal: config.bobGoal }));
    handleReset();
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <BrainIcon />
            </div>
            <div>
                <h1 className="text-xl font-bold leading-none">Recursive Mind Simulator</h1>
                <p className="text-xs text-gray-500 mt-1">Second-Order Theory of Mind Visualization</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
            >
                {isProcessing ? 'Thinking...' : (
                    <>
                        Next Turn <Play className="w-4 h-4 fill-current" />
                    </>
                )}
            </button>
        </div>
      </header>

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4">Simulation Scenario</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shared Context</label>
                        <textarea 
                            className="w-full p-2 border rounded-lg text-sm"
                            rows={2}
                            value={config.context}
                            onChange={(e) => setConfig({...config, context: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Alice's Secret Goal</label>
                            <textarea 
                                className="w-full p-2 border border-blue-200 bg-blue-50 rounded-lg text-sm"
                                rows={3}
                                value={config.aliceGoal}
                                onChange={(e) => setConfig({...config, aliceGoal: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">Bob's Secret Goal</label>
                            <textarea 
                                className="w-full p-2 border border-purple-200 bg-purple-50 rounded-lg text-sm"
                                rows={3}
                                value={config.bobGoal}
                                onChange={(e) => setConfig({...config, bobGoal: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={handleSaveSettings} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save & Restart</button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        {/* Alice's Mind */}
        <div className="md:col-span-4 h-[50vh] md:h-full overflow-hidden bg-slate-50 border-r border-gray-200">
             <MindVisualizer agent={alice} otherName="Bob" isThinking={turn === 'ALICE' && isProcessing} />
        </div>

        {/* Chat Interface (Center) */}
        <div className="md:col-span-4 h-[40vh] md:h-full overflow-hidden z-0">
             <ChatInterface messages={messages} currentTurn={turn} isProcessing={isProcessing} />
        </div>

        {/* Bob's Mind */}
        <div className="md:col-span-4 h-[50vh] md:h-full overflow-hidden bg-slate-50 border-l border-gray-200">
             <MindVisualizer agent={bob} otherName="Alice" isThinking={turn === 'BOB' && isProcessing} />
        </div>

      </main>
      
      {/* Mobile-only turn indicator */}
      <div className="md:hidden bg-white border-t p-2 text-center text-xs font-bold text-gray-500">
        Current Turn: <span className={turn === 'ALICE' ? 'text-blue-600' : 'text-purple-600'}>{turn}</span>
      </div>
    </div>
  );
};

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);