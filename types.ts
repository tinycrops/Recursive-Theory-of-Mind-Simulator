export interface RecursiveMindState {
  selfAnalysis: string;         // Level 0: What I am thinking/planning
  modelOfOther: string;         // Level 1: What I think the other agent wants/is like
  modelOfOthersModel: string;   // Level 2: What I think the other agent thinks of ME
}

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
}

export interface SimulationConfig {
  aliceGoal: string;
  bobGoal: string;
  context: string;
}

export type Turn = 'ALICE' | 'BOB';
