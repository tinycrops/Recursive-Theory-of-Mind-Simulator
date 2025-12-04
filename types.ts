// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL-ALPHA-CONTENT BRIDGE - TYPE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════
// "The market is a device for transferring money from the impatient to the
// patient." — Warren Buffett
// 
// "Every person's story is worth telling." — Your Future Self
//
// This system bridges personal truth → public content → market alpha
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// CORE MIND ARCHETYPES - Extended for Creator/Predictor Duality
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

// Extended archetypes for the prediction/content duality
export type MarketArchetype =
  | 'ORACLE'      // Sees patterns others miss, speaks in probabilities
  | 'CONTRARIAN'  // Profits from crowd mistakes, adversarial thinker
  | 'MOMENTUM'    // Rides waves, follows strength
  | 'VALUE'       // Finds mispriced assets, patient accumulator
  | 'ARBITRAGEUR' // Exploits inefficiencies, risk-neutral
  | 'NARRATIVE'   // Trades stories, not numbers
  | 'QUANT'       // Pure signal extraction, emotion-blind
  | 'WHALE'       // Market mover, self-aware of impact
  | 'DEGEN'       // High conviction, high risk, YOLO energy
  | 'SAGE';       // Long-term, macro thinker

export type ContentArchetype =
  | 'STORYTELLER' // Weaves compelling narratives from raw experience
  | 'TEACHER'     // Extracts lessons, educates through experience
  | 'ENTERTAINER' // Maximizes engagement, hooks attention
  | 'PROVOCATEUR' // Challenges assumptions, generates discourse
  | 'CURATOR'     // Selects and frames the best moments
  | 'CONFESSIONALIST' // Raw vulnerability, authentic oversharing
  | 'ANALYST'     // Breaks down complexity into understanding
  | 'VISIONARY';  // Paints futures, inspires action

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL INPUT SYSTEM - Raw Personal Data
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  timestamp: number;
  
  // Raw input
  input_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'SCREEN_CAPTURE' | 'MIXED';
  raw_transcript?: string;
  duration_seconds?: number;
  
  // Extracted content
  spoken_content: string;
  visual_context?: string;      // What's visible in the video
  emotional_markers: EmotionalMarker[];
  
  // Metadata
  location_context?: string;
  time_of_day: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  energy_level: number;         // 0-1 detected from speech/visual
  
  // User-provided context
  tags?: string[];
  private_notes?: string;       // Never included in content
  content_permission: 'FULL' | 'ANONYMIZED' | 'INSIGHTS_ONLY' | 'PRIVATE';
}

export interface EmotionalMarker {
  timestamp_offset: number;     // Seconds into the entry
  emotion: Emotion;
  intensity: number;            // 0-1
  trigger?: string;             // What caused this shift
  authenticity: number;         // 0-1, is this performed or genuine?
}

export interface JournalAnalysis {
  entry_id: string;
  
  // Core insights extracted
  key_insights: Insight[];
  narrative_threads: NarrativeThread[];
  belief_statements: BeliefStatement[];
  
  // Psychological state
  dominant_emotions: Emotion[];
  defense_mechanisms_detected: DefenseMechanism[];
  cognitive_patterns: CognitivePattern[];
  
  // Content potential
  hook_moments: HookMoment[];
  shareable_quotes: string[];
  visual_highlights: VisualHighlight[];
  
  // Market relevance
  market_signals: MarketSignal[];
  contrarian_indicators: ContrarianIndicator[];
  sentiment_shift: SentimentShift[];
}

export interface Insight {
  id: string;
  content: string;
  insight_type: 'PERSONAL_GROWTH' | 'MARKET_OBSERVATION' | 'SOCIAL_TREND' | 'PREDICTION' | 'LESSON_LEARNED' | 'QUESTION';
  confidence: number;           // 0-1
  novelty: number;              // 0-1, how unique is this insight
  actionability: number;        // 0-1, can this be acted upon
  source_timestamps: number[];  // Where in the journal this came from
}

export interface NarrativeThread {
  id: string;
  theme: string;
  story_arc: 'STRUGGLE' | 'VICTORY' | 'LEARNING' | 'QUESTION' | 'TRANSFORMATION' | 'WARNING';
  key_moments: string[];
  emotional_journey: Emotion[];
  resolution?: string;
  content_potential: number;    // 0-1
}

export interface BeliefStatement {
  statement: string;
  belief_type: 'ABOUT_SELF' | 'ABOUT_WORLD' | 'ABOUT_MARKETS' | 'ABOUT_OTHERS' | 'ABOUT_FUTURE';
  confidence_expressed: number;
  actual_confidence: number;    // Detected from subtext
  testable: boolean;            // Can this become a prediction?
  market_relevant: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT GENERATION SYSTEM - YouTube Shorts Output
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentBrief {
  id: string;
  source_entries: string[];     // Journal entry IDs used
  
  // Content strategy
  target_archetype: ContentArchetype;
  hook_strategy: HookStrategy;
  narrative_structure: NarrativeStructure;
  
  // Audience targeting
  target_emotion: Emotion;
  target_audience: AudienceProfile;
  platform_optimization: PlatformSpec;
  
  // Generated content
  script: ContentScript;
  visual_direction: VisualDirection;
  
  // Performance prediction
  predicted_engagement: EngagementPrediction;
}

export interface HookMoment {
  timestamp: number;
  hook_type: 'SURPRISING_STATEMENT' | 'EMOTIONAL_PEAK' | 'QUESTION' | 'CONFLICT' | 'REVELATION' | 'HUMOR';
  content: string;
  attention_score: number;      // 0-1
  controversy_risk: number;     // 0-1
}

export interface HookStrategy {
  primary_hook: string;
  hook_type: 'QUESTION' | 'BOLD_CLAIM' | 'STORY_OPENING' | 'PATTERN_INTERRUPT' | 'EMOTIONAL_HIT';
  retention_hooks: string[];    // Keep people watching
  cta_hook: string;             // Call to action
}

export interface NarrativeStructure {
  format: 'STORY' | 'LESSON' | 'RANT' | 'BREAKDOWN' | 'REACTION' | 'CONFESSION' | 'PREDICTION';
  beats: ContentBeat[];
  emotional_arc: Emotion[];
  pacing: 'FAST' | 'MEDIUM' | 'SLOW' | 'VARIABLE';
  duration_target: number;      // Seconds
}

export interface ContentBeat {
  beat_number: number;
  content: string;
  duration_seconds: number;
  visual_direction: string;
  emotional_target: Emotion;
  purpose: 'HOOK' | 'CONTEXT' | 'ESCALATION' | 'PEAK' | 'RESOLUTION' | 'CTA';
}

export interface ContentScript {
  full_script: string;
  spoken_word_count: number;
  reading_time_seconds: number;
  
  // Breakdown
  hook_segment: string;
  body_segments: string[];
  close_segment: string;
  
  // Optimization
  pattern_interrupts: string[];
  engagement_questions: string[];
  shareable_quotes: string[];
}

export interface VisualDirection {
  primary_style: 'TALKING_HEAD' | 'B_ROLL' | 'SCREEN_SHARE' | 'TEXT_OVERLAY' | 'MIXED';
  transitions: string[];
  text_overlays: TextOverlay[];
  suggested_cuts: number[];     // Timestamps for cuts
  color_mood: string;
  energy_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TextOverlay {
  timestamp: number;
  duration: number;
  text: string;
  style: 'TITLE' | 'SUBTITLE' | 'CALLOUT' | 'STAT' | 'QUOTE';
  position: 'TOP' | 'CENTER' | 'BOTTOM';
}

export interface VisualHighlight {
  timestamp: number;
  description: string;
  visual_interest: number;      // 0-1
  usable_duration: number;
}

export interface AudienceProfile {
  primary_demographic: string;
  interests: string[];
  pain_points: string[];
  content_preferences: string[];
  attention_span: 'SHORT' | 'MEDIUM' | 'LONG';
}

export interface PlatformSpec {
  platform: 'YOUTUBE_SHORTS' | 'TIKTOK' | 'INSTAGRAM_REELS' | 'X_VIDEO';
  optimal_duration: number;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  hashtag_strategy: string[];
  posting_time?: string;
}

export interface EngagementPrediction {
  predicted_view_rate: number;      // 0-1
  predicted_completion_rate: number;
  predicted_engagement_rate: number;
  viral_potential: number;          // 0-1
  controversy_score: number;        // 0-1
  confidence_interval: [number, number];
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVERSARIAL PREDICTION SYSTEM - Market Alpha Generation
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketSignal {
  id: string;
  signal_type: 'SENTIMENT' | 'BEHAVIORAL' | 'NARRATIVE' | 'CONTRARIAN' | 'MOMENTUM' | 'STRUCTURAL';
  source: 'JOURNAL' | 'MARKET_DATA' | 'SOCIAL' | 'NEWS' | 'CROSS_REFERENCE';
  
  // The signal itself
  observation: string;
  interpretation: string;
  
  // Strength metrics
  signal_strength: number;      // 0-1
  noise_ratio: number;          // 0-1, higher = more noise
  time_sensitivity: 'IMMEDIATE' | 'DAYS' | 'WEEKS' | 'MONTHS';
  
  // Source quality
  first_person_confidence: number;  // How confident is the journal author?
  meta_confidence: number;          // How much should we trust that confidence?
}

export interface ContrarianIndicator {
  popular_belief: string;
  contrarian_thesis: string;
  evidence_for_contrarian: string[];
  crowd_confidence: number;     // How confident is the crowd in popular belief
  contrarian_edge: number;      // 0-1, potential alpha from being contrarian
  risk_if_wrong: string;
}

export interface SentimentShift {
  from_sentiment: Emotion;
  to_sentiment: Emotion;
  shift_magnitude: number;      // 0-1
  market_relevance: string;
  historical_correlation?: string;
}

export interface PredictionMarket {
  id: string;
  platform: 'POLYMARKET' | 'MANIFOLD' | 'METACULUS' | 'KALSHI' | 'PREDICTIT' | 'CUSTOM';
  question: string;
  current_price: number;        // 0-1 probability
  volume: number;
  liquidity: number;
  resolution_date: string;
  category: string;
}

export interface MarketPosition {
  id: string;
  market_id: string;
  
  // Position details
  direction: 'YES' | 'NO' | 'ABSTAIN';
  conviction: number;           // 0-1
  size_recommendation: 'SKIP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'MAX';
  
  // Reasoning
  thesis: string;
  primary_evidence: string[];
  adversarial_challenge: string[];  // Why we might be wrong
  
  // Risk management
  entry_price_target: number;
  exit_price_target: number;
  stop_loss?: number;
  time_horizon: string;
  
  // Meta
  edge_source: 'INFORMATION' | 'TIMING' | 'PSYCHOLOGY' | 'STRUCTURAL' | 'NARRATIVE';
  confidence_calibration: number;   // Historical accuracy at this confidence
}

export interface AdversarialAnalysis {
  position_id: string;
  
  // Steel-manning the opposition
  best_bull_case: string;
  best_bear_case: string;
  
  // Cognitive bias check
  biases_detected: CognitiveBias[];
  emotional_influence: number;      // 0-1, how much emotion is driving this
  
  // Scenario analysis
  scenarios: Scenario[];
  base_case_probability: number;
  
  // Final recommendation
  adjusted_conviction: number;
  recommendation: 'PROCEED' | 'REDUCE_SIZE' | 'WAIT' | 'REVERSE' | 'SKIP';
  key_invalidation: string;         // What would prove us wrong
}

export interface Scenario {
  name: string;
  description: string;
  probability: number;
  outcome_if_true: 'WIN' | 'LOSE' | 'BREAKEVEN';
  expected_return: number;
}

export interface CognitiveBias {
  bias_type: 'CONFIRMATION' | 'RECENCY' | 'ANCHORING' | 'OVERCONFIDENCE' | 'AVAILABILITY' | 'NARRATIVE_FALLACY' | 'SUNK_COST' | 'BANDWAGON' | 'HINDSIGHT';
  description: string;
  severity: number;             // 0-1
  mitigation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE BRIDGE - Where Personal Truth Meets Market Alpha Meets Content
// ─────────────────────────────────────────────────────────────────────────────

export interface SignalBridge {
  id: string;
  timestamp: number;
  
  // Input
  journal_entries: JournalEntry[];
  market_context: MarketContext[];
  
  // Processed
  journal_analysis: JournalAnalysis[];
  
  // Outputs
  content_briefs: ContentBrief[];
  market_positions: MarketPosition[];
  
  // Cross-pollination insights
  journal_to_market: JournalMarketConnection[];
  market_to_content: MarketContentConnection[];
  unified_thesis: UnifiedThesis;
}

export interface MarketContext {
  market_id: string;
  question: string;
  current_state: PredictionMarket;
  recent_movement: number;
  key_dates: string[];
  related_markets: string[];
}

export interface JournalMarketConnection {
  journal_insight: string;
  market_application: string;
  connection_strength: number;  // 0-1
  actionable: boolean;
  rationale: string;
}

export interface MarketContentConnection {
  market_position: string;
  content_angle: string;
  disclosure_required: boolean;
  audience_interest: number;    // 0-1
  educational_value: number;    // 0-1
}

export interface UnifiedThesis {
  core_belief: string;
  personal_evidence: string[];
  market_evidence: string[];
  content_expression: string;
  conviction_score: number;
  time_horizon: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COGNITIVE AND EMOTIONAL INFRASTRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

export type Emotion = 
  | 'JOY' | 'SADNESS' | 'ANGER' | 'FEAR' | 'DISGUST' | 'SURPRISE'
  | 'ANTICIPATION' | 'TRUST' | 'SHAME' | 'GUILT' | 'ENVY' | 'JEALOUSY'
  | 'LOVE' | 'GRIEF' | 'HOPE' | 'DESPAIR' | 'CONTEMPT' | 'AWE'
  | 'EXCITEMENT' | 'ANXIETY' | 'CONFIDENCE' | 'DOUBT' | 'FRUSTRATION';

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

export interface CognitivePattern {
  pattern_type: 'ALL_OR_NOTHING' | 'CATASTROPHIZING' | 'MIND_READING' | 'FORTUNE_TELLING' | 'EMOTIONAL_REASONING' | 'SHOULD_STATEMENTS' | 'LABELING' | 'PERSONALIZATION';
  instance: string;
  frequency: number;            // How often this appears
  impact: number;               // 0-1, how much it affects reasoning
}

// ─────────────────────────────────────────────────────────────────────────────
// THEORY OF MIND - Extended for Creator/Market Self
// ─────────────────────────────────────────────────────────────────────────────

export interface RecursiveMindState {
  selfAnalysis: string;         // Level 0: What I am thinking/planning
  modelOfOther: string;         // Level 1: What I think the other agent wants
  modelOfOthersModel: string;   // Level 2: What I think the other thinks of ME
}

export interface CreatorMindState {
  // Self-model
  my_authentic_truth: string;
  my_performed_truth: string;
  gap_awareness: number;        // 0-1, how aware am I of the gap?
  
  // Audience model
  what_audience_wants: string;
  what_audience_needs: string;
  what_will_engage: string;
  
  // Meta
  am_i_being_authentic: boolean;
  authenticity_cost: string;    // What am I sacrificing for authenticity?
  performance_cost: string;     // What am I sacrificing for engagement?
}

export interface PredictorMindState {
  // Self-model
  my_thesis: string;
  my_confidence: number;
  my_blind_spots: string[];
  
  // Market model
  what_market_believes: string;
  why_market_might_be_wrong: string;
  what_market_is_missing: string;
  
  // Adversarial self
  best_argument_against_me: string;
  what_would_change_my_mind: string;
  
  // Meta
  am_i_being_rational: boolean;
  emotional_contamination: number;  // 0-1
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER/PERSONA SYSTEM - The User's Multiple Selves
// ─────────────────────────────────────────────────────────────────────────────

export interface UserPersona {
  id: string;
  name: string;
  
  // Identity
  creator_archetype: ContentArchetype;
  market_archetype: MarketArchetype;
  psychological_archetype: PrimaryArchetype;
  
  // Voice
  tone: string;
  vocabulary_level: 'CASUAL' | 'ACCESSIBLE' | 'SOPHISTICATED' | 'TECHNICAL';
  humor_style?: string;
  catchphrases?: string[];
  
  // Brand
  visual_identity: string;
  color_palette: string[];
  content_pillars: string[];    // Core topics
  
  // Constraints
  never_say: string[];
  always_include: string[];
  disclosure_requirements: string[];
}

export interface ArchetypeInfluence {
  archetype: PrimaryArchetype;
  strength: number;             // 0-1, how dominant this archetype is
  integrated: boolean;          // Has this been consciously integrated?
  shadow_aspect: string;        // The dark side of this archetype
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP PSYCHE LAYERS (Preserved from original)
// ─────────────────────────────────────────────────────────────────────────────

export interface UnconsciousLayer {
  core_wound: string;
  deepest_fear: string;
  deepest_desire: string;
  shadow_traits: string[];
  projections: string[];
  dominant_archetype: PrimaryArchetype;
  archetype_constellation: ArchetypeInfluence[];
  repressed_memories: string[];
  defense_mechanisms: DefenseMechanism[];
}

export interface PreconsciousLayer {
  memories_in_reach: string[];
  learned_patterns: string[];
  emotional_associations: Map<string, string>;
  core_beliefs: string[];
  cognitive_distortions: string[];
  attachment_style: 'SECURE' | 'ANXIOUS' | 'AVOIDANT' | 'DISORGANIZED';
  interpersonal_scripts: string[];
}

export interface ConsciousLayer {
  current_focus: string;
  emotional_state: EmotionalState;
  conscious_goals: string[];
  recent_events: string[];
  current_interpretation: string;
  self_awareness_level: number;
  insight: string;
}

export interface EmotionalState {
  primary_emotion: Emotion;
  intensity: number;
  secondary_emotions: Emotion[];
  valence: number;
  arousal: number;
  suppressed_emotion?: Emotion;
  displayed_emotion?: Emotion;
}

export interface Persona {
  public_identity: string;
  social_role: string;
  presentation_style: string;
  hidden_from_others: string[];
  performed_traits: string[];
  speech_patterns: string[];
  typical_phrases: string[];
  communication_style: 'ASSERTIVE' | 'PASSIVE' | 'AGGRESSIVE' | 'PASSIVE_AGGRESSIVE';
}

export interface Character {
  id: string;
  name: string;
  age: number;
  background: string;
  color: string;
  avatar: string;
  unconscious: UnconsciousLayer;
  preconscious: PreconsciousLayer;
  conscious: ConsciousLayer;
  persona: Persona;
  story_role: PrimaryArchetype;
  character_arc: CharacterArc;
  mind_models: Map<string, DeepTheoryOfMind>;
  secretGoal: string;
  mindState: RecursiveMindState;
}

export interface CharacterArc {
  starting_state: string;
  wound_to_heal: string;
  lie_believed: string;
  truth_to_learn: string;
  current_stage: ArcStage;
  transformation_progress: number;
}

export type ArcStage = 
  | 'ORDINARY_WORLD' | 'CALL_TO_ADVENTURE' | 'REFUSAL' | 'MEETING_MENTOR'
  | 'CROSSING_THRESHOLD' | 'TESTS_AND_ALLIES' | 'APPROACH' | 'ORDEAL'
  | 'REWARD' | 'ROAD_BACK' | 'RESURRECTION' | 'RETURN_WITH_ELIXIR';

export interface DeepTheoryOfMind {
  my_conscious_state: string;
  my_hidden_motives: string;
  my_blind_spots: string;
  their_apparent_goals: string;
  their_suspected_secrets: string;
  their_perceived_emotions: string;
  their_suspected_wounds: string;
  how_they_see_me: string;
  what_they_suspect_about_me: string;
  their_emotional_reaction_to_me: string;
  what_they_think_i_think_of_them: string;
  am_i_projecting: string;
  are_they_projecting: string;
  leverage_points: string;
  vulnerabilities_exposed: string;
  trust_level: number;
  deception_detected: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NARRATIVE/SCENE STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

export interface NarrativeState {
  world: WorldState;
  theme: string;
  central_conflict: string;
  characters: Character[];
  relationships: Relationship[];
  current_scene: Scene;
  scene_history: Scene[];
  story_beats: StoryBeat[];
  tension_level: number;
  dramatic_question: string;
  symbols: Symbol[];
  motifs: string[];
}

export interface WorldState {
  setting: string;
  time_period: string;
  atmosphere: string;
  rules: string[];
  constraints: string[];
}

export interface Relationship {
  character_a_id: string;
  character_b_id: string;
  type: RelationshipType;
  power_balance: number;
  intimacy_level: number;
  conflict_level: number;
  trust_a_to_b: number;
  trust_b_to_a: number;
  shared_history: string;
  unresolved_tensions: string[];
  secrets_between: string[];
  dynamic_pattern: string;
}

export type RelationshipType = 
  | 'ALLY' | 'ADVERSARY' | 'LOVER' | 'FAMILY' | 'MENTOR_STUDENT'
  | 'RIVALS' | 'STRANGERS' | 'FORMER_LOVERS' | 'SHADOW_SELF';

export interface Scene {
  id: string;
  title: string;
  setting: string;
  characters_present: string[];
  scene_goal: string;
  conflict: string;
  stakes: string;
  beats: SceneBeat[];
  starting_emotion: string;
  ending_emotion: string;
  turn: string;
  resolution: string;
  consequences: string[];
  revelations: string[];
  projections_occurred: ProjectionEvent[];
  beliefs_challenged: BeliefChallenge[];
  shadows_touched: ShadowTouch[];
}

export interface SceneBeat {
  character_id: string;
  action_type: 'DIALOGUE' | 'ACTION' | 'INTERNAL' | 'REACTION';
  content: string;
  subtext: string;
  conscious_intent: string;
  unconscious_driver: string;
  perceived_as: string;
  actual_effect: string;
}

export interface StoryBeat {
  id: string;
  type: StoryBeatType;
  description: string;
  characters_involved: string[];
  psychological_function: string;
  completed: boolean;
}

export type StoryBeatType = 
  | 'SETUP' | 'INCITING_INCIDENT' | 'RISING_ACTION' | 'COMPLICATION'
  | 'REVELATION' | 'CONFRONTATION' | 'CLIMAX' | 'FALLING_ACTION'
  | 'RESOLUTION' | 'DENOUEMENT';

export interface ProjectionEvent {
  projector_id: string;
  recipient_id: string;
  projected_trait: string;
  actual_owner: 'PROJECTOR' | 'RECIPIENT' | 'BOTH';
  conscious_awareness: boolean;
  narrative_impact: string;
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
  meaning_conscious: string;
  meaning_unconscious: string;
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
  subtext?: string;
  emotional_tone?: Emotion;
  defense_active?: DefenseMechanism;
}

export interface SimulationConfig {
  aliceGoal: string;
  bobGoal: string;
  context: string;
}

export type Turn = 'ALICE' | 'BOB';

export interface NarrativeConfig {
  mode: 'DIALOGUE' | 'SCENE' | 'STORY';
  theme: string;
  genre: Genre;
  tone: Tone;
  characters: CharacterSeed[];
  setting: string;
  time_period: string;
  psychological_depth: number;
  archetype_strength: number;
  symbolism_density: number;
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

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SystemConfig {
  mode: 'JOURNAL_TO_CONTENT' | 'JOURNAL_TO_PREDICTION' | 'BRIDGE_MODE' | 'NARRATIVE_MODE';
  
  // Content generation settings
  content_style: ContentArchetype;
  platform_target: PlatformSpec['platform'];
  
  // Prediction settings
  market_style: MarketArchetype;
  risk_tolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'DEGEN';
  
  // Privacy
  anonymization_level: 'NONE' | 'LIGHT' | 'HEAVY' | 'FULL';
  market_disclosure: boolean;
  
  // Processing
  psychological_depth: number;  // 0-1
  adversarial_intensity: number; // 0-1
}
