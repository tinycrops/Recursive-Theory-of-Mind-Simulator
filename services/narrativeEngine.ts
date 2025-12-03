import { GoogleGenAI, Type } from "@google/genai";
import {
  Character,
  Scene,
  SceneBeat,
  NarrativeState,
  DeepTheoryOfMind,
  PrimaryArchetype,
  Emotion,
  DefenseMechanism,
  ProjectionEvent,
  BeliefChallenge,
  ShadowTouch,
  CharacterArc,
  ArcStage,
  NarrativeConfig,
  Message,
} from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// THE NARRATIVE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// "The privilege of a lifetime is to become who you truly are." — Carl Jung
//
// This engine generates narratives by simulating the psychological processes
// that make human drama compelling: theory of mind, archetypal patterns,
// projection, shadow work, and the eternal tension between persona and self.
// ═══════════════════════════════════════════════════════════════════════════

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// ARCHETYPAL PROMPTS - The Deep Patterns
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPE_DESCRIPTIONS: Record<PrimaryArchetype, string> = {
  HERO: `The HERO archetype: Driven by a need to prove worth through courageous action. 
         Core pattern: Separation → Initiation → Return. 
         Shadow: The tyrant, the bully, imposing will on others.
         Gift: Courage, determination, sacrifice for others.
         Wound often involves: Feeling inadequate, needing to prove themselves.`,
         
  SHADOW: `The SHADOW archetype: Represents the rejected, denied aspects of the psyche.
           Core pattern: That which is pushed down will rise up.
           Contains: Repressed desires, denied traits, the "dark twin."
           Function: Forces confrontation with what we refuse to see in ourselves.
           When projected: We hate in others what we can't accept in ourselves.`,
           
  MENTOR: `The MENTOR archetype: The wise guide who has walked the path before.
           Core pattern: Transmitting wisdom, giving gifts, then stepping back.
           Shadow: The false mentor who creates dependence, not growth.
           Gift: Knowledge, tools, belief in the student's potential.
           Often carries: Their own unfinished business, wounds from their journey.`,
           
  HERALD: `The HERALD archetype: The catalyst who announces change is coming.
           Core pattern: Disrupting stasis, issuing the call, creating the inciting incident.
           Shadow: The bearer of bad news who takes pleasure in disruption.
           Gift: Forcing necessary change, ending denial.
           Energy: Liminal, standing at thresholds, marking transitions.`,
           
  THRESHOLD_GUARDIAN: `The THRESHOLD GUARDIAN archetype: Tests readiness for transformation.
                        Core pattern: Blocking passage until the traveler proves worthy.
                        Shadow: The bully, the petty tyrant, the bureaucrat.
                        Gift: Ensuring only the prepared pass through.
                        Often represents: Our own fears and resistances externalized.`,
                        
  SHAPESHIFTER: `The SHAPESHIFTER archetype: The mercurial, the one whose loyalty is unclear.
                  Core pattern: Changing form, reflecting the beholder's projections.
                  Often represents: Anima/Animus - the contrasexual element of psyche.
                  Shadow: The deceiver, the one who cannot be trusted.
                  Gift: Flexibility, showing us our own projections.`,
                  
  TRICKSTER: `The TRICKSTER archetype: Chaos agent, rule-breaker, truth-speaker through mischief.
              Core pattern: Disrupting order to reveal deeper truths.
              Shadow: Cruelty disguised as humor, destruction without purpose.
              Gift: Puncturing pretension, exposing hypocrisy, fostering humility.
              Energy: Liminal, carnivalesque, inverting hierarchies.`,
              
  ALLY: `The ALLY archetype: The faithful companion, mirror to the hero's growth.
         Core pattern: Reflecting, supporting, sometimes challenging the protagonist.
         Shadow: The sidekick who enables rather than supports.
         Gift: Loyalty, grounding, reminding us who we really are.
         Often represents: An aspect of self we trust and rely upon.`,
         
  MOTHER: `The MOTHER archetype: The source of life, nurturing and devouring.
           Core pattern: Birth, sustenance, protection—and potential smothering.
           Shadow: The devouring mother, the one who consumes to keep.
           Gift: Unconditional love, safety, emotional grounding.
           Wound: Abandonment or engulfment by the mother.`,
           
  FATHER: `The FATHER archetype: Order, law, protection—and potential tyranny.
           Core pattern: Structure, discipline, initiating into the world.
           Shadow: The tyrant, the absent father, the one who crushes.
           Gift: Guidance, standards, belief in capability.
           Wound: Absence, harshness, or impossible standards.`,
           
  CHILD: `The CHILD archetype: Innocence, wonder, potential—and vulnerability.
          Core pattern: New beginnings, openness, the eternal becoming.
          Shadow: The eternal child who refuses to grow, the victim.
          Gift: Fresh perspective, playfulness, authentic emotion.
          Represents: The part of us still capable of genuine wonder.`,
          
  SELF: `The SELF archetype: Wholeness, integration, the goal of individuation.
         Core pattern: Unifying opposites, embracing all aspects of psyche.
         Shadow: Inflation, identifying ego with the totality.
         Gift: Centeredness, peace, authentic living.
         Represents: What we are becoming, not what we are.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFENSE MECHANISM BEHAVIORS
// ─────────────────────────────────────────────────────────────────────────────

const DEFENSE_BEHAVIORS: Record<DefenseMechanism, string> = {
  PROJECTION: "Attributes own unacceptable thoughts or feelings to others. Watch for accusations that reveal the accuser's own hidden traits.",
  DENIAL: "Refuses to accept reality. Speech may minimize, dismiss, or simply ignore threatening information.",
  RATIONALIZATION: "Creates logical-sounding explanations for emotionally-driven decisions. The logic is post-hoc justification.",
  DISPLACEMENT: "Redirects emotions from their true source to a safer target. Anger at boss becomes anger at spouse.",
  SUBLIMATION: "Channels unacceptable impulses into socially acceptable activities. Aggression becomes athletic competition.",
  REPRESSION: "Pushes threatening thoughts out of consciousness. Topics are avoided, memories are hazy or absent.",
  REACTION_FORMATION: "Expresses the opposite of true feelings. Excessive niceness may mask hostility.",
  REGRESSION: "Reverts to earlier, more childlike behaviors when stressed. Tantrums, dependency, magical thinking.",
  INTELLECTUALIZATION: "Detaches from emotional content through abstract analysis. Treats feelings as problems to solve.",
};

// ─────────────────────────────────────────────────────────────────────────────
// THEORY OF MIND GENERATION
// ─────────────────────────────────────────────────────────────────────────────

const THEORY_OF_MIND_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    my_conscious_state: { type: Type.STRING, description: "What I am currently aware of thinking and feeling" },
    my_hidden_motives: { type: Type.STRING, description: "What drives me that I don't show others" },
    my_blind_spots: { type: Type.STRING, description: "What I cannot see about myself that others might see" },
    
    their_apparent_goals: { type: Type.STRING, description: "What the other person seems to want on the surface" },
    their_suspected_secrets: { type: Type.STRING, description: "What I intuit they might be hiding" },
    their_perceived_emotions: { type: Type.STRING, description: "What emotions I read in them" },
    their_suspected_wounds: { type: Type.STRING, description: "What old pain I sense in them" },
    
    how_they_see_me: { type: Type.STRING, description: "How I believe they perceive me" },
    what_they_suspect_about_me: { type: Type.STRING, description: "What I fear they might guess about me" },
    their_emotional_reaction_to_me: { type: Type.STRING, description: "What emotions I evoke in them" },
    
    what_they_think_i_think_of_them: { type: Type.STRING, description: "Their model of my model of them" },
    
    am_i_projecting: { type: Type.STRING, description: "Am I seeing my own traits in them? Self-examination." },
    are_they_projecting: { type: Type.STRING, description: "Are they seeing their own issues in me?" },
    
    leverage_points: { type: Type.STRING, description: "How could I influence them if I wanted to?" },
    vulnerabilities_exposed: { type: Type.STRING, description: "What weaknesses have I revealed?" },
    trust_level: { type: Type.NUMBER, description: "0-1 scale of how much I trust them" },
    deception_detected: { type: Type.NUMBER, description: "0-1 confidence they are being deceptive" },
  },
  required: [
    "my_conscious_state", "my_hidden_motives", "their_apparent_goals",
    "their_perceived_emotions", "how_they_see_me", "trust_level"
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE BEAT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

const SCENE_BEAT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    action_type: { 
      type: Type.STRING, 
      enum: ["DIALOGUE", "ACTION", "INTERNAL", "REACTION"],
      description: "The type of beat" 
    },
    content: { type: Type.STRING, description: "The actual dialogue or action" },
    subtext: { type: Type.STRING, description: "What's really being communicated beneath the surface" },
    conscious_intent: { type: Type.STRING, description: "What the character thinks they're doing" },
    unconscious_driver: { type: Type.STRING, description: "The deeper psychological need being expressed" },
    perceived_as: { type: Type.STRING, description: "How others in the scene interpret this" },
    actual_effect: { type: Type.STRING, description: "What this actually accomplishes" },
    
    // Psychological events
    projection_occurring: { type: Type.BOOLEAN, description: "Is projection happening here?" },
    projection_detail: { type: Type.STRING, description: "If projecting, what trait and onto whom" },
    defense_mechanism: { type: Type.STRING, description: "What defense mechanism is active, if any" },
    shadow_activated: { type: Type.BOOLEAN, description: "Is shadow material being touched?" },
    shadow_detail: { type: Type.STRING, description: "What shadow content is emerging" },
    belief_challenged: { type: Type.BOOLEAN, description: "Is a core belief being challenged?" },
    belief_detail: { type: Type.STRING, description: "What belief and how" },
    
    // Emotional state update
    emotional_shift: { type: Type.STRING, description: "How does this change the character's emotional state" },
    new_primary_emotion: { type: Type.STRING, description: "The resulting primary emotion" },
    intensity: { type: Type.NUMBER, description: "Emotional intensity 0-1" },
  },
  required: ["action_type", "content", "subtext", "conscious_intent", "unconscious_driver"],
};

// ─────────────────────────────────────────────────────────────────────────────
// NARRATIVE GENERATION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function generateDeepTheoryOfMind(
  character: Character,
  otherCharacter: Character,
  context: string,
  recentEvents: string[]
): Promise<DeepTheoryOfMind> {
  const prompt = `
You are simulating the deep psychological theory of mind for ${character.name}.

=== ${character.name}'s PSYCHE ===
Core Wound: ${character.unconscious.core_wound}
Deepest Fear: ${character.unconscious.deepest_fear}
Deepest Desire: ${character.unconscious.deepest_desire}
Shadow Traits: ${character.unconscious.shadow_traits.join(", ")}
Defense Mechanisms: ${character.unconscious.defense_mechanisms.join(", ")}
Dominant Archetype: ${character.unconscious.dominant_archetype}
${ARCHETYPE_DESCRIPTIONS[character.unconscious.dominant_archetype]}

Core Beliefs: ${character.preconscious.core_beliefs.join("; ")}
Attachment Style: ${character.preconscious.attachment_style}

Current Emotional State: ${character.conscious.emotional_state.primary_emotion} (intensity: ${character.conscious.emotional_state.intensity})
Current Focus: ${character.conscious.current_focus}
Conscious Goals: ${character.conscious.conscious_goals.join("; ")}

Persona (Public Self): ${character.persona.public_identity}
Hidden from Others: ${character.persona.hidden_from_others.join("; ")}

=== ${otherCharacter.name} (as ${character.name} perceives them) ===
Their Archetype: ${otherCharacter.unconscious.dominant_archetype}
Their Public Identity: ${otherCharacter.persona.public_identity}

=== CONTEXT ===
${context}

=== RECENT EVENTS ===
${recentEvents.join("\n")}

=== YOUR TASK ===
Generate ${character.name}'s deep theory of mind about ${otherCharacter.name}.

This is not surface-level thinking. Go deep:
- What does ${character.name} REALLY think is going on?
- What do they sense about ${otherCharacter.name}'s hidden pain?
- What projections might ${character.name} be making (seeing their own shadow in the other)?
- What fears does this interaction touch?
- How does ${character.name}'s attachment style color their perception?

Remember: Characters are often WRONG about each other. Their models are distorted by their own psychology.
The interesting drama comes from these distortions.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: THEORY_OF_MIND_SCHEMA,
      temperature: 0.8,
    },
  });

  return JSON.parse(response.text || "{}") as DeepTheoryOfMind;
}

export async function generateSceneBeat(
  character: Character,
  scene: Scene,
  otherCharacters: Character[],
  previousBeats: SceneBeat[],
  narrativeState: NarrativeState
): Promise<{ beat: SceneBeat; psychologicalEvents: { projections: ProjectionEvent[]; beliefs: BeliefChallenge[]; shadows: ShadowTouch[] } }> {
  
  const otherDescriptions = otherCharacters.map(c => `
${c.name}:
- Archetype: ${c.unconscious.dominant_archetype}
- Apparent Goal: ${c.conscious.conscious_goals[0] || "Unknown"}
- Current Emotion: ${c.conscious.emotional_state.primary_emotion}
- Persona: ${c.persona.public_identity}
`).join("\n");

  const previousBeatsSummary = previousBeats.slice(-5).map(b => 
    `${b.character_id}: [${b.action_type}] "${b.content}" (subtext: ${b.subtext})`
  ).join("\n");

  const prompt = `
You are the psyche of ${character.name}, generating their next beat in this scene.

=== YOUR DEEP PSYCHOLOGY ===
Core Wound: ${character.unconscious.core_wound}
Deepest Fear: ${character.unconscious.deepest_fear}
Deepest Desire: ${character.unconscious.deepest_desire}
Shadow Traits (what you reject in yourself): ${character.unconscious.shadow_traits.join(", ")}
Active Defense Mechanisms: ${character.unconscious.defense_mechanisms.map(d => `${d}: ${DEFENSE_BEHAVIORS[d]}`).join("\n")}

Dominant Archetype: ${character.unconscious.dominant_archetype}
${ARCHETYPE_DESCRIPTIONS[character.unconscious.dominant_archetype]}

Core Beliefs: ${character.preconscious.core_beliefs.join("; ")}
Attachment Style: ${character.preconscious.attachment_style}

Current Emotions: ${character.conscious.emotional_state.primary_emotion} (intensity: ${character.conscious.emotional_state.intensity})
${character.conscious.emotional_state.suppressed_emotion ? `SUPPRESSED: ${character.conscious.emotional_state.suppressed_emotion}` : ""}

Persona: ${character.persona.public_identity}
Communication Style: ${character.persona.communication_style}
Speech Patterns: ${character.persona.speech_patterns.join("; ")}

=== CHARACTER ARC ===
Current Stage: ${character.character_arc.current_stage}
Lie Believed: ${character.character_arc.lie_believed}
Truth to Learn: ${character.character_arc.truth_to_learn}
Transformation Progress: ${Math.round(character.character_arc.transformation_progress * 100)}%

=== OTHERS IN SCENE ===
${otherDescriptions}

=== SCENE CONTEXT ===
Scene: ${scene.title}
Setting: ${scene.setting}
Scene Goal: ${scene.scene_goal}
Conflict: ${scene.conflict}
Stakes: ${scene.stakes}

=== PREVIOUS BEATS ===
${previousBeatsSummary || "Scene just began."}

=== NARRATIVE CONTEXT ===
Theme: ${narrativeState.theme}
Central Conflict: ${narrativeState.central_conflict}
Tension Level: ${Math.round(narrativeState.tension_level * 100)}%
Dramatic Question: ${narrativeState.dramatic_question}

=== YOUR TASK ===
Generate ${character.name}'s next beat. This could be dialogue, action, internal thought, or reaction.

Key principles:
1. SUBTEXT IS EVERYTHING: What they say/do is never the whole story. The gap between surface and depth creates drama.
2. DEFENSE MECHANISMS SHAPE BEHAVIOR: Their defenses distort their actions in characteristic ways.
3. PROJECTION CREATES CONFLICT: They may be seeing their own shadow in others.
4. THE WOUND DRIVES EVERYTHING: Their core wound colors every interaction.
5. ARCHETYPE PATTERNS: Their archetypal role shapes how they engage.
6. AUTHENTIC VOICE: Their speech patterns, their way of being.

Make this beat:
- TRUE to their psychology (not just plot-convenient)
- LAYERED with meaning (surface + subtext + unconscious)
- ADVANCING their arc (even if incrementally)
- CREATING or RELEASING tension appropriately
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: SCENE_BEAT_SCHEMA,
      temperature: 0.85,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  const beat: SceneBeat = {
    character_id: character.id,
    action_type: result.action_type,
    content: result.content,
    subtext: result.subtext,
    conscious_intent: result.conscious_intent,
    unconscious_driver: result.unconscious_driver,
    perceived_as: result.perceived_as || "",
    actual_effect: result.actual_effect || "",
  };

  const psychologicalEvents: { projections: ProjectionEvent[]; beliefs: BeliefChallenge[]; shadows: ShadowTouch[] } = {
    projections: [],
    beliefs: [],
    shadows: [],
  };

  if (result.projection_occurring && result.projection_detail) {
    psychologicalEvents.projections.push({
      projector_id: character.id,
      recipient_id: otherCharacters[0]?.id || "unknown",
      projected_trait: result.projection_detail,
      actual_owner: 'PROJECTOR', // Usually the projector owns it
      conscious_awareness: false,
      narrative_impact: "Creating conflict through misattribution",
    });
  }

  if (result.belief_challenged && result.belief_detail) {
    psychologicalEvents.beliefs.push({
      character_id: character.id,
      belief_challenged: result.belief_detail,
      challenging_evidence: beat.content,
      response: 'DEFEND', // Default, would be determined by subsequent beats
      growth_opportunity: "Potential to update worldview",
    });
  }

  if (result.shadow_activated && result.shadow_detail) {
    psychologicalEvents.shadows.push({
      character_id: character.id,
      shadow_aspect: result.shadow_detail,
      trigger: beat.content,
      reaction: "Defensive posturing",
      integration_opportunity: "Chance to acknowledge this aspect",
    });
  }

  return { beat, psychologicalEvents };
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED DIALOGUE GENERATION (with psychological depth)
// ─────────────────────────────────────────────────────────────────────────────

const DEEP_DIALOGUE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    // The spoken layer
    message: { type: Type.STRING, description: "The actual words spoken" },
    tone: { type: Type.STRING, description: "How it's delivered" },
    
    // The psychological layers
    subtext: { type: Type.STRING, description: "What's really being communicated" },
    conscious_intent: { type: Type.STRING, description: "What the speaker thinks they're doing" },
    unconscious_intent: { type: Type.STRING, description: "What they're really trying to do" },
    
    // Defense and projection
    defense_mechanism_active: { type: Type.STRING, description: "Which defense is shaping this" },
    projection_present: { type: Type.STRING, description: "Any projection happening" },
    
    // Theory of mind updates
    selfAnalysis: { type: Type.STRING, description: "Updated internal monologue" },
    modelOfOther: { type: Type.STRING, description: "Updated model of the other" },
    modelOfOthersModel: { type: Type.STRING, description: "Updated model of their model of me" },
    
    // Emotional state
    felt_emotion: { type: Type.STRING, description: "What they actually feel" },
    displayed_emotion: { type: Type.STRING, description: "What emotion they show" },
    emotional_intensity: { type: Type.NUMBER, description: "0-1 intensity" },
    
    // Arc progress
    arc_movement: { type: Type.STRING, description: "How this moves their character arc" },
    lie_reinforced_or_challenged: { type: Type.STRING, description: "How their core lie is affected" },
  },
  required: ["message", "subtext", "conscious_intent", "unconscious_intent", "selfAnalysis", "modelOfOther", "modelOfOthersModel"],
};

export async function generateDeepDialogue(
  character: Character,
  otherCharacter: Character,
  conversationHistory: Message[],
  context: string
): Promise<{
  message: Message;
  mindState: { selfAnalysis: string; modelOfOther: string; modelOfOthersModel: string };
  psychologicalLayers: {
    subtext: string;
    unconscious_intent: string;
    defense_active?: string;
    projection?: string;
    felt_vs_displayed: { felt: string; displayed: string };
    arc_movement: string;
  };
}> {
  const conversationLog = conversationHistory
    .map((msg) => `${msg.sender}: "${msg.text}"${msg.subtext ? ` [subtext: ${msg.subtext}]` : ""}`)
    .join("\n");

  const prompt = `
You are simulating the complete psychology of ${character.name} generating dialogue.

=== ${character.name}'s COMPLETE PSYCHE ===

UNCONSCIOUS LAYER (hidden even from self):
- Core Wound: ${character.unconscious.core_wound}
- Deepest Fear: ${character.unconscious.deepest_fear}  
- Deepest Desire: ${character.unconscious.deepest_desire}
- Shadow (rejected self): ${character.unconscious.shadow_traits.join(", ")}
- Defense Mechanisms: ${character.unconscious.defense_mechanisms.join(", ")}
- Dominant Archetype: ${character.unconscious.dominant_archetype}
${ARCHETYPE_DESCRIPTIONS[character.unconscious.dominant_archetype]}

PRECONSCIOUS LAYER (accessible but not active):
- Core Beliefs: ${character.preconscious.core_beliefs.join("; ")}
- Attachment Style: ${character.preconscious.attachment_style}
- Learned Patterns: ${character.preconscious.learned_patterns.join("; ")}

CONSCIOUS LAYER (current awareness):
- Current Focus: ${character.conscious.current_focus}
- Current Goals: ${character.conscious.conscious_goals.join("; ")}
- Current Emotion: ${character.conscious.emotional_state.primary_emotion} (intensity: ${character.conscious.emotional_state.intensity})
- Self-Awareness Level: ${Math.round(character.conscious.self_awareness_level * 100)}%

PERSONA (the mask):
- Public Identity: ${character.persona.public_identity}
- Hidden from Others: ${character.persona.hidden_from_others.join("; ")}
- Speech Patterns: ${character.persona.speech_patterns.join("; ")}
- Communication Style: ${character.persona.communication_style}

CHARACTER ARC:
- Current Stage: ${character.character_arc.current_stage}
- Lie Believed: ${character.character_arc.lie_believed}
- Truth to Learn: ${character.character_arc.truth_to_learn}
- Progress: ${Math.round(character.character_arc.transformation_progress * 100)}%

SECRET GOAL: ${character.secretGoal}

=== ${otherCharacter.name} (as ${character.name} perceives them) ===
- Their Archetype: ${otherCharacter.unconscious.dominant_archetype}
- Their Persona: ${otherCharacter.persona.public_identity}
- Their Apparent Goal: ${otherCharacter.conscious.conscious_goals[0] || "unknown"}
- Their Current Emotion: ${otherCharacter.conscious.emotional_state.primary_emotion}

=== CONTEXT ===
${context}

=== CONVERSATION SO FAR ===
${conversationLog || "Conversation just beginning."}

=== YOUR TASK ===

Generate ${character.name}'s next dialogue turn. Remember:

1. THE GAP IS THE DRAMA: The space between what they say and what they mean, between what they know about themselves and what they don't—this is where compelling narrative lives.

2. DEFENSE MECHANISMS DISTORT: Their defenses automatically shape their speech. Projection makes them accuse. Rationalization makes them explain. Denial makes them minimize.

3. THE WOUND ECHOES: Every interaction potentially touches their core wound. Even casual conversation can trigger deep patterns.

4. ARCHETYPE SHAPES STYLE: Their archetypal role influences HOW they engage—the Hero confronts, the Trickster deflects with humor, the Shadow provokes.

5. ARC MUST MOVE: Each exchange should slightly reinforce or challenge their lie, moving them toward or away from transformation.

6. AUTHENTIC VOICE: Their specific speech patterns, vocabulary, cadence. Make them sound like THEM.

7. THEORY OF MIND IS RECURSIVE: They're modeling the other, modeling the other's model of them, and sometimes even modeling the other's model of their model.

Generate rich, psychologically-grounded dialogue.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: DEEP_DIALOGUE_SCHEMA,
      temperature: 0.8,
    },
  });

  const result = JSON.parse(response.text || "{}");

  const message: Message = {
    id: Date.now().toString(),
    sender: character.name,
    text: result.message,
    timestamp: Date.now(),
    subtext: result.subtext,
    emotional_tone: result.felt_emotion as Emotion,
    defense_active: result.defense_mechanism_active as DefenseMechanism,
  };

  return {
    message,
    mindState: {
      selfAnalysis: result.selfAnalysis,
      modelOfOther: result.modelOfOther,
      modelOfOthersModel: result.modelOfOthersModel,
    },
    psychologicalLayers: {
      subtext: result.subtext,
      unconscious_intent: result.unconscious_intent,
      defense_active: result.defense_mechanism_active,
      projection: result.projection_present,
      felt_vs_displayed: {
        felt: result.felt_emotion,
        displayed: result.displayed_emotion,
      },
      arc_movement: result.arc_movement,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER CREATION FROM SEED
// ─────────────────────────────────────────────────────────────────────────────

export function createCharacterFromSeed(seed: {
  name: string;
  archetype: PrimaryArchetype;
  core_wound: string;
  secret_goal: string;
  color?: string;
}): Character {
  // Generate psychologically coherent character from minimal input
  const archetypeDefaults = getArchetypeDefaults(seed.archetype);
  
  return {
    id: crypto.randomUUID(),
    name: seed.name,
    age: 35, // Default
    background: `A ${seed.archetype.toLowerCase()} figure carrying the wound of "${seed.core_wound}"`,
    color: seed.color || archetypeDefaults.color,
    avatar: seed.name[0],
    
    unconscious: {
      core_wound: seed.core_wound,
      deepest_fear: archetypeDefaults.deepest_fear,
      deepest_desire: archetypeDefaults.deepest_desire,
      shadow_traits: archetypeDefaults.shadow_traits,
      projections: [],
      dominant_archetype: seed.archetype,
      archetype_constellation: [
        { archetype: seed.archetype, strength: 0.8, integrated: false, shadow_aspect: archetypeDefaults.shadow_aspect },
      ],
      repressed_memories: [],
      defense_mechanisms: archetypeDefaults.defense_mechanisms,
    },
    
    preconscious: {
      memories_in_reach: [],
      learned_patterns: archetypeDefaults.learned_patterns,
      emotional_associations: new Map(),
      core_beliefs: archetypeDefaults.core_beliefs,
      cognitive_distortions: [],
      attachment_style: archetypeDefaults.attachment_style,
      interpersonal_scripts: [],
    },
    
    conscious: {
      current_focus: seed.secret_goal,
      emotional_state: {
        primary_emotion: 'ANTICIPATION',
        intensity: 0.6,
        secondary_emotions: [],
        valence: 0.2,
        arousal: 0.5,
      },
      conscious_goals: [seed.secret_goal],
      recent_events: [],
      current_interpretation: "",
      self_awareness_level: 0.5,
      insight: "",
    },
    
    persona: {
      public_identity: archetypeDefaults.public_identity,
      social_role: "",
      presentation_style: archetypeDefaults.presentation_style,
      hidden_from_others: [seed.secret_goal],
      performed_traits: [],
      speech_patterns: archetypeDefaults.speech_patterns,
      typical_phrases: [],
      communication_style: archetypeDefaults.communication_style,
    },
    
    story_role: seed.archetype,
    character_arc: {
      starting_state: `Living with the wound of "${seed.core_wound}"`,
      wound_to_heal: seed.core_wound,
      lie_believed: archetypeDefaults.lie_believed,
      truth_to_learn: archetypeDefaults.truth_to_learn,
      current_stage: 'ORDINARY_WORLD',
      transformation_progress: 0,
    },
    
    mind_models: new Map(),
    
    secretGoal: seed.secret_goal,
    mindState: {
      selfAnalysis: "",
      modelOfOther: "",
      modelOfOthersModel: "",
    },
  };
}

function getArchetypeDefaults(archetype: PrimaryArchetype): {
  color: string;
  deepest_fear: string;
  deepest_desire: string;
  shadow_traits: string[];
  shadow_aspect: string;
  defense_mechanisms: DefenseMechanism[];
  learned_patterns: string[];
  core_beliefs: string[];
  attachment_style: 'SECURE' | 'ANXIOUS' | 'AVOIDANT' | 'DISORGANIZED';
  public_identity: string;
  presentation_style: string;
  speech_patterns: string[];
  communication_style: 'ASSERTIVE' | 'PASSIVE' | 'AGGRESSIVE' | 'PASSIVE_AGGRESSIVE';
  lie_believed: string;
  truth_to_learn: string;
} {
  const defaults: Record<PrimaryArchetype, ReturnType<typeof getArchetypeDefaults>> = {
    HERO: {
      color: "blue",
      deepest_fear: "Being powerless, failing those who depend on me",
      deepest_desire: "To prove my worth through meaningful action",
      shadow_traits: ["Recklessness", "Savior complex", "Fear of vulnerability"],
      shadow_aspect: "The tyrant who imposes will on others",
      defense_mechanisms: ['REACTION_FORMATION', 'SUBLIMATION'],
      learned_patterns: ["Take responsibility", "Act before thinking", "Protect others at cost to self"],
      core_beliefs: ["I must be strong", "Showing weakness is dangerous", "I can fix things"],
      attachment_style: 'AVOIDANT',
      public_identity: "The capable one, the one who handles things",
      presentation_style: "Confident, action-oriented, dependable",
      speech_patterns: ["Direct statements", "Action-focused language", "Minimizing personal needs"],
      communication_style: 'ASSERTIVE',
      lie_believed: "I don't need anyone",
      truth_to_learn: "Vulnerability is the birthplace of courage",
    },
    SHADOW: {
      color: "gray",
      deepest_fear: "Being integrated, losing the power of otherness",
      deepest_desire: "To be acknowledged, to be seen as having value",
      shadow_traits: ["Destructiveness", "Envy", "Rage"],
      shadow_aspect: "Total identification with darkness",
      defense_mechanisms: ['PROJECTION', 'DISPLACEMENT'],
      learned_patterns: ["Attack before being attacked", "Trust no one", "Power through fear"],
      core_beliefs: ["The world rejected me first", "Destruction is creation", "I am what they fear"],
      attachment_style: 'DISORGANIZED',
      public_identity: "The outsider, the one who sees truths others deny",
      presentation_style: "Intense, unsettling, magnetic",
      speech_patterns: ["Uncomfortable truths", "Provocative statements", "Cutting insight"],
      communication_style: 'AGGRESSIVE',
      lie_believed: "I am only the darkness",
      truth_to_learn: "The shadow is a doorway to wholeness",
    },
    MENTOR: {
      color: "gold",
      deepest_fear: "Being useless, having nothing left to give",
      deepest_desire: "To see my wisdom live on in others",
      shadow_traits: ["Condescension", "Inability to let go", "Vicarious living"],
      shadow_aspect: "The false guide who creates dependence",
      defense_mechanisms: ['INTELLECTUALIZATION', 'SUBLIMATION'],
      learned_patterns: ["Teach rather than do", "Share hard-won wisdom", "Step back at the crucial moment"],
      core_beliefs: ["Knowledge is sacred", "Growth requires guidance", "My time has passed but my wisdom remains"],
      attachment_style: 'SECURE',
      public_identity: "The wise elder, the keeper of knowledge",
      presentation_style: "Patient, knowing, sometimes cryptic",
      speech_patterns: ["Parables and metaphors", "Questions that lead to answers", "Gentle challenges"],
      communication_style: 'ASSERTIVE',
      lie_believed: "I must always have the answer",
      truth_to_learn: "Sometimes not knowing is the gift",
    },
    HERALD: {
      color: "orange",
      deepest_fear: "Returning to stasis, being ignored",
      deepest_desire: "To matter, to be the catalyst for change",
      shadow_traits: ["Chaos-seeking", "Insensitivity to cost", "Addiction to disruption"],
      shadow_aspect: "Destruction without purpose",
      defense_mechanisms: ['DENIAL', 'RATIONALIZATION'],
      learned_patterns: ["Break comfortable silences", "Deliver unwanted truth", "Force the issue"],
      core_beliefs: ["Stasis is death", "Change is always necessary", "Someone must speak"],
      attachment_style: 'ANXIOUS',
      public_identity: "The messenger, the one who brings news",
      presentation_style: "Urgent, compelling, disruptive",
      speech_patterns: ["Announcements", "Urgent declarations", "Challenge to action"],
      communication_style: 'ASSERTIVE',
      lie_believed: "I am only valuable when bringing change",
      truth_to_learn: "Stillness also has wisdom",
    },
    THRESHOLD_GUARDIAN: {
      color: "bronze",
      deepest_fear: "The unworthy passing through",
      deepest_desire: "To find someone truly worthy",
      shadow_traits: ["Petty tyranny", "Enjoying others' failure", "Rigid cruelty"],
      shadow_aspect: "The bureaucrat who blocks for pleasure",
      defense_mechanisms: ['REACTION_FORMATION', 'RATIONALIZATION'],
      learned_patterns: ["Test before trusting", "Protect the sacred", "Challenge the confident"],
      core_beliefs: ["Not everyone deserves passage", "Testing reveals truth", "Standards must be maintained"],
      attachment_style: 'AVOIDANT',
      public_identity: "The gatekeeper, the tester",
      presentation_style: "Challenging, skeptical, demanding",
      speech_patterns: ["Challenges", "Standards", "Requirements"],
      communication_style: 'PASSIVE_AGGRESSIVE',
      lie_believed: "I am protecting something sacred",
      truth_to_learn: "Sometimes the gate should be opened",
    },
    SHAPESHIFTER: {
      color: "purple",
      deepest_fear: "Being pinned down, truly known",
      deepest_desire: "To find a form that is truly mine",
      shadow_traits: ["Unreliability", "Identity dissolution", "Manipulation"],
      shadow_aspect: "Complete loss of self in endless transformation",
      defense_mechanisms: ['DISPLACEMENT', 'PROJECTION'],
      learned_patterns: ["Adapt to survive", "Show them what they want", "Keep real self hidden"],
      core_beliefs: ["Identity is fluid", "Everyone wears masks", "Certainty is illusion"],
      attachment_style: 'DISORGANIZED',
      public_identity: "Different things to different people",
      presentation_style: "Mercurial, alluring, unpredictable",
      speech_patterns: ["Mirrors others' speech", "Ambiguous statements", "Questions that reveal others"],
      communication_style: 'PASSIVE',
      lie_believed: "I have no true self",
      truth_to_learn: "Beneath all masks is something real",
    },
    TRICKSTER: {
      color: "green",
      deepest_fear: "Being trapped in seriousness, losing the absurd",
      deepest_desire: "To reveal truth through chaos",
      shadow_traits: ["Cruelty disguised as humor", "Destruction without purpose", "Fear of depth"],
      shadow_aspect: "The jester become torturer",
      defense_mechanisms: ['INTELLECTUALIZATION', 'DENIAL'],
      learned_patterns: ["Deflect with humor", "Break rules to reveal their absurdity", "Never be fully serious"],
      core_beliefs: ["Rules are for breaking", "Laughter reveals truth", "Nothing is truly sacred"],
      attachment_style: 'AVOIDANT',
      public_identity: "The fool, the clever one, the rule-breaker",
      presentation_style: "Playful, irreverent, quick-witted",
      speech_patterns: ["Jokes at crucial moments", "Subversive observations", "Mock-serious tone"],
      communication_style: 'PASSIVE_AGGRESSIVE',
      lie_believed: "Nothing matters enough to take seriously",
      truth_to_learn: "Some things are worth being earnest about",
    },
    ALLY: {
      color: "teal",
      deepest_fear: "Being abandoned, being alone again",
      deepest_desire: "To be indispensable to someone",
      shadow_traits: ["Enabling", "Losing self in service", "Passive aggression"],
      shadow_aspect: "The sidekick who secretly resents",
      defense_mechanisms: ['REACTION_FORMATION', 'REPRESSION'],
      learned_patterns: ["Support before self", "Be useful", "Maintain connection at any cost"],
      core_beliefs: ["I am valued for what I do, not who I am", "Connection is survival", "My needs come second"],
      attachment_style: 'ANXIOUS',
      public_identity: "The loyal friend, the supportive one",
      presentation_style: "Warm, reliable, self-effacing",
      speech_patterns: ["Supportive affirmations", "Minimizing own needs", "Focusing on others"],
      communication_style: 'PASSIVE',
      lie_believed: "I don't need to matter on my own",
      truth_to_learn: "I am worthy of my own story",
    },
    MOTHER: {
      color: "rose",
      deepest_fear: "Being unable to protect, watching children suffer",
      deepest_desire: "To nurture life, to see growth",
      shadow_traits: ["Smothering", "Devouring love", "Guilt manipulation"],
      shadow_aspect: "The terrible mother who consumes",
      defense_mechanisms: ['REACTION_FORMATION', 'DENIAL'],
      learned_patterns: ["Put children first", "Sacrifice self for others", "Create safety"],
      core_beliefs: ["My purpose is to nurture", "I can make things safe", "Love means sacrifice"],
      attachment_style: 'ANXIOUS',
      public_identity: "The nurturer, the caregiver, the protector",
      presentation_style: "Warm, encompassing, sometimes overwhelming",
      speech_patterns: ["Terms of endearment", "Expressions of concern", "Nurturing observations"],
      communication_style: 'PASSIVE',
      lie_believed: "I must always give to be loved",
      truth_to_learn: "Receiving is also a gift",
    },
    FATHER: {
      color: "navy",
      deepest_fear: "Chaos, loss of order, things falling apart",
      deepest_desire: "To create lasting structure, to initiate worthiness",
      shadow_traits: ["Tyranny", "Rigidity", "Emotional distance"],
      shadow_aspect: "The devouring king who crushes all growth",
      defense_mechanisms: ['INTELLECTUALIZATION', 'REPRESSION'],
      learned_patterns: ["Maintain order", "Set standards", "Judge worthiness"],
      core_beliefs: ["Structure creates safety", "Standards must be earned", "Emotion is weakness"],
      attachment_style: 'AVOIDANT',
      public_identity: "The authority, the provider, the judge",
      presentation_style: "Commanding, structured, emotionally reserved",
      speech_patterns: ["Declarative statements", "Standards and expectations", "Measured responses"],
      communication_style: 'ASSERTIVE',
      lie_believed: "Control is protection",
      truth_to_learn: "Love requires letting go",
    },
    CHILD: {
      color: "yellow",
      deepest_fear: "Growing up means dying inside",
      deepest_desire: "To stay connected to wonder",
      shadow_traits: ["Irresponsibility", "Eternal victimhood", "Refusing to grow"],
      shadow_aspect: "The puer aeternus trapped in immaturity",
      defense_mechanisms: ['DENIAL', 'REGRESSION'],
      learned_patterns: ["Stay curious", "Don't take too seriously", "Keep the magic alive"],
      core_beliefs: ["Adults have forgotten something precious", "Wonder is wisdom", "Play is sacred"],
      attachment_style: 'ANXIOUS',
      public_identity: "The innocent, the wonder-filled, the new one",
      presentation_style: "Open, curious, emotionally transparent",
      speech_patterns: ["Questions", "Exclamations of wonder", "Honest reactions"],
      communication_style: 'PASSIVE',
      lie_believed: "Growing up means losing myself",
      truth_to_learn: "Maturity can include wonder",
    },
    SELF: {
      color: "white",
      deepest_fear: "Inflation, believing I am complete",
      deepest_desire: "True integration, authentic being",
      shadow_traits: ["Spiritual pride", "Detachment from human struggle", "Superiority"],
      shadow_aspect: "Ego identification with the totality",
      defense_mechanisms: ['INTELLECTUALIZATION', 'SUBLIMATION'],
      learned_patterns: ["Embrace opposites", "Seek balance", "Hold tension without resolving"],
      core_beliefs: ["All aspects belong", "Integration is the goal", "Wholeness includes brokenness"],
      attachment_style: 'SECURE',
      public_identity: "The whole one, the integrated, the centered",
      presentation_style: "Calm, present, paradoxical",
      speech_patterns: ["Paradoxes", "Both/and statements", "Quiet presence"],
      communication_style: 'ASSERTIVE',
      lie_believed: "I have transcended",
      truth_to_learn: "The journey never ends",
    },
  };

  return defaults[archetype];
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Convert simple AgentState to full Character
// ─────────────────────────────────────────────────────────────────────────────

export function agentStateToCharacter(agent: { 
  name: string; 
  color: string; 
  avatar: string;
  secretGoal: string;
  mindState: { selfAnalysis: string; modelOfOther: string; modelOfOthersModel: string };
}, archetype: PrimaryArchetype = 'HERO'): Character {
  return createCharacterFromSeed({
    name: agent.name,
    archetype: archetype,
    core_wound: "Not yet specified",
    secret_goal: agent.secretGoal,
    color: agent.color,
  });
}
