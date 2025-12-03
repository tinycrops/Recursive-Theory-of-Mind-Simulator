/**
 * Scenario Test Runner for Recursive Theory of Mind Simulator
 * 
 * This script runs test scenarios through the Gemini API and records
 * the conversation output along with each agent's mental state evolution.
 * 
 * Usage:
 *   npx tsx tests/runScenarios.ts                    # Run all scenarios
 *   npx tsx tests/runScenarios.ts --scenario car-negotiation  # Run specific scenario
 *   npx tsx tests/runScenarios.ts --list             # List available scenarios
 */

import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============== Types ==============

interface RecursiveMindState {
  selfAnalysis: string;
  modelOfOther: string;
  modelOfOthersModel: string;
}

interface AgentState {
  name: string;
  secretGoal: string;
  mindState: RecursiveMindState;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  context: string;
  aliceGoal: string;
  bobGoal: string;
  turns: number;
  category: string;
}

interface TurnResult {
  turnNumber: number;
  agent: string;
  message: string;
  mindState: RecursiveMindState;
  timestamp: string;
}

interface ScenarioResult {
  scenario: Scenario;
  startTime: string;
  endTime: string;
  durationMs: number;
  turns: TurnResult[];
  finalStates: {
    alice: AgentState;
    bob: AgentState;
  };
  success: boolean;
  error?: string;
}

// ============== Constants ==============

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

const INITIAL_MIND_STATE: RecursiveMindState = {
  selfAnalysis: "",
  modelOfOther: "",
  modelOfOthersModel: "",
};

// ============== API Functions ==============

async function generateAgentTurn(
  ai: GoogleGenAI,
  agent: AgentState,
  otherAgentName: string,
  history: Message[],
  context: string
): Promise<{ message: string; mindState: RecursiveMindState }> {
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
    ${conversationLog || "(No messages yet - you are starting the conversation)"}

    Generate your response in JSON format.
  `;

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
}

// ============== Scenario Runner ==============

async function runScenario(ai: GoogleGenAI, scenario: Scenario): Promise<ScenarioResult> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📋 Running: ${scenario.name}`);
  console.log(`   Category: ${scenario.category}`);
  console.log(`   Turns: ${scenario.turns}`);
  console.log(`${"=".repeat(60)}\n`);

  const startTime = new Date();
  const turns: TurnResult[] = [];
  const messages: Message[] = [];

  let alice: AgentState = {
    name: "Alice",
    secretGoal: scenario.aliceGoal,
    mindState: { ...INITIAL_MIND_STATE },
  };

  let bob: AgentState = {
    name: "Bob",
    secretGoal: scenario.bobGoal,
    mindState: { ...INITIAL_MIND_STATE },
  };

  try {
    for (let turnNum = 1; turnNum <= scenario.turns; turnNum++) {
      const isAliceTurn = turnNum % 2 === 1;
      const currentAgent = isAliceTurn ? alice : bob;
      const otherAgentName = isAliceTurn ? "Bob" : "Alice";

      console.log(`\n🎭 Turn ${turnNum}: ${currentAgent.name}'s turn...`);

      const result = await generateAgentTurn(
        ai,
        currentAgent,
        otherAgentName,
        messages,
        scenario.context
      );

      // Update agent state
      if (isAliceTurn) {
        alice = { ...alice, mindState: result.mindState };
      } else {
        bob = { ...bob, mindState: result.mindState };
      }

      // Record the turn
      const turnResult: TurnResult = {
        turnNumber: turnNum,
        agent: currentAgent.name,
        message: result.message,
        mindState: result.mindState,
        timestamp: new Date().toISOString(),
      };
      turns.push(turnResult);

      // Add to message history
      messages.push({
        id: `msg-${turnNum}`,
        sender: currentAgent.name,
        text: result.message,
        timestamp: Date.now(),
      });

      // Display the turn
      console.log(`   💬 ${currentAgent.name}: "${result.message}"`);
      console.log(`   🧠 Self: ${result.mindState.selfAnalysis.substring(0, 100)}...`);
      console.log(`   👤 Model of ${otherAgentName}: ${result.mindState.modelOfOther.substring(0, 80)}...`);
      console.log(`   🔄 ${otherAgentName}'s view of me: ${result.mindState.modelOfOthersModel.substring(0, 80)}...`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const endTime = new Date();

    return {
      scenario,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: endTime.getTime() - startTime.getTime(),
      turns,
      finalStates: { alice, bob },
      success: true,
    };
  } catch (error) {
    const endTime = new Date();
    console.error(`\n❌ Error in scenario: ${error}`);
    
    return {
      scenario,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: endTime.getTime() - startTime.getTime(),
      turns,
      finalStates: { alice, bob },
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============== Output Formatting ==============

function formatResultAsMarkdown(result: ScenarioResult): string {
  const lines: string[] = [];
  
  lines.push(`# ${result.scenario.name}`);
  lines.push("");
  lines.push(`**Category:** ${result.scenario.category}`);
  lines.push(`**Description:** ${result.scenario.description}`);
  lines.push(`**Status:** ${result.success ? "✅ Completed" : "❌ Failed"}`);
  lines.push(`**Duration:** ${(result.durationMs / 1000).toFixed(2)}s`);
  lines.push(`**Timestamp:** ${result.startTime}`);
  lines.push("");
  
  lines.push("## Scenario Setup");
  lines.push("");
  lines.push("### Context");
  lines.push(`> ${result.scenario.context}`);
  lines.push("");
  lines.push("### Secret Goals");
  lines.push(`- **Alice's Goal:** ${result.scenario.aliceGoal}`);
  lines.push(`- **Bob's Goal:** ${result.scenario.bobGoal}`);
  lines.push("");
  
  lines.push("## Conversation Transcript");
  lines.push("");
  
  for (const turn of result.turns) {
    lines.push(`### Turn ${turn.turnNumber}: ${turn.agent}`);
    lines.push("");
    lines.push(`**Message:**`);
    lines.push(`> "${turn.message}"`);
    lines.push("");
    lines.push(`**Mental State:**`);
    lines.push(`- *Self Analysis:* ${turn.mindState.selfAnalysis}`);
    lines.push(`- *Model of Other:* ${turn.mindState.modelOfOther}`);
    lines.push(`- *Other's Model of Me:* ${turn.mindState.modelOfOthersModel}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  
  lines.push("## Final Mental States");
  lines.push("");
  lines.push("### Alice's Final State");
  lines.push(`- *Self Analysis:* ${result.finalStates.alice.mindState.selfAnalysis}`);
  lines.push(`- *Model of Bob:* ${result.finalStates.alice.mindState.modelOfOther}`);
  lines.push(`- *Bob's Model of Me:* ${result.finalStates.alice.mindState.modelOfOthersModel}`);
  lines.push("");
  lines.push("### Bob's Final State");
  lines.push(`- *Self Analysis:* ${result.finalStates.bob.mindState.selfAnalysis}`);
  lines.push(`- *Model of Alice:* ${result.finalStates.bob.mindState.modelOfOther}`);
  lines.push(`- *Alice's Model of Me:* ${result.finalStates.bob.mindState.modelOfOthersModel}`);
  lines.push("");
  
  if (result.error) {
    lines.push("## Error");
    lines.push(`\`\`\`\n${result.error}\n\`\`\``);
  }
  
  return lines.join("\n");
}

function generateSummaryReport(results: ScenarioResult[]): string {
  const lines: string[] = [];
  
  lines.push("# Theory of Mind Simulation - Test Results Summary");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Total Scenarios:** ${results.length}`);
  lines.push(`**Successful:** ${results.filter(r => r.success).length}`);
  lines.push(`**Failed:** ${results.filter(r => !r.success).length}`);
  lines.push("");
  
  lines.push("## Results Overview");
  lines.push("");
  lines.push("| Scenario | Category | Turns | Duration | Status |");
  lines.push("|----------|----------|-------|----------|--------|");
  
  for (const result of results) {
    const status = result.success ? "✅" : "❌";
    const duration = `${(result.durationMs / 1000).toFixed(1)}s`;
    lines.push(`| ${result.scenario.name} | ${result.scenario.category} | ${result.turns.length}/${result.scenario.turns} | ${duration} | ${status} |`);
  }
  
  lines.push("");
  lines.push("## Category Breakdown");
  lines.push("");
  
  const categories = [...new Set(results.map(r => r.scenario.category))];
  for (const category of categories) {
    const categoryResults = results.filter(r => r.scenario.category === category);
    const successCount = categoryResults.filter(r => r.success).length;
    lines.push(`- **${category}:** ${successCount}/${categoryResults.length} successful`);
  }
  
  lines.push("");
  lines.push("---");
  lines.push("*See individual scenario files for detailed transcripts.*");
  
  return lines.join("\n");
}

// ============== Main ==============

async function main() {
  const args = process.argv.slice(2);
  
  // Load scenarios
  const scenariosPath = path.join(__dirname, "scenarios.json");
  const scenariosData = JSON.parse(fs.readFileSync(scenariosPath, "utf-8"));
  const allScenarios: Scenario[] = scenariosData.scenarios;
  
  // Handle --list flag
  if (args.includes("--list")) {
    console.log("\n📋 Available Scenarios:\n");
    for (const scenario of allScenarios) {
      console.log(`  ${scenario.id.padEnd(25)} [${scenario.category}] ${scenario.name}`);
    }
    console.log(`\nTotal: ${allScenarios.length} scenarios\n`);
    return;
  }
  
  // Get API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY or API_KEY environment variable is required");
    console.error("   Set it with: export GEMINI_API_KEY=your-api-key");
    process.exit(1);
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Filter scenarios if --scenario flag is provided
  let scenariosToRun = allScenarios;
  const scenarioIndex = args.indexOf("--scenario");
  if (scenarioIndex !== -1 && args[scenarioIndex + 1]) {
    const scenarioId = args[scenarioIndex + 1];
    scenariosToRun = allScenarios.filter(s => s.id === scenarioId);
    if (scenariosToRun.length === 0) {
      console.error(`❌ Scenario not found: ${scenarioId}`);
      console.error("   Use --list to see available scenarios");
      process.exit(1);
    }
  }
  
  // Check for --category flag
  const categoryIndex = args.indexOf("--category");
  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    const category = args[categoryIndex + 1];
    scenariosToRun = scenariosToRun.filter(s => s.category === category);
    if (scenariosToRun.length === 0) {
      console.error(`❌ No scenarios found in category: ${category}`);
      process.exit(1);
    }
  }
  
  console.log("\n🧠 Recursive Theory of Mind Simulator - Test Runner");
  console.log("=".repeat(60));
  console.log(`📊 Running ${scenariosToRun.length} scenario(s)...\n`);
  
  // Create output directory
  const outputDir = path.join(__dirname, "results");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const runDir = path.join(outputDir, `run-${timestamp}`);
  
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
  }
  
  // Run scenarios
  const results: ScenarioResult[] = [];
  
  for (const scenario of scenariosToRun) {
    const result = await runScenario(ai, scenario);
    results.push(result);
    
    // Save individual result
    const resultPath = path.join(runDir, `${scenario.id}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    
    const markdownPath = path.join(runDir, `${scenario.id}.md`);
    fs.writeFileSync(markdownPath, formatResultAsMarkdown(result));
    
    console.log(`\n✅ Saved: ${scenario.id}.json and ${scenario.id}.md`);
    
    // Delay between scenarios to avoid rate limits
    if (scenariosToRun.indexOf(scenario) < scenariosToRun.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next scenario...\n");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  
  // Generate and save summary
  const summaryPath = path.join(runDir, "SUMMARY.md");
  fs.writeFileSync(summaryPath, generateSummaryReport(results));
  
  const allResultsPath = path.join(runDir, "all-results.json");
  fs.writeFileSync(allResultsPath, JSON.stringify(results, null, 2));
  
  // Print final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST RUN COMPLETE");
  console.log("=".repeat(60));
  console.log(`\n✅ Successful: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`\n📁 Results saved to: ${runDir}`);
  console.log("\nFiles generated:");
  console.log(`  - SUMMARY.md (overview report)`);
  console.log(`  - all-results.json (complete data)`);
  console.log(`  - [scenario-id].json (individual JSON results)`);
  console.log(`  - [scenario-id].md (individual markdown reports)`);
  console.log("");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
