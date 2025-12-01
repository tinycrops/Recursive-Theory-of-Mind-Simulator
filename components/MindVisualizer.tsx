import React from "react";
import { AgentState } from "../types";
import { Brain, User, RefreshCw } from "lucide-react";

interface MindVisualizerProps {
  agent: AgentState;
  otherName: string;
  isThinking: boolean;
}

export const MindVisualizer: React.FC<MindVisualizerProps> = ({
  agent,
  otherName,
  isThinking,
}) => {
  const isAlice = agent.name === "Alice";
  
  // Base colors
  const primaryColor = isAlice ? "border-blue-500" : "border-purple-500";
  const primaryBg = isAlice ? "bg-blue-50" : "bg-purple-50";
  const primaryText = isAlice ? "text-blue-900" : "text-purple-900";
  
  // Secondary colors (representing the model of the other)
  const secondaryColor = isAlice ? "border-purple-400" : "border-blue-400";
  const secondaryBg = isAlice ? "bg-purple-50" : "bg-blue-50";
  const secondaryText = isAlice ? "text-purple-900" : "text-blue-900";

  // Tertiary colors (recursive model)
  const tertiaryColor = isAlice ? "border-blue-300" : "border-purple-300";
  const tertiaryBg = "bg-white";

  return (
    <div className={`relative flex flex-col w-full h-full p-4 transition-all duration-500 ${isThinking ? 'opacity-50 grayscale' : 'opacity-100'}`}>
      
      {/* Header / Self Identity */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAlice ? 'bg-blue-600' : 'bg-purple-600'} text-white font-bold shadow-md`}>
          {agent.name[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{agent.name}'s Mind</h2>
          <p className="text-xs text-gray-500 font-mono">Secret Goal: {agent.secretGoal}</p>
        </div>
      </div>

      {/* Layer 0: Self Analysis (The Container) */}
      <div className={`flex-1 rounded-2xl border-2 ${primaryColor} ${primaryBg} p-4 shadow-sm relative flex flex-col gap-4`}>
        <div className="flex items-center gap-2 mb-1">
          <Brain className={`w-4 h-4 ${primaryText}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${primaryText}`}>Internal Monologue</span>
        </div>
        <p className={`text-sm ${primaryText} italic mb-4`}>
          "{agent.mindState.selfAnalysis || "Waiting to start..."}"
        </p>

        {/* Layer 1: Model of Other */}
        <div className={`flex-1 rounded-2xl border-2 ${secondaryColor} ${secondaryBg} p-4 relative flex flex-col gap-4 shadow-inner`}>
          <div className="flex items-center gap-2 mb-1">
            <User className={`w-4 h-4 ${secondaryText}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>
              {agent.name}'s Model of {otherName}
            </span>
          </div>
          <p className={`text-sm ${secondaryText} mb-4`}>
            "{agent.mindState.modelOfOther || "No model formed yet."}"
          </p>

          {/* Layer 2: Recursive Model */}
          <div className={`flex-1 rounded-xl border-2 border-dashed ${tertiaryColor} ${tertiaryBg} p-3 shadow-sm`}>
             <div className="flex items-center gap-2 mb-1">
              <RefreshCw className={`w-3 h-3 ${isAlice ? 'text-blue-600' : 'text-purple-600'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-600`}>
                {agent.name}'s Model of {otherName}'s Model of {agent.name}
              </span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              "{agent.mindState.modelOfOthersModel || "No recursive model yet."}"
            </p>
          </div>

        </div>
      </div>
      
      {/* Visual Connector Line (Decorative) */}
      <div className={`absolute top-1/2 ${isAlice ? '-right-6' : '-left-6'} w-8 h-0 border-t-2 border-dashed border-gray-300 hidden md:block pointer-events-none transform -translate-y-1/2`} />
    </div>
  );
};
