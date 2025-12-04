import { GoogleGenAI, Type } from "@google/genai";
import {
  JournalAnalysis,
  ContentBrief,
  ContentScript,
  HookStrategy,
  NarrativeStructure,
  ContentBeat,
  VisualDirection,
  TextOverlay,
  EngagementPrediction,
  AudienceProfile,
  PlatformSpec,
  ContentArchetype,
  HookMoment,
  NarrativeThread,
  Emotion,
  CreatorMindState,
  UserPersona,
  MarketPosition,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT FORGE - Transforming Personal Truth into Engaging Content
// ═══════════════════════════════════════════════════════════════════════════
// "The artist's job is not to succumb to despair but to find an antidote 
// for the emptiness of existence." — Gertrude Stein
//
// "Your story, properly told, is someone else's survival guide." — Unknown
//
// This system transforms raw journal insights into optimized short-form
// content while preserving authenticity and maximizing engagement.
// ═══════════════════════════════════════════════════════════════════════════

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT ARCHETYPE STRATEGIES
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPE_STRATEGIES: Record<ContentArchetype, string> = {
  STORYTELLER: `As a STORYTELLER, transform this insight into a narrative journey.
                Begin in medias res. Create tension. Use vivid details.
                Make the viewer FEEL, not just understand.
                Structure: Hook → Conflict → Journey → Revelation → Resolution`,

  TEACHER: `As a TEACHER, extract the lesson and make it memorable.
            Lead with the value proposition. What will they LEARN?
            Use the Feynman technique: explain simply, use analogies.
            Structure: Promise → Problem → Process → Payoff`,

  ENTERTAINER: `As an ENTERTAINER, make this content impossible to scroll past.
                Energy is everything. Pacing is key. Surprise them.
                If it doesn't spark emotion, it doesn't work.
                Structure: Pattern Interrupt → Escalation → Peak → Callback`,

  PROVOCATEUR: `As a PROVOCATEUR, challenge their assumptions.
                Make them uncomfortable (but in a valuable way).
                Ask questions they haven't considered.
                Structure: Controversial Hook → Evidence → Reframe → Challenge`,

  CURATOR: `As a CURATOR, select the most valuable moment and frame it perfectly.
            Less is more. Context is everything.
            What's the ONE thing they should take away?
            Structure: Context → Highlight → Significance → Action`,

  CONFESSIONALIST: `As a CONFESSIONALIST, lead with radical vulnerability.
                    Share what others are afraid to admit.
                    Authenticity > polish. Connection > perfection.
                    Structure: Admission → Context → Journey → Insight`,

  ANALYST: `As an ANALYST, break down complexity into clarity.
            Numbers tell stories. Patterns reveal truth.
            Make the abstract concrete.
            Structure: Question → Data → Analysis → Conclusion`,

  VISIONARY: `As a VISIONARY, paint a picture of what could be.
              Connect the present moment to a larger future.
              Inspire action through possibility.
              Structure: Current State → Insight → Vision → Call`,
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GENERATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT_SCRIPT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    full_script: { type: Type.STRING, description: "The complete spoken script" },
    spoken_word_count: { type: Type.NUMBER },
    reading_time_seconds: { type: Type.NUMBER },
    
    hook_segment: { type: Type.STRING, description: "The opening hook (first 3 seconds)" },
    body_segments: { type: Type.ARRAY, items: { type: Type.STRING } },
    close_segment: { type: Type.STRING, description: "The closing CTA" },
    
    pattern_interrupts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Moments to re-grab attention" },
    engagement_questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Questions for comments" },
    shareable_quotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Quotable moments" },
    
    // Visual direction
    visual_style: { type: Type.STRING, enum: ["TALKING_HEAD", "B_ROLL", "SCREEN_SHARE", "TEXT_OVERLAY", "MIXED"] },
    key_visual_moments: { type: Type.ARRAY, items: { type: Type.STRING } },
    text_overlays: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timestamp_approx: { type: Type.NUMBER },
          text: { type: Type.STRING },
          style: { type: Type.STRING },
        },
      },
    },
    
    // Engagement prediction
    hook_strength: { type: Type.NUMBER, description: "0-1 how strong is the hook" },
    retention_prediction: { type: Type.NUMBER, description: "0-1 predicted completion rate" },
    viral_potential: { type: Type.NUMBER, description: "0-1 shareability" },
    controversy_level: { type: Type.NUMBER, description: "0-1 controversy risk" },
  },
  required: ["full_script", "hook_segment", "body_segments", "close_segment"],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTENT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

export async function generateContentBrief(
  journalAnalysis: JournalAnalysis,
  options: {
    archetype: ContentArchetype;
    platform: PlatformSpec['platform'];
    targetDuration: number;
    audienceProfile?: Partial<AudienceProfile>;
    persona?: UserPersona;
    includeMarketContent?: boolean;
    marketPosition?: MarketPosition;
  }
): Promise<ContentBrief> {
  
  // Find the best narrative thread for content
  const bestThread = journalAnalysis.narrative_threads
    .sort((a, b) => b.content_potential - a.content_potential)[0];
  
  // Get the best hooks
  const bestHooks = journalAnalysis.hook_moments
    .sort((a, b) => b.attention_score - a.attention_score)
    .slice(0, 3);

  // Build the context
  const insightsContext = journalAnalysis.key_insights
    .map(i => `[${i.insight_type}] ${i.content} (confidence: ${Math.round(i.confidence * 100)}%)`)
    .join("\n");

  const marketContext = options.includeMarketContent && options.marketPosition ? `
Market Position Context (optional inclusion):
- Thesis: ${options.marketPosition.thesis}
- Direction: ${options.marketPosition.direction}
- Conviction: ${Math.round(options.marketPosition.conviction * 100)}%
Note: Any market-related content requires appropriate disclaimers.
` : "";

  const personaContext = options.persona ? `
Creator Persona:
- Archetype: ${options.persona.creator_archetype}
- Tone: ${options.persona.tone}
- Vocabulary: ${options.persona.vocabulary_level}
- Content Pillars: ${options.persona.content_pillars.join(", ")}
- Never say: ${options.persona.never_say?.join(", ") || "None specified"}
- Always include: ${options.persona.always_include?.join(", ") || "None specified"}
` : "";

  const prompt = `
═══════════════════════════════════════════════════════════════════════════════
CONTENT FORGE - Generate YouTube Short Script
═══════════════════════════════════════════════════════════════════════════════

${ARCHETYPE_STRATEGIES[options.archetype]}

═══════════════════════════════════════════════════════════════════════════════
SOURCE MATERIAL (from personal journal)
═══════════════════════════════════════════════════════════════════════════════

KEY INSIGHTS:
${insightsContext}

BEST NARRATIVE THREAD:
Theme: ${bestThread?.theme || "General reflection"}
Arc: ${bestThread?.story_arc || "LEARNING"}
Key Moments: ${bestThread?.key_moments?.join(" → ") || "N/A"}
Emotional Journey: ${bestThread?.emotional_journey?.join(" → ") || "N/A"}
Resolution: ${bestThread?.resolution || "N/A"}

BEST HOOKS IDENTIFIED:
${bestHooks.map(h => `- [${h.hook_type}] "${h.content}" (attention: ${Math.round(h.attention_score * 100)}%)`).join("\n")}

SHAREABLE QUOTES:
${journalAnalysis.shareable_quotes.map(q => `- "${q}"`).join("\n")}

PSYCHOLOGICAL STATE:
- Dominant emotions: ${journalAnalysis.dominant_emotions.join(", ")}
- Defense mechanisms active: ${journalAnalysis.defense_mechanisms_detected.join(", ")}

${marketContext}

═══════════════════════════════════════════════════════════════════════════════
CONTENT PARAMETERS
═══════════════════════════════════════════════════════════════════════════════

Platform: ${options.platform}
Target Duration: ${options.targetDuration} seconds
Archetype: ${options.archetype}

Audience Profile:
- Primary demo: ${options.audienceProfile?.primary_demographic || "General"}
- Interests: ${options.audienceProfile?.interests?.join(", ") || "Various"}
- Pain points: ${options.audienceProfile?.pain_points?.join(", ") || "Various"}
- Attention span: ${options.audienceProfile?.attention_span || "SHORT"}

${personaContext}

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

Generate a complete content script optimized for ${options.platform}.

Requirements:
1. HOOK (First 1-3 seconds): Must stop the scroll. Pattern interrupt or emotional hit.
2. BODY: Deliver value. Keep energy. Include pattern interrupts every 5-7 seconds.
3. CLOSE: Clear CTA. Leave them wanting more.

Script Guidelines:
- Write for SPOKEN delivery (contractions, natural rhythm)
- ${options.targetDuration} seconds = ~${Math.round(options.targetDuration * 2.5)} words
- Include pauses [PAUSE] where impactful
- Include emphasis [EMPHASIS] on key words
- Note visual directions in [VISUAL: description]

Authenticity Check:
- This content comes from real journal entries
- Preserve the genuine voice and insight
- Don't over-polish into inauthenticity
- The gap between raw truth and engaging content should be minimal

Generate the complete script with all elements.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: CONTENT_SCRIPT_SCHEMA,
      temperature: 0.8,
    },
  });

  const result = JSON.parse(response.text || "{}");

  // Build the content brief
  const script: ContentScript = {
    full_script: result.full_script || "",
    spoken_word_count: result.spoken_word_count || result.full_script?.split(/\s+/).length || 0,
    reading_time_seconds: result.reading_time_seconds || options.targetDuration,
    hook_segment: result.hook_segment || "",
    body_segments: result.body_segments || [],
    close_segment: result.close_segment || "",
    pattern_interrupts: result.pattern_interrupts || [],
    engagement_questions: result.engagement_questions || [],
    shareable_quotes: result.shareable_quotes || journalAnalysis.shareable_quotes,
  };

  const visualDirection: VisualDirection = {
    primary_style: result.visual_style || 'TALKING_HEAD',
    transitions: [],
    text_overlays: (result.text_overlays || []).map((t: any) => ({
      timestamp: t.timestamp_approx || 0,
      duration: 2,
      text: t.text,
      style: t.style || 'CALLOUT',
      position: 'CENTER' as const,
    })),
    suggested_cuts: [],
    color_mood: journalAnalysis.dominant_emotions[0] || 'NEUTRAL',
    energy_level: result.hook_strength > 0.7 ? 'HIGH' : 'MEDIUM',
  };

  const brief: ContentBrief = {
    id: `brief-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source_entries: [journalAnalysis.entry_id],
    
    target_archetype: options.archetype,
    hook_strategy: {
      primary_hook: result.hook_segment || bestHooks[0]?.content || "",
      hook_type: bestHooks[0]?.hook_type === 'QUESTION' ? 'QUESTION' : 'BOLD_CLAIM',
      retention_hooks: result.pattern_interrupts || [],
      cta_hook: result.close_segment || "",
    },
    narrative_structure: {
      format: options.archetype === 'STORYTELLER' ? 'STORY' : 
              options.archetype === 'TEACHER' ? 'LESSON' :
              options.archetype === 'ANALYST' ? 'BREAKDOWN' : 'STORY',
      beats: (result.body_segments || []).map((seg: string, i: number) => ({
        beat_number: i + 1,
        content: seg,
        duration_seconds: options.targetDuration / (result.body_segments?.length || 3),
        visual_direction: "",
        emotional_target: journalAnalysis.dominant_emotions[0] || 'ANTICIPATION',
        purpose: i === 0 ? 'CONTEXT' : i === (result.body_segments?.length || 1) - 1 ? 'RESOLUTION' : 'ESCALATION',
      })),
      emotional_arc: journalAnalysis.dominant_emotions as Emotion[],
      pacing: options.targetDuration < 30 ? 'FAST' : 'MEDIUM',
      duration_target: options.targetDuration,
    },
    
    target_emotion: journalAnalysis.dominant_emotions[0] as Emotion || 'ANTICIPATION',
    target_audience: {
      primary_demographic: options.audienceProfile?.primary_demographic || "General audience",
      interests: options.audienceProfile?.interests || [],
      pain_points: options.audienceProfile?.pain_points || [],
      content_preferences: options.audienceProfile?.content_preferences || [],
      attention_span: options.audienceProfile?.attention_span || 'SHORT',
    },
    platform_optimization: {
      platform: options.platform,
      optimal_duration: options.targetDuration,
      aspect_ratio: '9:16',
      hashtag_strategy: [],
    },
    
    script,
    visual_direction: visualDirection,
    
    predicted_engagement: {
      predicted_view_rate: result.hook_strength || 0.5,
      predicted_completion_rate: result.retention_prediction || 0.4,
      predicted_engagement_rate: (result.hook_strength + result.retention_prediction) / 4 || 0.3,
      viral_potential: result.viral_potential || 0.2,
      controversy_score: result.controversy_level || 0.1,
      confidence_interval: [0.2, 0.6],
    },
  };

  return brief;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK OPTIMIZER - Generate multiple hook variants
// ─────────────────────────────────────────────────────────────────────────────

export async function generateHookVariants(
  insight: string,
  count: number = 5
): Promise<{
  variants: Array<{
    hook: string;
    type: HookStrategy['hook_type'];
    predicted_score: number;
    rationale: string;
  }>;
}> {
  const prompt = `
Generate ${count} different hook variants for this insight:

"${insight}"

Create hooks of different types:
1. QUESTION - Make them curious
2. BOLD_CLAIM - Provoke their worldview  
3. STORY_OPENING - Draw them into a narrative
4. PATTERN_INTERRUPT - Break their scroll trance
5. EMOTIONAL_HIT - Strike an emotion immediately

For each hook:
- Keep it under 10 words for initial impact
- Consider the 3-second rule
- Optimize for stopping the scroll

Return as JSON array with: hook, type, predicted_score (0-1), rationale
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return {
    variants: (Array.isArray(result) ? result : result.variants || []).map((v: any) => ({
      hook: v.hook || "",
      type: v.type || 'BOLD_CLAIM',
      predicted_score: v.predicted_score || 0.5,
      rationale: v.rationale || "",
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPT REFINEMENT - Polish existing script
// ─────────────────────────────────────────────────────────────────────────────

export async function refineScript(
  script: ContentScript,
  feedback: string,
  preserveElements: string[] = []
): Promise<ContentScript> {
  const prompt = `
Refine this content script based on feedback:

CURRENT SCRIPT:
"""
${script.full_script}
"""

FEEDBACK:
${feedback}

PRESERVE THESE ELEMENTS:
${preserveElements.map(e => `- ${e}`).join("\n") || "None specified - open to full revision"}

Refine the script while:
1. Addressing the feedback directly
2. Maintaining the core message and authenticity
3. Keeping the duration similar
4. Improving engagement potential

Return the complete refined script with all elements.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: CONTENT_SCRIPT_SCHEMA,
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    full_script: result.full_script || script.full_script,
    spoken_word_count: result.spoken_word_count || script.spoken_word_count,
    reading_time_seconds: result.reading_time_seconds || script.reading_time_seconds,
    hook_segment: result.hook_segment || script.hook_segment,
    body_segments: result.body_segments || script.body_segments,
    close_segment: result.close_segment || script.close_segment,
    pattern_interrupts: result.pattern_interrupts || script.pattern_interrupts,
    engagement_questions: result.engagement_questions || script.engagement_questions,
    shareable_quotes: result.shareable_quotes || script.shareable_quotes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR MIND STATE - Self-awareness for content creation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateCreatorMindState(
  journalAnalysis: JournalAnalysis,
  contentBrief: ContentBrief
): Promise<CreatorMindState> {
  const prompt = `
Analyze the creator's mind state based on their journal and the content being created:

JOURNAL INSIGHTS:
- Dominant emotions: ${journalAnalysis.dominant_emotions.join(", ")}
- Key beliefs: ${journalAnalysis.belief_statements.map(b => b.statement).join("; ")}
- Defense mechanisms: ${journalAnalysis.defense_mechanisms_detected.join(", ")}

CONTENT BEING CREATED:
- Hook: "${contentBrief.script.hook_segment}"
- Core message: ${contentBrief.script.body_segments[0] || "Not specified"}
- Target emotion: ${contentBrief.target_emotion}

Analyze:
1. What's their authentic truth (what they really believe/feel)?
2. What's their performed truth (what the content expresses)?
3. How aware are they of the gap?
4. What does the audience want vs need?
5. Is this content authentic?
6. What's being sacrificed for authenticity vs engagement?

Return as JSON matching CreatorMindState structure.
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
    my_authentic_truth: result.my_authentic_truth || "",
    my_performed_truth: result.my_performed_truth || "",
    gap_awareness: result.gap_awareness || 0.5,
    what_audience_wants: result.what_audience_wants || "",
    what_audience_needs: result.what_audience_needs || "",
    what_will_engage: result.what_will_engage || "",
    am_i_being_authentic: result.am_i_being_authentic ?? true,
    authenticity_cost: result.authenticity_cost || "",
    performance_cost: result.performance_cost || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CALENDAR SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────

export async function suggestContentSeries(
  journalAnalyses: JournalAnalysis[],
  contentGoals: string[]
): Promise<{
  series_concept: string;
  episodes: Array<{
    title: string;
    hook: string;
    source_insights: string[];
    recommended_archetype: ContentArchetype;
  }>;
  posting_cadence: string;
  growth_strategy: string;
}> {
  const allInsights = journalAnalyses.flatMap(a => a.key_insights);
  const allThreads = journalAnalyses.flatMap(a => a.narrative_threads);

  const prompt = `
Suggest a content series based on these journal insights:

INSIGHTS:
${allInsights.slice(0, 10).map(i => `- [${i.insight_type}] ${i.content}`).join("\n")}

NARRATIVE THREADS:
${allThreads.slice(0, 5).map(t => `- ${t.theme} (${t.story_arc})`).join("\n")}

CONTENT GOALS:
${contentGoals.map(g => `- ${g}`).join("\n")}

Create a content series that:
1. Has a unifying concept/theme
2. Includes 5-7 episode ideas
3. Builds audience over time
4. Leverages the authentic insights

Return JSON with: series_concept, episodes[], posting_cadence, growth_strategy
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.8,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    series_concept: result.series_concept || "",
    episodes: (result.episodes || []).map((e: any) => ({
      title: e.title || "",
      hook: e.hook || "",
      source_insights: e.source_insights || [],
      recommended_archetype: e.recommended_archetype || 'STORYTELLER',
    })),
    posting_cadence: result.posting_cadence || "3x per week",
    growth_strategy: result.growth_strategy || "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICITY CHECKER - Ensure content stays true
// ─────────────────────────────────────────────────────────────────────────────

export async function checkAuthenticity(
  originalInsight: string,
  generatedContent: string
): Promise<{
  authenticity_score: number;
  preserved_elements: string[];
  lost_elements: string[];
  added_elements: string[];
  recommendation: 'PUBLISH' | 'REVISE' | 'RETHINK';
  revision_suggestions: string[];
}> {
  const prompt = `
Check if this generated content preserves the authenticity of the original insight:

ORIGINAL INSIGHT:
"${originalInsight}"

GENERATED CONTENT:
"${generatedContent}"

Analyze:
1. What's the authenticity score (0-1)?
2. What elements from the original were preserved?
3. What was lost in translation?
4. What was added that wasn't in the original?
5. Should this be published as-is, revised, or completely rethought?
6. If revising, what specific changes would help?

Return JSON with all fields.
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
    authenticity_score: result.authenticity_score || 0.5,
    preserved_elements: result.preserved_elements || [],
    lost_elements: result.lost_elements || [],
    added_elements: result.added_elements || [],
    recommendation: result.recommendation || 'REVISE',
    revision_suggestions: result.revision_suggestions || [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKET CONTENT GENERATOR - Create content about predictions
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMarketContent(
  position: MarketPosition,
  journalAnalysis: JournalAnalysis,
  disclosure: string = "This is not financial advice. I may have positions in the markets discussed."
): Promise<ContentScript> {
  const prompt = `
Generate content that shares a market prediction authentically:

POSITION:
- Market: ${position.thesis}
- Direction: ${position.direction}
- Conviction: ${Math.round(position.conviction * 100)}%
- Reasoning: ${position.primary_evidence.join("; ")}

PERSONAL CONTEXT (from journal):
- Emotions: ${journalAnalysis.dominant_emotions.join(", ")}
- Key belief: ${journalAnalysis.belief_statements[0]?.statement || "N/A"}

REQUIRED DISCLOSURE:
"${disclosure}"

Create content that:
1. Shares the thinking process, not just the conclusion
2. Acknowledges uncertainty and what could go wrong
3. Educates rather than promotes
4. Includes the required disclosure naturally
5. Is engaging while being responsible

Generate script for a 45-60 second video.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: CONTENT_SCRIPT_SCHEMA,
      temperature: 0.7,
    },
  });

  const result = JSON.parse(response.text || "{}");

  return {
    full_script: result.full_script || "",
    spoken_word_count: result.spoken_word_count || 0,
    reading_time_seconds: result.reading_time_seconds || 50,
    hook_segment: result.hook_segment || "",
    body_segments: result.body_segments || [],
    close_segment: result.close_segment || "",
    pattern_interrupts: result.pattern_interrupts || [],
    engagement_questions: result.engagement_questions || [],
    shareable_quotes: result.shareable_quotes || [],
  };
}
