import { GoogleGenAI, Type } from "@google/genai";
import {
  SignalBridge,
  JournalEntry,
  JournalAnalysis,
  MarketContext,
  ContentBrief,
  MarketPosition,
  JournalMarketConnection,
  MarketContentConnection,
  UnifiedThesis,
  PredictionMarket,
  SystemConfig,
  UserPersona,
  ContentArchetype,
  MarketArchetype,
  CreatorMindState,
  PredictorMindState,
} from "../types";

import { analyzeJournalEntry, createJournalEntry } from "./journalProcessor";
import { generateMarketPosition, runAdversarialAnalysis, generatePredictorMindState } from "./adversarialMind";
import { generateContentBrief, generateCreatorMindState, checkAuthenticity } from "./contentForge";

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL BRIDGE - The Unified Orchestration Layer
// ═══════════════════════════════════════════════════════════════════════════
// "The test of a first-rate intelligence is the ability to hold two opposing
// ideas in mind at the same time and still retain the ability to function."
// — F. Scott Fitzgerald
//
// This system unifies:
// - Personal truth extraction (Journal → Insights)
// - Content generation (Insights → YouTube Shorts)
// - Prediction market alpha (Insights → Positions)
//
// The bridge maintains coherence between the authentic self, the public self,
// and the analytical self.
// ═══════════════════════════════════════════════════════════════════════════

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ORCHESTRATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function processJournalInput(
  input: string | JournalEntry,
  config: SystemConfig,
  context?: {
    markets?: PredictionMarket[];
    persona?: UserPersona;
    previousAnalyses?: JournalAnalysis[];
  }
): Promise<SignalBridge> {
  // Create entry if string input
  const entry = typeof input === 'string' 
    ? createJournalEntry(input, { content_permission: 'FULL' })
    : input;

  // Step 1: Analyze the journal entry
  const journalAnalysis = await analyzeJournalEntry(entry, {
    previous_beliefs: context?.previousAnalyses?.flatMap(a => a.belief_statements.map(b => b.statement)),
    market_interests: context?.markets?.map(m => m.category),
    content_goals: context?.persona?.content_pillars,
    psychological_profile: context?.persona ? 
      `${context.persona.psychological_archetype} with ${context.persona.creator_archetype} tendencies` : undefined,
  });

  // Step 2: Generate outputs based on mode
  const contentBriefs: ContentBrief[] = [];
  const marketPositions: MarketPosition[] = [];

  // Content generation path
  if (config.mode === 'JOURNAL_TO_CONTENT' || config.mode === 'BRIDGE_MODE') {
    const brief = await generateContentBrief(journalAnalysis, {
      archetype: config.content_style,
      platform: config.platform_target,
      targetDuration: 45,
      audienceProfile: {},
      persona: context?.persona,
      includeMarketContent: false,
    });
    contentBriefs.push(brief);
  }

  // Market prediction path
  if (config.mode === 'JOURNAL_TO_PREDICTION' || config.mode === 'BRIDGE_MODE') {
    if (context?.markets && context.markets.length > 0) {
      // Generate positions for relevant markets
      for (const market of context.markets.slice(0, 3)) { // Limit to top 3
        const position = await generateMarketPosition(
          market,
          journalAnalysis.market_signals,
          journalAnalysis,
          config.market_style
        );
        
        // Only include positions with conviction above threshold
        if (position.conviction > 0.3 && position.direction !== 'ABSTAIN') {
          marketPositions.push(position);
        }
      }
    }
  }

  // Step 3: Find cross-connections
  const journalToMarket = await findJournalMarketConnections(journalAnalysis, marketPositions);
  const marketToContent = await findMarketContentConnections(marketPositions, contentBriefs);

  // Step 4: Generate unified thesis
  const unifiedThesis = await generateUnifiedThesis(
    journalAnalysis,
    contentBriefs,
    marketPositions
  );

  // Construct the bridge
  const bridge: SignalBridge = {
    id: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    
    journal_entries: [entry],
    market_context: context?.markets?.map(m => ({
      market_id: m.id,
      question: m.question,
      current_state: m,
      recent_movement: 0,
      key_dates: [m.resolution_date],
      related_markets: [],
    })) || [],
    
    journal_analysis: [journalAnalysis],
    
    content_briefs: contentBriefs,
    market_positions: marketPositions,
    
    journal_to_market: journalToMarket,
    market_to_content: marketToContent,
    unified_thesis: unifiedThesis,
  };

  return bridge;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTION FINDERS
// ─────────────────────────────────────────────────────────────────────────────

async function findJournalMarketConnections(
  analysis: JournalAnalysis,
  positions: MarketPosition[]
): Promise<JournalMarketConnection[]> {
  if (positions.length === 0) return [];

  const prompt = `
Find connections between these journal insights and market positions:

JOURNAL INSIGHTS:
${analysis.key_insights.map(i => `- ${i.content}`).join("\n")}

JOURNAL BELIEFS:
${analysis.belief_statements.map(b => `- "${b.statement}"`).join("\n")}

MARKET POSITIONS:
${positions.map(p => `- ${p.direction} on: ${p.thesis}`).join("\n")}

For each connection found:
1. What journal insight connects to which market position?
2. How strong is the connection (0-1)?
3. Is it actionable (can we trade on it)?
4. What's the rationale?

Return as JSON array of connections.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const result = JSON.parse(response.text || "[]");
  
  return (Array.isArray(result) ? result : result.connections || []).map((c: any) => ({
    journal_insight: c.journal_insight || "",
    market_application: c.market_application || "",
    connection_strength: c.connection_strength || 0.5,
    actionable: c.actionable || false,
    rationale: c.rationale || "",
  }));
}

async function findMarketContentConnections(
  positions: MarketPosition[],
  briefs: ContentBrief[]
): Promise<MarketContentConnection[]> {
  if (positions.length === 0 || briefs.length === 0) return [];

  const prompt = `
Find connections between market positions and content opportunities:

MARKET POSITIONS:
${positions.map(p => `- ${p.direction} on: ${p.thesis} (conviction: ${Math.round(p.conviction * 100)}%)`).join("\n")}

CONTENT BRIEFS:
${briefs.map(b => `- Hook: "${b.script.hook_segment}"`).join("\n")}

For each potential content piece about a market position:
1. What's the content angle?
2. Does it require disclosure? (YES if discussing position)
3. Audience interest (0-1)
4. Educational value (0-1)

Return as JSON array.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const result = JSON.parse(response.text || "[]");
  
  return (Array.isArray(result) ? result : result.connections || []).map((c: any) => ({
    market_position: c.market_position || "",
    content_angle: c.content_angle || "",
    disclosure_required: c.disclosure_required ?? true,
    audience_interest: c.audience_interest || 0.5,
    educational_value: c.educational_value || 0.5,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED THESIS GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

async function generateUnifiedThesis(
  analysis: JournalAnalysis,
  briefs: ContentBrief[],
  positions: MarketPosition[]
): Promise<UnifiedThesis> {
  const prompt = `
Generate a unified thesis that connects personal beliefs, content, and market positions:

PERSONAL BELIEFS:
${analysis.belief_statements.map(b => `- "${b.statement}" (${b.belief_type})`).join("\n")}

KEY INSIGHTS:
${analysis.key_insights.slice(0, 5).map(i => `- ${i.content}`).join("\n")}

CONTENT BEING CREATED:
${briefs.map(b => `- ${b.script.hook_segment}`).join("\n") || "None yet"}

MARKET POSITIONS:
${positions.map(p => `- ${p.direction}: ${p.thesis}`).join("\n") || "None yet"}

Generate a unified thesis that:
1. Captures the core belief driving everything
2. Shows how personal insights inform market views
3. Explains how content expression relates to beliefs
4. Has a clear conviction score (0-1)
5. Has a time horizon

Return as JSON matching UnifiedThesis structure.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    core_belief: result.core_belief || "No unified thesis formed",
    personal_evidence: result.personal_evidence || [],
    market_evidence: result.market_evidence || [],
    content_expression: result.content_expression || "",
    conviction_score: result.conviction_score || 0.5,
    time_horizon: result.time_horizon || "Medium-term",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DUAL MIND STATE - Get both creator and predictor perspectives
// ─────────────────────────────────────────────────────────────────────────────

export async function getDualMindState(
  bridge: SignalBridge
): Promise<{
  creator: CreatorMindState;
  predictor: PredictorMindState;
  harmony: number;
  tension_points: string[];
  integrated_view: string;
}> {
  const analysis = bridge.journal_analysis[0];
  const brief = bridge.content_briefs[0];
  const positions = bridge.market_positions;

  // Get both mind states
  const [creator, predictor] = await Promise.all([
    brief ? generateCreatorMindState(analysis, brief) : Promise.resolve(null),
    generatePredictorMindState(positions, [], analysis),
  ]);

  // Find harmony/tension between the two
  const prompt = `
Analyze the harmony between the creator mind and predictor mind:

CREATOR STATE:
${creator ? `
- Authentic truth: ${creator.my_authentic_truth}
- Performed truth: ${creator.my_performed_truth}
- Is authentic: ${creator.am_i_being_authentic}
` : "No content creation active"}

PREDICTOR STATE:
- Thesis: ${predictor.my_thesis}
- Confidence: ${Math.round(predictor.my_confidence * 100)}%
- Is rational: ${predictor.am_i_being_rational}
- Emotional contamination: ${Math.round(predictor.emotional_contamination * 100)}%

Questions:
1. How much harmony (0-1) between creator and predictor selves?
2. Where are the tension points?
3. What's an integrated view that honors both?

Return JSON: harmony, tension_points[], integrated_view
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    creator: creator || {
      my_authentic_truth: "",
      my_performed_truth: "",
      gap_awareness: 0,
      what_audience_wants: "",
      what_audience_needs: "",
      what_will_engage: "",
      am_i_being_authentic: true,
      authenticity_cost: "",
      performance_cost: "",
    },
    predictor,
    harmony: result.harmony || 0.5,
    tension_points: result.tension_points || [],
    integrated_view: result.integrated_view || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH PROCESSING - Process multiple entries
// ─────────────────────────────────────────────────────────────────────────────

export async function processBatchJournals(
  entries: JournalEntry[],
  config: SystemConfig,
  context?: {
    markets?: PredictionMarket[];
    persona?: UserPersona;
  }
): Promise<{
  bridges: SignalBridge[];
  aggregate_thesis: UnifiedThesis;
  recommended_content_series: string[];
  recommended_positions: MarketPosition[];
}> {
  // Process each entry
  const bridges = await Promise.all(
    entries.map((entry, i) => 
      processJournalInput(entry, config, {
        ...context,
        previousAnalyses: i > 0 ? 
          bridges.slice(0, i).flatMap(b => b.journal_analysis) : 
          [],
      })
    )
  );

  // Aggregate all analyses
  const allAnalyses = bridges.flatMap(b => b.journal_analysis);
  const allPositions = bridges.flatMap(b => b.market_positions);
  const allBriefs = bridges.flatMap(b => b.content_briefs);

  // Generate aggregate thesis
  const aggregatePrompt = `
Generate an aggregate thesis from multiple journal entries:

BELIEFS ACROSS ENTRIES:
${allAnalyses.flatMap(a => a.belief_statements).map(b => `- "${b.statement}"`).slice(0, 10).join("\n")}

KEY INSIGHTS:
${allAnalyses.flatMap(a => a.key_insights).map(i => `- ${i.content}`).slice(0, 10).join("\n")}

MARKET POSITIONS GENERATED:
${allPositions.map(p => `- ${p.direction}: ${p.thesis}`).join("\n") || "None"}

Generate:
1. An aggregate thesis that captures the unified worldview
2. Content series recommendations (themes that span multiple entries)
3. Which market positions have the most evidence

Return JSON with: aggregate_thesis, content_series_recommendations[], top_positions[]
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aggregatePrompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    bridges,
    aggregate_thesis: {
      core_belief: result.aggregate_thesis?.core_belief || "",
      personal_evidence: result.aggregate_thesis?.personal_evidence || [],
      market_evidence: result.aggregate_thesis?.market_evidence || [],
      content_expression: result.aggregate_thesis?.content_expression || "",
      conviction_score: result.aggregate_thesis?.conviction_score || 0.5,
      time_horizon: result.aggregate_thesis?.time_horizon || "Medium-term",
    },
    recommended_content_series: result.content_series_recommendations || [],
    recommended_positions: allPositions
      .filter(p => result.top_positions?.includes(p.thesis) || p.conviction > 0.6)
      .sort((a, b) => b.conviction - a.conviction),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COHERENCE CHECKER - Ensure internal consistency
// ─────────────────────────────────────────────────────────────────────────────

export async function checkCoherence(
  bridge: SignalBridge
): Promise<{
  coherence_score: number;
  contradictions: string[];
  alignment_strengths: string[];
  recommendations: string[];
}> {
  const prompt = `
Check the coherence of this bridge between journal, content, and market positions:

UNIFIED THESIS:
"${bridge.unified_thesis.core_belief}"

JOURNAL BELIEFS:
${bridge.journal_analysis.flatMap(a => a.belief_statements).map(b => `- "${b.statement}"`).join("\n")}

CONTENT BEING CREATED:
${bridge.content_briefs.map(b => `- Hook: "${b.script.hook_segment}"`).join("\n") || "None"}

MARKET POSITIONS:
${bridge.market_positions.map(p => `- ${p.direction}: ${p.thesis}`).join("\n") || "None"}

Analyze:
1. Coherence score (0-1): How internally consistent is everything?
2. Contradictions: Where do beliefs, content, and positions conflict?
3. Alignment strengths: Where do they reinforce each other?
4. Recommendations: How to improve coherence?

Return JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.5,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    coherence_score: result.coherence_score || 0.5,
    contradictions: result.contradictions || [],
    alignment_strengths: result.alignment_strengths || [],
    recommendations: result.recommendations || [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK BRIDGE - Fast path for simple inputs
// ─────────────────────────────────────────────────────────────────────────────

export async function quickBridge(
  thought: string,
  mode: 'CONTENT' | 'PREDICTION' | 'BOTH' = 'BOTH'
): Promise<{
  insight: string;
  content_hook?: string;
  market_signal?: string;
  action?: string;
}> {
  const prompt = `
Quick analysis of this thought:

"${thought}"

Extract:
1. Core insight (what's the real point?)
${mode !== 'PREDICTION' ? '2. Content hook (how to make this engaging?)' : ''}
${mode !== 'CONTENT' ? '3. Market signal (any prediction market relevance?)' : ''}
4. Recommended action

Return JSON: insight, content_hook?, market_signal?, action
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  return JSON.parse(response.text || "{}");
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT CONVENIENCE CREATORS
// ─────────────────────────────────────────────────────────────────────────────

export function createDefaultConfig(
  mode: SystemConfig['mode'] = 'BRIDGE_MODE'
): SystemConfig {
  return {
    mode,
    content_style: 'STORYTELLER',
    platform_target: 'YOUTUBE_SHORTS',
    market_style: 'ORACLE',
    risk_tolerance: 'MODERATE',
    anonymization_level: 'LIGHT',
    market_disclosure: true,
    psychological_depth: 0.7,
    adversarial_intensity: 0.6,
  };
}

export function createUserPersona(
  name: string,
  options: Partial<UserPersona> = {}
): UserPersona {
  return {
    id: `persona-${Date.now()}`,
    name,
    creator_archetype: options.creator_archetype || 'STORYTELLER',
    market_archetype: options.market_archetype || 'ORACLE',
    psychological_archetype: options.psychological_archetype || 'HERO',
    tone: options.tone || 'Conversational and authentic',
    vocabulary_level: options.vocabulary_level || 'ACCESSIBLE',
    humor_style: options.humor_style,
    catchphrases: options.catchphrases,
    visual_identity: options.visual_identity || 'Minimal and clean',
    color_palette: options.color_palette || ['#3B82F6', '#8B5CF6', '#EC4899'],
    content_pillars: options.content_pillars || ['Personal Growth', 'Markets', 'Life Lessons'],
    never_say: options.never_say,
    always_include: options.always_include,
    disclosure_requirements: options.disclosure_requirements || [
      'Not financial advice',
      'Personal opinion only',
    ],
  };
}

export function createSampleMarket(
  question: string,
  currentPrice: number = 0.5,
  platform: PredictionMarket['platform'] = 'POLYMARKET'
): PredictionMarket {
  return {
    id: `market-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    platform,
    question,
    current_price: currentPrice,
    volume: 10000,
    liquidity: 5000,
    resolution_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'General',
  };
}
