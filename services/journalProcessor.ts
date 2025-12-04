import { GoogleGenAI, Type } from "@google/genai";
import {
  JournalEntry,
  JournalAnalysis,
  Insight,
  NarrativeThread,
  BeliefStatement,
  HookMoment,
  MarketSignal,
  ContrarianIndicator,
  SentimentShift,
  EmotionalMarker,
  Emotion,
  DefenseMechanism,
  CognitivePattern,
  VisualHighlight,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// JOURNAL PROCESSOR - Extracting Signal from Personal Narrative
// ═══════════════════════════════════════════════════════════════════════════
// "The unexamined life is not worth living." — Socrates
// "The examined life generates alpha." — This System
// ═══════════════════════════════════════════════════════════════════════════

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL ANALYSIS SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const JOURNAL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    // Key insights
    key_insights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The insight itself" },
          insight_type: { 
            type: Type.STRING, 
            enum: ["PERSONAL_GROWTH", "MARKET_OBSERVATION", "SOCIAL_TREND", "PREDICTION", "LESSON_LEARNED", "QUESTION"]
          },
          confidence: { type: Type.NUMBER, description: "0-1 confidence in this insight" },
          novelty: { type: Type.NUMBER, description: "0-1 how unique/new is this insight" },
          actionability: { type: Type.NUMBER, description: "0-1 how actionable is this" },
        },
        required: ["content", "insight_type", "confidence"],
      },
    },
    
    // Narrative threads
    narrative_threads: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING, description: "The core theme of this narrative thread" },
          story_arc: { 
            type: Type.STRING, 
            enum: ["STRUGGLE", "VICTORY", "LEARNING", "QUESTION", "TRANSFORMATION", "WARNING"]
          },
          key_moments: { type: Type.ARRAY, items: { type: Type.STRING } },
          emotional_journey: { type: Type.ARRAY, items: { type: Type.STRING } },
          resolution: { type: Type.STRING },
          content_potential: { type: Type.NUMBER, description: "0-1 potential for engaging content" },
        },
        required: ["theme", "story_arc", "content_potential"],
      },
    },
    
    // Belief statements
    belief_statements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          statement: { type: Type.STRING, description: "The belief being expressed" },
          belief_type: { 
            type: Type.STRING, 
            enum: ["ABOUT_SELF", "ABOUT_WORLD", "ABOUT_MARKETS", "ABOUT_OTHERS", "ABOUT_FUTURE"]
          },
          confidence_expressed: { type: Type.NUMBER, description: "0-1 how confident they sound" },
          actual_confidence: { type: Type.NUMBER, description: "0-1 detected actual confidence" },
          testable: { type: Type.BOOLEAN, description: "Can this become a prediction?" },
          market_relevant: { type: Type.BOOLEAN, description: "Is this relevant to markets?" },
        },
        required: ["statement", "belief_type", "confidence_expressed"],
      },
    },
    
    // Psychological state
    dominant_emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
    defense_mechanisms_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
    cognitive_patterns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pattern_type: { type: Type.STRING },
          instance: { type: Type.STRING },
          frequency: { type: Type.NUMBER },
          impact: { type: Type.NUMBER },
        },
      },
    },
    
    // Content potential
    hook_moments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp: { type: Type.NUMBER, description: "Approximate timestamp in seconds" },
          hook_type: { 
            type: Type.STRING, 
            enum: ["SURPRISING_STATEMENT", "EMOTIONAL_PEAK", "QUESTION", "CONFLICT", "REVELATION", "HUMOR"]
          },
          content: { type: Type.STRING, description: "The hook content" },
          attention_score: { type: Type.NUMBER, description: "0-1 attention-grabbing potential" },
          controversy_risk: { type: Type.NUMBER, description: "0-1 controversy potential" },
        },
        required: ["hook_type", "content", "attention_score"],
      },
    },
    shareable_quotes: { type: Type.ARRAY, items: { type: Type.STRING } },
    
    // Market signals
    market_signals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          signal_type: { 
            type: Type.STRING, 
            enum: ["SENTIMENT", "BEHAVIORAL", "NARRATIVE", "CONTRARIAN", "MOMENTUM", "STRUCTURAL"]
          },
          observation: { type: Type.STRING },
          interpretation: { type: Type.STRING },
          signal_strength: { type: Type.NUMBER },
          time_sensitivity: { type: Type.STRING, enum: ["IMMEDIATE", "DAYS", "WEEKS", "MONTHS"] },
        },
        required: ["signal_type", "observation", "interpretation", "signal_strength"],
      },
    },
    
    // Contrarian indicators
    contrarian_indicators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          popular_belief: { type: Type.STRING },
          contrarian_thesis: { type: Type.STRING },
          evidence_for_contrarian: { type: Type.ARRAY, items: { type: Type.STRING } },
          crowd_confidence: { type: Type.NUMBER },
          contrarian_edge: { type: Type.NUMBER },
          risk_if_wrong: { type: Type.STRING },
        },
        required: ["popular_belief", "contrarian_thesis"],
      },
    },
    
    // Sentiment shifts
    sentiment_shifts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          from_sentiment: { type: Type.STRING },
          to_sentiment: { type: Type.STRING },
          shift_magnitude: { type: Type.NUMBER },
          market_relevance: { type: Type.STRING },
        },
      },
    },
  },
  required: ["key_insights", "narrative_threads", "dominant_emotions", "hook_moments"],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeJournalEntry(
  entry: JournalEntry,
  userContext?: {
    previous_beliefs?: string[];
    market_interests?: string[];
    content_goals?: string[];
    psychological_profile?: string;
  }
): Promise<JournalAnalysis> {
  const prompt = `
You are an advanced cognitive analysis system that extracts multi-dimensional value from personal journal entries.
Your task is to analyze this journal entry across THREE dimensions:

1. PSYCHOLOGICAL DEPTH: Understand the person's mental state, beliefs, defense mechanisms, and emotional patterns
2. CONTENT POTENTIAL: Identify moments, quotes, and narratives that could become engaging YouTube Shorts content
3. MARKET ALPHA: Extract signals, predictions, and contrarian indicators that could inform prediction market positions

═══════════════════════════════════════════════════════════════════════════════
JOURNAL ENTRY
═══════════════════════════════════════════════════════════════════════════════

Input Type: ${entry.input_type}
Time of Day: ${entry.time_of_day}
Duration: ${entry.duration_seconds || "Unknown"} seconds
Energy Level: ${Math.round((entry.energy_level || 0.5) * 100)}%

${entry.visual_context ? `Visual Context: ${entry.visual_context}` : ""}

TRANSCRIPT:
"""
${entry.spoken_content}
"""

${entry.tags?.length ? `Tags: ${entry.tags.join(", ")}` : ""}

═══════════════════════════════════════════════════════════════════════════════
USER CONTEXT
═══════════════════════════════════════════════════════════════════════════════

${userContext?.previous_beliefs?.length ? `
Previous Beliefs Expressed: ${userContext.previous_beliefs.join("; ")}
` : ""}

${userContext?.market_interests?.length ? `
Market Interests: ${userContext.market_interests.join(", ")}
` : ""}

${userContext?.content_goals?.length ? `
Content Goals: ${userContext.content_goals.join(", ")}
` : ""}

${userContext?.psychological_profile ? `
Psychological Profile: ${userContext.psychological_profile}
` : ""}

═══════════════════════════════════════════════════════════════════════════════
YOUR ANALYSIS TASK
═══════════════════════════════════════════════════════════════════════════════

Perform deep analysis on this journal entry. Extract:

1. KEY INSIGHTS
   - Personal growth realizations
   - Market observations (even indirect ones)
   - Predictions (explicit or implied)
   - Questions worth exploring
   - Lessons learned
   
2. NARRATIVE THREADS
   - What stories are being told?
   - What's the emotional arc?
   - What would make compelling content?
   
3. BELIEF STATEMENTS
   - What does this person believe?
   - How confident are they really (not just how confident they sound)?
   - Could any of these become testable predictions?
   
4. PSYCHOLOGICAL STATE
   - What emotions are dominant?
   - What defense mechanisms are at play?
   - What cognitive patterns are visible?
   
5. CONTENT POTENTIAL
   - What moments would hook viewers?
   - What quotes are shareable?
   - What's the viral potential?
   
6. MARKET SIGNALS
   - What does this reveal about sentiment?
   - What contrarian indicators emerge?
   - What behavioral patterns are tradeable?

Be analytical but not cold. This is a real person sharing real thoughts.
The goal is to help them create value from their authentic expression.

Important: Look for the GAP between what's said and what's meant. 
The subtext often contains more alpha than the text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: JOURNAL_ANALYSIS_SCHEMA,
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  // Transform the result into our typed structure
  const analysis: JournalAnalysis = {
    entry_id: entry.id,
    
    key_insights: (result.key_insights || []).map((i: any, idx: number) => ({
      id: `insight-${entry.id}-${idx}`,
      content: i.content,
      insight_type: i.insight_type,
      confidence: i.confidence || 0.5,
      novelty: i.novelty || 0.5,
      actionability: i.actionability || 0.5,
      source_timestamps: [],
    })),
    
    narrative_threads: (result.narrative_threads || []).map((t: any, idx: number) => ({
      id: `thread-${entry.id}-${idx}`,
      theme: t.theme,
      story_arc: t.story_arc,
      key_moments: t.key_moments || [],
      emotional_journey: t.emotional_journey || [],
      resolution: t.resolution,
      content_potential: t.content_potential || 0.5,
    })),
    
    belief_statements: (result.belief_statements || []).map((b: any) => ({
      statement: b.statement,
      belief_type: b.belief_type,
      confidence_expressed: b.confidence_expressed || 0.5,
      actual_confidence: b.actual_confidence || b.confidence_expressed || 0.5,
      testable: b.testable || false,
      market_relevant: b.market_relevant || false,
    })),
    
    dominant_emotions: result.dominant_emotions || [],
    defense_mechanisms_detected: result.defense_mechanisms_detected || [],
    cognitive_patterns: (result.cognitive_patterns || []).map((p: any) => ({
      pattern_type: p.pattern_type,
      instance: p.instance,
      frequency: p.frequency || 0.5,
      impact: p.impact || 0.5,
    })),
    
    hook_moments: (result.hook_moments || []).map((h: any) => ({
      timestamp: h.timestamp || 0,
      hook_type: h.hook_type,
      content: h.content,
      attention_score: h.attention_score || 0.5,
      controversy_risk: h.controversy_risk || 0,
    })),
    
    shareable_quotes: result.shareable_quotes || [],
    visual_highlights: [],
    
    market_signals: (result.market_signals || []).map((s: any, idx: number) => ({
      id: `signal-${entry.id}-${idx}`,
      signal_type: s.signal_type,
      source: 'JOURNAL' as const,
      observation: s.observation,
      interpretation: s.interpretation,
      signal_strength: s.signal_strength || 0.5,
      noise_ratio: 1 - (s.signal_strength || 0.5),
      time_sensitivity: s.time_sensitivity || 'WEEKS',
      first_person_confidence: 0.5,
      meta_confidence: 0.5,
    })),
    
    contrarian_indicators: (result.contrarian_indicators || []).map((c: any) => ({
      popular_belief: c.popular_belief,
      contrarian_thesis: c.contrarian_thesis,
      evidence_for_contrarian: c.evidence_for_contrarian || [],
      crowd_confidence: c.crowd_confidence || 0.5,
      contrarian_edge: c.contrarian_edge || 0.3,
      risk_if_wrong: c.risk_if_wrong || "Unknown",
    })),
    
    sentiment_shift: (result.sentiment_shifts || []).map((s: any) => ({
      from_sentiment: s.from_sentiment,
      to_sentiment: s.to_sentiment,
      shift_magnitude: s.shift_magnitude || 0.5,
      market_relevance: s.market_relevance || "",
    })),
  };
  
  return analysis;
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH ANALYSIS - Analyze multiple entries for patterns
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeJournalBatch(
  entries: JournalEntry[],
  lookForPatterns: boolean = true
): Promise<{
  individual_analyses: JournalAnalysis[];
  cross_entry_patterns: CrossEntryPattern[];
  evolution: BeliefEvolution[];
}> {
  // Analyze each entry
  const individual_analyses = await Promise.all(
    entries.map(entry => analyzeJournalEntry(entry))
  );
  
  if (!lookForPatterns || entries.length < 2) {
    return {
      individual_analyses,
      cross_entry_patterns: [],
      evolution: [],
    };
  }
  
  // Look for cross-entry patterns
  const patternsPrompt = `
Analyze these journal entry analyses for patterns across time:

${individual_analyses.map((a, i) => `
Entry ${i + 1} (${entries[i].time_of_day}):
- Dominant emotions: ${a.dominant_emotions.join(", ")}
- Key beliefs: ${a.belief_statements.map(b => b.statement).join("; ")}
- Market signals: ${a.market_signals.map(s => s.observation).join("; ")}
`).join("\n")}

Identify:
1. Recurring themes across entries
2. Belief evolution (what's changing?)
3. Emotional patterns
4. Strengthening or weakening convictions
5. Emerging narratives

Return as JSON with cross_entry_patterns and belief_evolution arrays.
`;

  const patternsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: patternsPrompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const patterns = JSON.parse(patternsResponse.text || "{}");
  
  return {
    individual_analyses,
    cross_entry_patterns: patterns.cross_entry_patterns || [],
    evolution: patterns.belief_evolution || [],
  };
}

export interface CrossEntryPattern {
  pattern_type: 'RECURRING_THEME' | 'EMOTIONAL_CYCLE' | 'BELIEF_SHIFT' | 'NARRATIVE_ARC';
  description: string;
  entries_involved: string[];
  significance: number;
  content_potential: number;
  market_relevance: number;
}

export interface BeliefEvolution {
  belief: string;
  starting_confidence: number;
  current_confidence: number;
  direction: 'STRENGTHENING' | 'WEAKENING' | 'STABLE' | 'VOLATILE';
  triggers: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSCRIPT GENERATION (for audio/video inputs)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateTranscriptFromText(
  rawText: string,
  cleanUp: boolean = true
): Promise<{
  cleaned_transcript: string;
  detected_emotions: EmotionalMarker[];
  detected_speakers: string[];
}> {
  if (!cleanUp) {
    return {
      cleaned_transcript: rawText,
      detected_emotions: [],
      detected_speakers: ["SPEAKER_1"],
    };
  }

  const cleanupPrompt = `
Clean up this raw transcript/journal text while preserving the authentic voice:
- Fix obvious speech-to-text errors
- Add punctuation
- Identify emotional shifts with timestamps (approximate)
- Preserve filler words that convey meaning (like, um, you know) but remove excessive ones

Original text:
"""
${rawText}
"""

Return JSON with:
- cleaned_transcript: The cleaned version
- emotional_markers: Array of {timestamp_offset, emotion, intensity, trigger, authenticity}
- speakers: Array of detected speaker identifiers
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: cleanupPrompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    cleaned_transcript: result.cleaned_transcript || rawText,
    detected_emotions: result.emotional_markers || [],
    detected_speakers: result.speakers || ["SPEAKER_1"],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK SIGNAL EXTRACTION - Fast path for market signals only
// ─────────────────────────────────────────────────────────────────────────────

export async function extractMarketSignalsQuick(
  text: string,
  marketContext?: string[]
): Promise<MarketSignal[]> {
  const prompt = `
Extract market-relevant signals from this personal reflection:

"""
${text}
"""

${marketContext?.length ? `Context - Markets of interest: ${marketContext.join(", ")}` : ""}

Look for:
1. Sentiment about economy, markets, specific assets
2. Behavioral indicators (what the person is doing with money, time, attention)
3. Narrative shifts (changing beliefs about future)
4. Contrarian signals (what crowds believe that this person doubts)
5. First-person confidence levels (how sure are they?)

Return array of signals with: signal_type, observation, interpretation, signal_strength (0-1), time_sensitivity
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.5,
    },
  });

  const result = JSON.parse(response.text || "[]");
  
  return (Array.isArray(result) ? result : result.signals || []).map((s: any, idx: number) => ({
    id: `quick-signal-${Date.now()}-${idx}`,
    signal_type: s.signal_type || 'SENTIMENT',
    source: 'JOURNAL' as const,
    observation: s.observation || "",
    interpretation: s.interpretation || "",
    signal_strength: s.signal_strength || 0.5,
    noise_ratio: 1 - (s.signal_strength || 0.5),
    time_sensitivity: s.time_sensitivity || 'WEEKS',
    first_person_confidence: 0.5,
    meta_confidence: 0.5,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Create journal entry from raw input
// ─────────────────────────────────────────────────────────────────────────────

export function createJournalEntry(
  content: string,
  options: {
    input_type?: JournalEntry['input_type'];
    tags?: string[];
    content_permission?: JournalEntry['content_permission'];
    duration_seconds?: number;
  } = {}
): JournalEntry {
  const now = new Date();
  const hour = now.getHours();
  
  let time_of_day: JournalEntry['time_of_day'];
  if (hour >= 5 && hour < 12) time_of_day = 'MORNING';
  else if (hour >= 12 && hour < 17) time_of_day = 'AFTERNOON';
  else if (hour >= 17 && hour < 21) time_of_day = 'EVENING';
  else time_of_day = 'NIGHT';

  return {
    id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    input_type: options.input_type || 'TEXT',
    spoken_content: content,
    emotional_markers: [],
    time_of_day,
    energy_level: 0.5,
    tags: options.tags,
    content_permission: options.content_permission || 'FULL',
    duration_seconds: options.duration_seconds,
  };
}
