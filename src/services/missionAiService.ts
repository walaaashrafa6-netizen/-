import { processMissionAIQuery, MissionAIContext } from '../utils/astraMissionAI';

export function generateMissionAIResponse(query: string, context: Partial<MissionAIContext> = {}) {
  return processMissionAIQuery(query, context);
}
