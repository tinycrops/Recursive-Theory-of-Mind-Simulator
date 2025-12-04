import { GoogleGenAI, Type } from "@google/genai";
import {
  MarketSignal,
  ContrarianIndicator,
  PredictionMarket,
  MarketPosition,
  AdversarialAnalysis,
  Scenario,
  CognitiveBias,
  PredictorMindState,
  MarketArchetype,
  JournalAnalysis,
  BeliefStatement,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// ADVERSARIAL MIND - The Prediction Market Alpha Generator
// ═══════════════════════════════════════════════════════════════════════════
// "It is not the strongest of the species that survives, nor the most 
// intelligent, but the one most responsive to change." — Darwin
//
// "The market can remain irrational longer than you can remain solvent." — Keynes
//
// This system embodies the adversarial thinker: challenging assumptions,
// stress-testing theses, and finding alpha through contrarian reasoning.
// ═══════════════════════════════════════════════════════════════════════════

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// MARKET ARCHETYPE PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPE_REASONING: Record<MarketArchetype, string> = {
  ORACLE: `Think like an ORACLE: You see patterns in noise that others miss.
           You speak in probabilities, never certainties. You understand that
           the future is a probability distribution, not a point. Your edge
           comes from calibration and information synthesis.`,
           
  CONTRARIAN: `Think like a CONTRARIAN: You profit from crowd mistakes.
               The more confident the crowd, the more you examine the opposite.
               "When everyone is thinking alike, no one is thinking."
               Look for consensus that has become unexamined.`,
               
  MOMENTUM: `Think like MOMENTUM: Trends persist longer than expected.
             Don't fight the tape. Follow strength, cut weakness.
             "The trend is your friend until the end."
             But always know where the exits are.`,
             
  VALUE: `Think like VALUE: Price is what you pay, value is what you get.
          Find mispricings through patient analysis. The market is often
          wrong in the short term but right in the long term.
          Your edge is patience and conviction.`,
          
  ARBITRAGEUR: `Think like an ARBITRAGEUR: Find inefficiencies and exploit them.
                Risk-neutral, emotion-free. If the same outcome is priced
                differently in different places, there's an opportunity.
                But beware of hidden correlations.`,
                
  NARRATIVE: `Think like NARRATIVE: Stories move markets more than fundamentals.
              What's the story the market believes? What's the story about to change?
              Narratives shift slowly, then suddenly. Catch the inflection.`,
              
  QUANT: `Think like a QUANT: Pure signal extraction, emotion-blind.
          Backtest everything. If it can't be measured, it doesn't exist.
          But remember: past performance ≠ future results.
          Always account for regime change.`,
          
  WHALE: `Think like a WHALE: You move markets. Self-aware of your impact.
          Position sizing matters as much as direction.
          Think about who will take the other side. Liquidity is everything.`,
          
  DEGEN: `Think like a DEGEN: High conviction, high risk, YOLO energy.
          Sometimes the play is obvious and the crowd is wrong.
          But know the difference between conviction and delusion.
          Size bets to survive being wrong.`,
          
  SAGE: `Think like a SAGE: Long-term, macro thinker.
         What will the world look like in 10 years?
         Ignore the noise, focus on structural trends.
         Compound knowledge, not just capital.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// POSITION GENERATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const POSITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    direction: { type: Type.STRING, enum: ["YES", "NO", "ABSTAIN"] },
    conviction: { type: Type.NUMBER, description: "0-1 conviction level" },
    size_recommendation: { type: Type.STRING, enum: ["SKIP", "SMALL", "MEDIUM", "LARGE", "MAX"] },
    
    thesis: { type: Type.STRING, description: "Core thesis for this position" },
    primary_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
    adversarial_challenge: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Why we might be wrong" },
    
    entry_price_target: { type: Type.NUMBER, description: "Ideal entry price (probability)" },
    exit_price_target: { type: Type.NUMBER, description: "Target exit price" },
    stop_loss: { type: Type.NUMBER, description: "Cut loss at this price" },
    time_horizon: { type: Type.STRING, description: "Expected holding period" },
    
    edge_source: { type: Type.STRING, enum: ["INFORMATION", "TIMING", "PSYCHOLOGY", "STRUCTURAL", "NARRATIVE"] },
    key_invalidation: { type: Type.STRING, description: "What would prove us wrong" },
  },
  required: ["direction", "conviction", "thesis", "primary_evidence", "adversarial_challenge"],
};

const ADVERSARIAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    best_bull_case: { type: Type.STRING },
    best_bear_case: { type: Type.STRING },
    
    biases_detected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          bias_type: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.NUMBER },
          mitigation: { type: Type.STRING },
        },
      },
    },
    
    emotional_influence: { type: Type.NUMBER },
    
    scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          probability: { type: Type.NUMBER },
          outcome_if_true: { type: Type.STRING, enum: ["WIN", "LOSE", "BREAKEVEN"] },
          expected_return: { type: Type.NUMBER },
        },
      },
    },
    
    base_case_probability: { type: Type.NUMBER },
    adjusted_conviction: { type: Type.NUMBER },
    recommendation: { type: Type.STRING, enum: ["PROCEED", "REDUCE_SIZE", "WAIT", "REVERSE", "SKIP"] },
    key_invalidation: { type: Type.STRING },
  },
  required: ["best_bull_case", "best_bear_case", "adjusted_conviction", "recommendation"],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN POSITION GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMarketPosition(
  market: PredictionMarket,
  signals: MarketSignal[],
  journalInsights?: JournalAnalysis,
  archetype: MarketArchetype = 'ORACLE'
): Promise<MarketPosition> {
  
  const signalsSummary = signals.map(s => `
- [${s.signal_type}] ${s.observation}
  Interpretation: ${s.interpretation}
  Strength: ${Math.round(s.signal_strength * 100)}%
  Time sensitivity: ${s.time_sensitivity}
`).join("\n");

  const journalContext = journalInsights ? `
═══════════════════════════════════════════════════════════════════════════════
PERSONAL JOURNAL CONTEXT (First-person intelligence)
═══════════════════════════════════════════════════════════════════════════════

Key Beliefs Expressed:
${journalInsights.belief_statements.map(b => 
  `- "${b.statement}" (Type: ${b.belief_type}, Confidence: ${Math.round(b.confidence_expressed * 100)}%, Testable: ${b.testable})`
).join("\n")}

Market Signals from Journal:
${journalInsights.market_signals.map(s => `- ${s.observation}: ${s.interpretation}`).join("\n")}

Contrarian Indicators:
${journalInsights.contrarian_indicators.map(c => 
  `- Popular: "${c.popular_belief}" → Contrarian: "${c.contrarian_thesis}"`
).join("\n")}

Psychological State:
- Dominant emotions: ${journalInsights.dominant_emotions.join(", ")}
- Defense mechanisms: ${journalInsights.defense_mechanisms_detected.join(", ")}
` : "";

  const prompt = `
═══════════════════════════════════════════════════════════════════════════════
ADVERSARIAL MIND - PREDICTION MARKET ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

${ARCHETYPE_REASONING[archetype]}

═══════════════════════════════════════════════════════════════════════════════
MARKET
═══════════════════════════════════════════════════════════════════════════════

Platform: ${market.platform}
Question: ${market.question}
Current Price: ${Math.round(market.current_price * 100)}% (implied probability)
Volume: ${market.volume}
Liquidity: ${market.liquidity}
Resolution Date: ${market.resolution_date}
Category: ${market.category}

═══════════════════════════════════════════════════════════════════════════════
SIGNALS
═══════════════════════════════════════════════════════════════════════════════

${signalsSummary || "No external signals provided."}

${journalContext}

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

Generate a market position recommendation. You must:

1. FORM A THESIS
   - What do you believe the true probability is?
   - Why does the market have it wrong?
   - What's your edge?

2. BE ADVERSARIAL WITH YOURSELF
   - What's the best argument against your position?
   - What cognitive biases might be influencing you?
   - What would prove you wrong?

3. SIZE APPROPRIATELY
   - How much conviction do you actually have?
   - What's the risk/reward?
   - Can you survive being wrong?

4. SET CLEAR PARAMETERS
   - Entry price target
   - Exit price target
   - Stop loss
   - Time horizon

Remember: The goal is not to be right, but to be calibrated.
A 70% confident prediction should be right ~70% of the time.

If you don't have an edge, ABSTAIN. No shame in sitting out.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: POSITION_SCHEMA,
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    id: `position-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    market_id: market.id,
    direction: result.direction || 'ABSTAIN',
    conviction: result.conviction || 0,
    size_recommendation: result.size_recommendation || 'SKIP',
    thesis: result.thesis || "",
    primary_evidence: result.primary_evidence || [],
    adversarial_challenge: result.adversarial_challenge || [],
    entry_price_target: result.entry_price_target || market.current_price,
    exit_price_target: result.exit_price_target || (result.direction === 'YES' ? 1 : 0),
    stop_loss: result.stop_loss,
    time_horizon: result.time_horizon || "Unknown",
    edge_source: result.edge_source || 'NARRATIVE',
    confidence_calibration: 0.5, // Would be updated based on historical accuracy
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVERSARIAL ANALYSIS - Challenge any position
// ─────────────────────────────────────────────────────────────────────────────

export async function runAdversarialAnalysis(
  position: MarketPosition,
  market: PredictionMarket,
  additionalContext?: string
): Promise<AdversarialAnalysis> {
  
  const prompt = `
═══════════════════════════════════════════════════════════════════════════════
ADVERSARIAL CHALLENGE
═══════════════════════════════════════════════════════════════════════════════

You are the adversarial mind. Your job is to DESTROY this position.
Find every flaw, every bias, every way it could fail.

═══════════════════════════════════════════════════════════════════════════════
THE POSITION UNDER EXAMINATION
═══════════════════════════════════════════════════════════════════════════════

Market: ${market.question}
Current Price: ${Math.round(market.current_price * 100)}%

Position: ${position.direction} at ${Math.round(position.conviction * 100)}% conviction
Size: ${position.size_recommendation}
Thesis: ${position.thesis}

Evidence cited:
${position.primary_evidence.map(e => `- ${e}`).join("\n")}

Self-identified challenges:
${position.adversarial_challenge.map(c => `- ${c}`).join("\n")}

Edge source: ${position.edge_source}
Time horizon: ${position.time_horizon}

${additionalContext ? `Additional context: ${additionalContext}` : ""}

═══════════════════════════════════════════════════════════════════════════════
YOUR ADVERSARIAL TASK
═══════════════════════════════════════════════════════════════════════════════

1. STEEL-MAN THE OPPOSITION
   - What's the BEST case for the opposite position?
   - If a smart person disagrees, what do they know that we don't?

2. DETECT COGNITIVE BIASES
   - What biases might be influencing this position?
   - How severe are they?
   - How can they be mitigated?

3. SCENARIO ANALYSIS
   - What are the possible outcomes?
   - What probability do you assign to each?
   - What's the expected value?

4. FINAL RECOMMENDATION
   - Should this position proceed as-is?
   - Should it be reduced?
   - Should we wait for better entry?
   - Should we reverse?
   - Should we skip entirely?

Be brutal but fair. The goal is truth, not validation.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: ADVERSARIAL_SCHEMA,
      temperature: 0.8,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    position_id: position.id,
    best_bull_case: result.best_bull_case || "",
    best_bear_case: result.best_bear_case || "",
    biases_detected: (result.biases_detected || []).map((b: any) => ({
      bias_type: b.bias_type || 'CONFIRMATION',
      description: b.description || "",
      severity: b.severity || 0.5,
      mitigation: b.mitigation || "",
    })),
    emotional_influence: result.emotional_influence || 0,
    scenarios: (result.scenarios || []).map((s: any) => ({
      name: s.name || "",
      description: s.description || "",
      probability: s.probability || 0,
      outcome_if_true: s.outcome_if_true || 'BREAKEVEN',
      expected_return: s.expected_return || 0,
    })),
    base_case_probability: result.base_case_probability || 0.5,
    adjusted_conviction: result.adjusted_conviction || position.conviction,
    recommendation: result.recommendation || 'SKIP',
    key_invalidation: result.key_invalidation || position.adversarial_challenge[0] || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BELIEF TO BET CONVERTER - Transform journal beliefs into positions
// ─────────────────────────────────────────────────────────────────────────────

export async function convertBeliefToBet(
  belief: BeliefStatement,
  availableMarkets: PredictionMarket[]
): Promise<{
  matched_market: PredictionMarket | null;
  position_recommendation: MarketPosition | null;
  transformation: string;
}> {
  
  if (!belief.testable || !belief.market_relevant) {
    return {
      matched_market: null,
      position_recommendation: null,
      transformation: "Belief is not testable or market-relevant",
    };
  }

  const marketsContext = availableMarkets.map(m => 
    `- [${m.id}] ${m.question} (Current: ${Math.round(m.current_price * 100)}%, Resolves: ${m.resolution_date})`
  ).join("\n");

  const prompt = `
Convert this personal belief into a market position:

Belief: "${belief.statement}"
Type: ${belief.belief_type}
Expressed Confidence: ${Math.round(belief.confidence_expressed * 100)}%
Detected Actual Confidence: ${Math.round(belief.actual_confidence * 100)}%

Available markets:
${marketsContext}

Tasks:
1. Find the market most relevant to this belief (or return null if none match)
2. Translate the belief into a position (YES/NO/ABSTAIN)
3. Adjust confidence based on the gap between expressed and actual confidence
4. Explain the transformation

Return JSON with: matched_market_id, direction, adjusted_conviction, transformation_explanation
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
  
  const matchedMarket = availableMarkets.find(m => m.id === result.matched_market_id) || null;
  
  if (!matchedMarket) {
    return {
      matched_market: null,
      position_recommendation: null,
      transformation: result.transformation_explanation || "No matching market found",
    };
  }

  return {
    matched_market: matchedMarket,
    position_recommendation: {
      id: `belief-position-${Date.now()}`,
      market_id: matchedMarket.id,
      direction: result.direction || 'ABSTAIN',
      conviction: result.adjusted_conviction || belief.actual_confidence,
      size_recommendation: result.adjusted_conviction > 0.7 ? 'MEDIUM' : 
                          result.adjusted_conviction > 0.5 ? 'SMALL' : 'SKIP',
      thesis: `Derived from personal belief: "${belief.statement}"`,
      primary_evidence: [`Personal conviction: ${belief.statement}`],
      adversarial_challenge: [
        `Confidence gap: Expressed ${Math.round(belief.confidence_expressed * 100)}% vs Actual ${Math.round(belief.actual_confidence * 100)}%`,
        "Based on personal belief, not systematic analysis",
      ],
      entry_price_target: matchedMarket.current_price,
      exit_price_target: result.direction === 'YES' ? 0.9 : 0.1,
      time_horizon: "Until resolution",
      edge_source: 'PSYCHOLOGY',
      confidence_calibration: 0.5,
    },
    transformation: result.transformation_explanation || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTOR MIND STATE - Generate current state of the prediction mind
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePredictorMindState(
  positions: MarketPosition[],
  recentAnalyses: AdversarialAnalysis[],
  journalAnalysis?: JournalAnalysis
): Promise<PredictorMindState> {
  
  const positionsSummary = positions.map(p => 
    `${p.direction} on "${p.thesis}" at ${Math.round(p.conviction * 100)}% conviction`
  ).join("; ");

  const biasesSummary = recentAnalyses.flatMap(a => a.biases_detected)
    .map(b => `${b.bias_type}: ${b.description}`)
    .join("; ");

  const emotionalContext = journalAnalysis ? 
    `Current emotional state from journal: ${journalAnalysis.dominant_emotions.join(", ")}` : 
    "No emotional context available";

  const prompt = `
Generate the current state of the predictor mind:

Active Positions: ${positionsSummary || "None"}
Recent Biases Detected: ${biasesSummary || "None identified"}
Emotional Context: ${emotionalContext}

Generate a self-aware mind state that includes:
1. Current thesis (what do I believe about the world?)
2. Confidence level
3. Blind spots (what am I probably missing?)
4. Market model (what does the market believe?)
5. Contrarian view (why might the market be wrong?)
6. Best argument against me
7. What would change my mind
8. Rationality check (am I being rational?)
9. Emotional contamination level (0-1)

Return as JSON matching PredictorMindState structure.
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
    my_thesis: result.my_thesis || "No clear thesis formed",
    my_confidence: result.my_confidence || 0.5,
    my_blind_spots: result.my_blind_spots || [],
    what_market_believes: result.what_market_believes || "",
    why_market_might_be_wrong: result.why_market_might_be_wrong || "",
    what_market_is_missing: result.what_market_is_missing || "",
    best_argument_against_me: result.best_argument_against_me || "",
    what_would_change_my_mind: result.what_would_change_my_mind || "",
    am_i_being_rational: result.am_i_being_rational ?? true,
    emotional_contamination: result.emotional_contamination || 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO VIEW - Analyze all positions together
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzePortfolio(
  positions: MarketPosition[],
  markets: Map<string, PredictionMarket>
): Promise<{
  total_expected_value: number;
  correlation_risks: string[];
  concentration_warnings: string[];
  hedging_opportunities: string[];
  overall_confidence: number;
  recommendation: string;
}> {
  
  const positionsWithMarkets = positions.map(p => ({
    ...p,
    market: markets.get(p.market_id),
  }));

  const prompt = `
Analyze this prediction market portfolio:

${positionsWithMarkets.map(p => `
Position: ${p.direction} on "${p.market?.question || 'Unknown'}"
Current Price: ${p.market ? Math.round(p.market.current_price * 100) : '?'}%
Our Target: ${p.direction === 'YES' ? Math.round(p.exit_price_target * 100) : Math.round((1 - p.exit_price_target) * 100)}%
Conviction: ${Math.round(p.conviction * 100)}%
Size: ${p.size_recommendation}
Edge: ${p.edge_source}
`).join("\n---\n")}

Analyze:
1. Expected value across the portfolio
2. Correlation risks (positions that might all fail together)
3. Concentration risks (too much in one area)
4. Hedging opportunities
5. Overall portfolio confidence
6. Overall recommendation

Return JSON with: total_expected_value, correlation_risks, concentration_warnings, hedging_opportunities, overall_confidence, recommendation
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
    total_expected_value: result.total_expected_value || 0,
    correlation_risks: result.correlation_risks || [],
    concentration_warnings: result.concentration_warnings || [],
    hedging_opportunities: result.hedging_opportunities || [],
    overall_confidence: result.overall_confidence || 0.5,
    recommendation: result.recommendation || "Review individual positions",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK CONVICTION CHECK - Fast sanity check on any belief
// ─────────────────────────────────────────────────────────────────────────────

export async function quickConvictionCheck(
  belief: string,
  statedConfidence: number
): Promise<{
  adjusted_confidence: number;
  reasoning: string;
  red_flags: string[];
  green_flags: string[];
}> {
  const prompt = `
Quick conviction check on this belief:

"${belief}"
Stated Confidence: ${Math.round(statedConfidence * 100)}%

Analyze:
1. Is the stated confidence reasonable given the claim?
2. What red flags suggest overconfidence?
3. What green flags suggest this might be a good belief?
4. What should the adjusted confidence be?

Return JSON: adjusted_confidence (0-1), reasoning, red_flags[], green_flags[]
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
    adjusted_confidence: result.adjusted_confidence || statedConfidence,
    reasoning: result.reasoning || "",
    red_flags: result.red_flags || [],
    green_flags: result.green_flags || [],
  };
}
