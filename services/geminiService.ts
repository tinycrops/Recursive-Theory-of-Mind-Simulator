import { GoogleGenAI, Type } from "@google/genai";
import { AgentState, Message, RecursiveMindState } from "../types";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "The verbal message sent to the other agent.",
    },
    selfAnalysis: {
      type: Type.STRING,
      description: "Internal monologue about current strategy and goal progress.",
    },
    modelOfOther: {
      type: Type.STRING,
      description: "Current belief about the other agent's hidden goals and personality.",
    },
    modelOfOthersModel: {
      type: Type.STRING,
      description: "Current belief about what the OTHER agent thinks about ME.",
    },
  },
  required: ["message", "selfAnalysis", "modelOfOther", "modelOfOthersModel"],
};

export const generateAgentTurn = async (
  agent: AgentState,
  otherAgentName: string,
  history: Message[],
  context: string
): Promise<{ message: string; mindState: RecursiveMindState }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format history for the prompt
  const conversationLog = history
    .map((msg) => `${msg.sender}: "${msg.text}"`)
    .join("\n");

  const systemPrompt = `
    You are simulating an intelligent agent named ${agent.name}.
    You possess "Theory of Mind" and specifically "Second-Order Theory of Mind".
    
    Current Scenario: ${context}
    Your Secret Goal: ${agent.secretGoal}
    The Other Agent: ${otherAgentName}

    Your task is to generate the next turn in the conversation. However, before speaking, you must perform deep cognitive modeling.
    
    You must update three layers of cognition:
    1. SELF ANALYSIS: Your internal thoughts, strategy, and how close you are to your goal.
    2. MODEL OF ${otherAgentName}: What do you think ${otherAgentName}'s secret goal is? What is their strategy?
    3. MODEL OF ${otherAgentName}'s MODEL OF YOU: What do you believe ${otherAgentName} thinks about YOU? Do they trust you? Do they know your goal?

    Conversation History:
    ${conversationLog}

    Generate your response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const jsonResponse = JSON.parse(response.text || "{}");

    return {
      message: jsonResponse.message,
      mindState: {
        selfAnalysis: jsonResponse.selfAnalysis,
        modelOfOther: jsonResponse.modelOfOther,
        modelOfOthersModel: jsonResponse.modelOfOthersModel,
      },
    };
  } catch (error) {
    console.error("Error generating agent turn:", error);
    throw error;
  }
};