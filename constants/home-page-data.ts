import type { RecentRun } from '@/types/dashboard';

export const MOCK_RECOMMENDATION = {
  summary:
    'Rainy forecast with 85% humidity calls for a Hot Chocolate push. Historical data shows 2.3x sales spike in similar conditions. Bundle with pastry discounts to increase average order value.',
  confidence: 94,
  actions: [
    'Feature Hot Chocolate as today\'s special with 15% bundle discount',
    'Activate "Rainy Day Combo" promotion on digital menu boards',
    'Increase cold brew inventory prep for afternoon clearance window',
    'Notify staff of expected 2 PM rush for indoor seating turnaround',
  ],
};

export const MOCK_PRIORITY_ACTIONS = [
  'Activate Hot Chocolate promotional pricing',
  'Update digital menu boards with rainy day specials',
  'Brief baristas on afternoon rush protocol',
];

export const MOCK_RECENT_RUNS: RecentRun[] = [
  { id: '1', businessId: 'cafe-001', status: 'complete', completedAt: '2 hours ago' },
  { id: '2', businessId: 'cafe-002', status: 'complete', completedAt: '5 hours ago' },
  { id: '3', businessId: 'cafe-003', status: 'failed', completedAt: 'Yesterday' },
];
