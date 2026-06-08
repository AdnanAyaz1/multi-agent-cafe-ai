export interface ImpactMessages {
  high: string;
  medium: string;
  low: string;
}

export type ImpactLevel = 'high' | 'medium' | 'low';

export const IMPACT_MESSAGES: ImpactMessages = {
  high: 'Significant weather impact detected. Adjust menu availability and staffing accordingly.',
  medium: 'Moderate conditions. Consider seasonal promotions and indoor seating focus.',
  low: 'Favorable conditions. Maximize outdoor seating and cold beverage promotions.',
};

export function getImpactLevel(condition: string): ImpactLevel {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('snow') || lower.includes('storm')) return 'high';
  if (lower.includes('cloud') || lower.includes('overcast')) return 'medium';
  return 'low';
}
