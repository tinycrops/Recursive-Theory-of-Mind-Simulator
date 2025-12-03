// ═══════════════════════════════════════════════════════════════════════════
// THEORY OF MIND NARRATIVE ENGINE - TYPE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
// "Between stimulus and response there is a space. In that space is our power
// to choose our response. In our response lies our growth and our freedom."
// — Viktor Frankl
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// JUNGIAN ARCHETYPES - The Universal Patterns of the Psyche
// ─────────────────────────────────────────────────────────────────────────────

export type PrimaryArchetype = 
  | 'HERO'        // The one who overcomes, transforms through trial
  | 'SHADOW'      // The rejected self, the adversary within
  | 'MENTOR'      // The wise guide, holder of knowledge
  | 'HERALD'      // The catalyst, bringer of change
  | 'THRESHOLD_GUARDIAN' // Tests the worthy, protects transformation
  | 'SHAPESHIFTER'       // The mercurial, gender-anima/animus
  | 'TRICKSTER'   // Chaos agent, truth through mischief
  | 'ALLY'        // The companion, mirror of growth
  | 'MOTHER'      // Nurturing, life-giving, devouring
  | 'FATHER'      // Order, law, tyranny or protection
  | 'CHILD'       // Innocence, potential, vulnerability
  | 'SELF';       // Wholeness, integration, the goal

export type ArchetypeInfluence = {
  archetype: PrimaryArchetype;
  strength: number;      // 0-1, how dominant this archetype is
  integrated: boolean;   // Has this been consciously integrated?
  shadow_aspect: string; // The dark side of this archetype
};

// ─────────────────────────────────────────────────────────────────────────────
// THE LAYERED PSYCHE - Freudian Topography meets Jungian Depth
// ─────────────────────────────────────────────────────────────────────────────

export interface UnconsciousLayer {
  // Core wounds and formative experiences
  core_wound: string;           // "Abandoned by father at age 7"
  deepest_fear: string;         // "Being truly seen and rejected"
  deepest_desire: string;       // "Unconditional acceptance"
  
  // Shadow content - rejected parts of self
  shadow_traits: string[];      // ["Rage", "Selfishness", "Weakness"]
  projections: string[];        // What they see in others that's really in them
  
  // Archetypal influences
  dominant_archetype: PrimaryArchetype;
  archetype_constellation: ArchetypeInfluence[];
  
  // Repressed material
  repressed_memories: string[];
  defense_mechanisms: DefenseMechanism[];
}

export type DefenseMechanism = 
  | 'PROJECTION'      // Attributing own traits to others
  | 'DENIAL'          // Refusing to acknowledge reality
  | 'RATIONALIZATION' // Logical excuses for emotional decisions
  | 'DISPLACEMENT'    // Redirecting emotions to safer targets
  | 'SUBLIMATION'     // Channeling drives into acceptable outlets
  | 'REPRESSION'      // Pushing thoughts out of consciousness
  | 'REACTION_FORMATION' // Acting opposite to true feelings
  | 'REGRESSION'      // Reverting to earlier developmental behaviors
  | 'INTELLECTUALIZATION'; // Detaching emotion through analysis

export interface PreconsciousLayer {
  // Accessible but not currently active
  memories_in_reach: string[];
  learned_patterns: string[];     // Behavioral scripts
  emotional_associations: Map<string, string>; // trigger -> response
  
  // Beliefs about self and world
  core_beliefs: string[];         // "I am not enough", "The world is dangerous"
  cognitive_distortions: string[];
  
  // Relational patterns
  attachment_style: 'SECURE' | 'ANXIOUS' | 'AVOIDANT' | 'DISORGANIZED';
  interpersonal_scripts: string[];
}

export interface ConsciousLayer {
  // Current awareness
  current_focus: string;
  emotional_state: EmotionalState;
  conscious_goals: string[];
  
  // Working memory
  recent_events: string[];
  current_interpretation: string;
  
  // Metacognition
  self_awareness_level: number; // 0-1
  insight: string;              // Current self-understanding
}

export interface EmotionalState {
  primary_emotion: Emotion;
  intensity: number;           // 0-1
  secondary_emotions: Emotion[];
  valence: number;             // -1 to 1 (negative to positive)
  arousal: number;             // 0-1 (calm to activated)
  
  // Emotional regulation
  suppressed_emotion?: Emotion;
  displayed_emotion?: Emotion; // Persona mask
}

export type Emotion = 
  | 'JOY' | 'SADNESS' | 'ANGER' | 'FEAR' | 'DISGUST' | 'SURPRISE'
  | 'ANTICIPATION' | 'TRUST' | 'SHAME' | 'GUILT' | 'ENVY' | 'JEALOUSY'
  | 'LOVE' | 'GRIEF' | 'HOPE' | 'DESPAIR' | 'CONTEMPT' | 'AWE';

// ─────────────────────────────────────────────────────────────────────────────
// THE PERSONA - The Mask We Show The World
// ─────────────────────────────────────────────────────────────────────────────

export interface Persona {
  public_identity: string;       // "Successful businessman"
  social_role: string;           // "Father, provider, leader"
  presentation_style: string;    // How they come across
  
  // The gap between persona and self
  hidden_from_others: string[];
  performed_traits: string[];    // Traits shown but not felt
  
  // Voice and communication
  speech_patterns: string[];
  typical_phrases: string[];
  communication_style: 'ASSERTIVE' | 'PASSIVE' | 'AGGRESSIVE' | 'PASSIVE_AGGRESSIVE';
}

// ─────────────────────────────────────────────────────────────────────────────
// RECURSIVE THEORY OF MIND - Models Within Models
// ─────────────────────────────────────────────────────────────────────────────

export interface RecursiveMindState {
  selfAnalysis: string;         // Level 0: What I am thinking/planning
  modelOfOther: string;         // Level 1: What I think the other agent wants
  modelOfOthersModel: string;   // Level 2: What I think the other thinks of ME
}

// Extended Theory of Mind with psychodynamic depth
export interface DeepTheoryOfMind {
  // Level 0: Self-model
  my_conscious_state: string;
  my_hidden_motives: string;     // What I know about myself others don't
  my_blind_spots: string;        // What I don't know about myself
  
  // Level 1: Model of Other
  their_apparent_goals: string;
  their_suspected_secrets: string;
  their_perceived_emotions: string;
  their_suspected_wounds: string; // Intuitions about their psychology
  
  // Level 2: Model of Other's Model of Me
  how_they_see_me: string;
  what_they_suspect_about_me: string;
  their_emotional_reaction_to_me: string;
  
  // Level 3: Meta-recursive (rare but powerful)
  what_they_think_i_think_of_them: string;
  
  // Projection detection
  am_i_projecting: string;       // Self-awareness of projection
  are_they_projecting: string;   // Sensing their projection
  
  // Strategic implications
  leverage_points: string;       // How to influence them
  vulnerabilities_exposed: string; // My exposed weaknesses
  trust_level: number;           // 0-1
  deception_detected: number;    // 0-1 confidence they're deceiving
}

// ─────────────────────────────────────────────────────────────────────────────
// THE COMPLETE CHARACTER - Full Psychological Portrait
// ─────────────────────────────────────────────────────────────────────────────

export interface Character {
  // Identity
  id: string;
  name: string;
  age: number;
  background: string;
  
  // Visual
  color: string;
  avatar: string;
  
  // The Layered Psyche
  unconscious: UnconsciousLayer;
  preconscious: PreconsciousLayer;
  conscious: ConsciousLayer;
  persona: Persona;
  
  // Narrative Role
  story_role: PrimaryArchetype;
  character_arc: CharacterArc;
  
  // Theory of Mind models (indexed by other character ID)
  mind_models: Map<string, DeepTheoryOfMind>;
  
  // Legacy simple state (for compatibility)
  secretGoal: string;
  mindState: RecursiveMindState;
}

export interface CharacterArc {
  starting_state: string;        // "Isolated and cynical"
  wound_to_heal: string;         // Connection to core wound
  lie_believed: string;          // "Love makes you weak"
  truth_to_learn: string;        // "Vulnerability is strength"
  current_stage: ArcStage;
  transformation_progress: number; // 0-1
}

export type ArcStage = 
  | 'ORDINARY_WORLD'    // Before the call
  | 'CALL_TO_ADVENTURE' // Inciting incident
  | 'REFUSAL'           // Resistance to change
  | 'MEETING_MENTOR'    // Gaining tools/wisdom
  | 'CROSSING_THRESHOLD'// Committing to change
  | 'TESTS_AND_ALLIES'  // Learning and growing
  | 'APPROACH'          // Preparing for ordeal
  | 'ORDEAL'            // Death and rebirth
  | 'REWARD'            // Gaining the elixir
  | 'ROAD_BACK'         // Returning changed
  | 'RESURRECTION'      // Final test
  | 'RETURN_WITH_ELIXIR'; // Integration complete

// ─────────────────────────────────────────────────────────────────────────────
// NARRATIVE STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

export interface NarrativeState {
  // Story context
  world: WorldState;
  theme: string;                 // Core thematic question
  central_conflict: string;
  
  // Characters
  characters: Character[];
  relationships: Relationship[];
  
  // Story progression
  current_scene: Scene;
  scene_history: Scene[];
  story_beats: StoryBeat[];
  
  // Tension and drama
  tension_level: number;         // 0-1
  dramatic_question: string;     // What the audience is wondering
  
  // Emergent elements
  symbols: Symbol[];             // Recurring symbolic elements
  motifs: string[];              // Thematic repetitions
}

export interface WorldState {
  setting: string;
  time_period: string;
  atmosphere: string;
  rules: string[];               // What's possible in this world
  constraints: string[];         // Limitations that create drama
}

export interface Relationship {
  character_a_id: string;
  character_b_id: string;
  
  // Relational dynamics
  type: RelationshipType;
  power_balance: number;         // -1 to 1 (A dominant to B dominant)
  intimacy_level: number;        // 0-1
  conflict_level: number;        // 0-1
  trust_a_to_b: number;          // 0-1
  trust_b_to_a: number;          // 0-1
  
  // History
  shared_history: string;
  unresolved_tensions: string[];
  secrets_between: string[];     // Things one knows other doesn't
  
  // Archetypal dynamic
  dynamic_pattern: string;       // "Mentor-Student", "Rivals", "Shadow-Self"
}

export type RelationshipType = 
  | 'ALLY' | 'ADVERSARY' | 'LOVER' | 'FAMILY' | 'MENTOR_STUDENT'
  | 'RIVALS' | 'STRANGERS' | 'FORMER_LOVERS' | 'SHADOW_SELF';

export interface Scene {
  id: string;
  title: string;
  setting: string;
  characters_present: string[];  // Character IDs
  
  // Scene dynamics
  scene_goal: string;            // What this scene accomplishes narratively
  conflict: string;              // The scene-level conflict
  stakes: string;                // What's at risk
  
  // Content
  beats: SceneBeat[];
  
  // Emotional arc
  starting_emotion: string;
  ending_emotion: string;
  turn: string;                  // The pivotal moment
  
  // Outcome
  resolution: string;
  consequences: string[];
  revelations: string[];         // What was revealed
  
  // Psychological events
  projections_occurred: ProjectionEvent[];
  beliefs_challenged: BeliefChallenge[];
  shadows_touched: ShadowTouch[];
}

export interface SceneBeat {
  character_id: string;
  action_type: 'DIALOGUE' | 'ACTION' | 'INTERNAL' | 'REACTION';
  content: string;
  subtext: string;               // What's really being communicated
  
  // The mind behind it
  conscious_intent: string;
  unconscious_driver: string;
  
  // Effect on others
  perceived_as: string;          // How others interpret this
  actual_effect: string;         // What it actually does
}

export interface StoryBeat {
  id: string;
  type: StoryBeatType;
  description: string;
  characters_involved: string[];
  psychological_function: string; // What this does psychologically
  completed: boolean;
}

export type StoryBeatType = 
  | 'SETUP' | 'INCITING_INCIDENT' | 'RISING_ACTION' | 'COMPLICATION'
  | 'REVELATION' | 'CONFRONTATION' | 'CLIMAX' | 'FALLING_ACTION'
  | 'RESOLUTION' | 'DENOUEMENT';

// ─────────────────────────────────────────────────────────────────────────────
// PSYCHOLOGICAL EVENTS - Where Drama Emerges
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectionEvent {
  projector_id: string;
  recipient_id: string;
  projected_trait: string;       // What's being projected
  actual_owner: 'PROJECTOR' | 'RECIPIENT' | 'BOTH';
  conscious_awareness: boolean;  // Does projector realize?
  narrative_impact: string;      // How this affects the story
}

export interface BeliefChallenge {
  character_id: string;
  belief_challenged: string;
  challenging_evidence: string;
  response: 'INTEGRATE' | 'DEFEND' | 'DENY' | 'CRISIS';
  growth_opportunity: string;
}

export interface ShadowTouch {
  character_id: string;
  shadow_aspect: string;
  trigger: string;
  reaction: string;
  integration_opportunity: string;
}

export interface Symbol {
  name: string;
  visual: string;
  meaning_conscious: string;     // What characters think it means
  meaning_unconscious: string;   // What it actually symbolizes
  recurrences: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY COMPATIBILITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentState {
  name: string;
  color: string;
  avatar: string;
  secretGoal: string;
  mindState: RecursiveMindState;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  
  // Enhanced message metadata
  subtext?: string;              // The hidden meaning
  emotional_tone?: Emotion;
  defense_active?: DefenseMechanism;
}

export interface SimulationConfig {
  aliceGoal: string;
  bobGoal: string;
  context: string;
}

export type Turn = 'ALICE' | 'BOB';

// ─────────────────────────────────────────────────────────────────────────────
// NARRATIVE GENERATION CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export interface NarrativeConfig {
  mode: 'DIALOGUE' | 'SCENE' | 'STORY';
  
  // Thematic controls
  theme: string;
  genre: Genre;
  tone: Tone;
  
  // Character configuration
  characters: CharacterSeed[];
  
  // World configuration
  setting: string;
  time_period: string;
  
  // Generation parameters
  psychological_depth: number;   // 0-1, how deep to go
  archetype_strength: number;    // 0-1, how overt archetypes are
  symbolism_density: number;     // 0-1, how many symbols to weave in
  
  // Constraints
  content_limits: string[];
  required_elements: string[];
}

export interface CharacterSeed {
  name: string;
  archetype: PrimaryArchetype;
  core_wound: string;
  secret_goal: string;
  relationship_to_theme: string;
}

export type Genre = 
  | 'DRAMA' | 'THRILLER' | 'ROMANCE' | 'TRAGEDY' | 'COMEDY'
  | 'MYSTERY' | 'HORROR' | 'ADVENTURE' | 'LITERARY' | 'MYTH';

export type Tone = 
  | 'DARK' | 'HOPEFUL' | 'IRONIC' | 'MELANCHOLIC' | 'TENSE'
  | 'WARM' | 'COLD' | 'DREAMLIKE' | 'GROUNDED' | 'EPIC';
