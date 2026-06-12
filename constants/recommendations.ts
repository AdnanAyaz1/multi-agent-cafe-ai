export interface RecommendationItem {
  action: string;
  reason: string;
  impact: string;
  type: 'auto' | 'review';
}

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    action: 'Raise iced latte price by $0.75',
    reason: 'Peak demand window — hot weather forecast',
    impact: '+18% rev',
    type: 'auto',
  },
  {
    action: 'Promote cold brew on social media',
    reason: 'Competitor out of stock until Thursday',
    impact: '+12% rev',
    type: 'review',
  },
  {
    action: 'Bundle pastry + iced tea combo',
    reason: 'Low-margin pastry stock needs clearing',
    impact: '+9% rev',
    type: 'auto',
  },
  {
    action: 'Hold current espresso pricing',
    reason: 'No competitive pressure, stable demand',
    impact: 'neutral',
    type: 'auto',
  },
];
