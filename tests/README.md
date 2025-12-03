# Theory of Mind Simulator - Test Scenarios

This directory contains test scenarios and a runner script for the Recursive Theory of Mind Simulator.

## Quick Start

```bash
# List all available scenarios
npm run test:scenarios:list

# Run all scenarios
npm run test:scenarios

# Run a specific scenario
npm run test:scenario -- car-negotiation

# Run scenarios by category
npx tsx tests/runScenarios.ts --category negotiation
```

## Prerequisites

Make sure you have the Gemini API key set:

```bash
export GEMINI_API_KEY=your-api-key
# OR
export API_KEY=your-api-key
```

## Scenarios

The test suite includes 12 scenarios across various categories:

| ID | Name | Category | Turns |
|----|------|----------|-------|
| car-negotiation | Classic Car Negotiation | negotiation | 6 |
| salary-negotiation | Salary Negotiation | negotiation | 8 |
| diplomatic-crisis | Diplomatic Crisis | diplomacy | 6 |
| poker-bluff | High Stakes Poker Discussion | deception | 6 |
| startup-partnership | Startup Partnership Negotiation | business | 8 |
| apartment-rental | Apartment Rental Negotiation | negotiation | 6 |
| job-interview | Job Interview | interview | 8 |
| political-debate | Political Debate | debate | 6 |
| family-inheritance | Family Inheritance Discussion | family | 8 |
| art-auction | Art Dealer Negotiation | business | 6 |
| spy-exchange | Spy Information Exchange | espionage | 6 |
| therapy-session | Couples Therapy Session | relationship | 8 |

### Categories

- **negotiation** - Price and term negotiations
- **diplomacy** - International relations and conflict resolution
- **deception** - Bluffing and misdirection
- **business** - Corporate deals and partnerships
- **interview** - Job interviews with hidden agendas
- **debate** - Public discourse and rhetoric
- **family** - Emotional and inheritance disputes
- **espionage** - Intelligence exchange scenarios
- **relationship** - Interpersonal dynamics

## Output

Results are saved to `tests/results/run-YYYY-MM-DD-HH-MM-SS/`:

- `SUMMARY.md` - Overview of all scenario results
- `all-results.json` - Complete JSON data for all scenarios
- `[scenario-id].json` - Individual scenario JSON data
- `[scenario-id].md` - Human-readable markdown transcript

### Sample Output Structure

```
tests/results/
└── run-2024-03-15-14-30-22/
    ├── SUMMARY.md
    ├── all-results.json
    ├── car-negotiation.json
    ├── car-negotiation.md
    ├── salary-negotiation.json
    ├── salary-negotiation.md
    └── ...
```

## Adding New Scenarios

Edit `scenarios.json` to add new test scenarios:

```json
{
  "id": "unique-scenario-id",
  "name": "Display Name",
  "description": "Brief description of the scenario",
  "context": "Shared context that both agents know",
  "aliceGoal": "Alice's secret goal and strategy",
  "bobGoal": "Bob's secret goal and strategy",
  "turns": 6,
  "category": "negotiation"
}
```

### Scenario Design Tips

1. **Conflicting Goals**: Each agent should have goals that create tension
2. **Information Asymmetry**: Give each agent unique knowledge or suspicions
3. **Strategic Deception**: Include incentives to hide true intentions
4. **Clear Win Conditions**: Goals should be specific enough to evaluate success

## Understanding the Output

Each turn in the output includes:

1. **Message**: The spoken dialogue between agents
2. **Self Analysis**: Internal monologue about strategy and goal progress
3. **Model of Other**: What the agent believes about the other's goals
4. **Model of Other's Model**: What the agent believes the other thinks about them

This recursive structure demonstrates second-order Theory of Mind:
- Level 0: "I think X"
- Level 1: "I think you think Y"
- Level 2: "I think you think I think Z"
