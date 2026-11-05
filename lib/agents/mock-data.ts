import type { AgentName } from './types';

export function getMockAgentOutput(agentName: AgentName): unknown {
  switch (agentName) {
    case 'menu-analyst':
      return {
        items: [
          {
            id: 'item-1',
            name: 'Pioneer Signature Drip',
            temperature: 'hot',
            priceTier: 'budget',
            isSignature: true,
            notes: 'High-margin daily roast, top volume seller',
          },
          {
            id: 'item-2',
            name: 'Micro-Lot Pour Over',
            temperature: 'hot',
            priceTier: 'premium',
            isSignature: true,
            notes: 'Single-origin rotating specialty coffee',
          },
          {
            id: 'item-3',
            name: 'Slow-Drip Kyoto Cold Brew',
            temperature: 'cold',
            priceTier: 'mid',
            isSignature: false,
            notes: '18-hour cold immersion extraction',
          },
          {
            id: 'item-4',
            name: 'Cardamom Vanilla Bean Latte',
            temperature: 'hot',
            priceTier: 'mid',
            isSignature: true,
            notes: 'House-made spiced syrup specialty',
          },
        ],
        totals: {
          hot: 3,
          cold: 1,
          neutral: 0,
        },
        observations: [
          'High concentration of premium hot espresso and pour-over items',
          'Single-origin beans have strong 80%+ margin profile',
          'Cold beverage lineup is compact and easy to adjust',
        ],
      };

    case 'weather-analyst':
      return {
        headline: 'Cool and overcast with brisk breeze across Seattle',
        tempBucket: 'cool',
        precipitation: 'light',
        comfortIndex: 'uncomfortable',
        consumerSignals: [
          'Cool morning air drives strong preference for warm comforting beverages',
          'Overcast conditions push foot traffic toward cozy indoor cafe seating',
        ],
        expectedDemandShift: {
          hotItems: 'up',
          coldItems: 'down',
          food: 'up',
          dessert: 'flat',
        },
      };

    case 'strategist':
      return {
        actions: [
          {
            itemId: 'item-1',
            itemName: 'Pioneer Signature Drip',
            action: 'promote',
            priority: 1,
            reason: 'Capitalize on morning commuter rush and cool weather demand.',
          },
          {
            itemId: 'item-4',
            itemName: 'Cardamom Vanilla Bean Latte',
            action: 'promote',
            priority: 2,
            reason: 'High margin signature latte perfect for cool overcast Seattle morning.',
          },
          {
            itemId: 'item-3',
            itemName: 'Slow-Drip Kyoto Cold Brew',
            action: 'hold',
            priority: 3,
            reason: 'Chilled beverage demand softened by cool temperatures.',
          },
        ],
        summary:
          'Prioritize warm signature espresso and house drip roasts while holding cold brew promotions.',
        confidence: 'high',
      };

    case 'critic':
      return {
        approved: true,
        overallNotes:
          'Strategy correctly emphasizes high-margin warm beverages aligned with current temperature trends.',
        issues: [
          {
            severity: 'info',
            message: 'Ensure morning milk and oat milk stock is prepped for increased latte volume.',
          },
        ],
        suggestedRevisions: [],
      };

    case 'synthesizer':
      return {
        headline: 'Overcast Seattle Morning: Feature Signature Pour-Overs & Spiced Lattes',
        briefingMarkdown: `## Today's Weather Snapshot
Cool (12°C) and overcast with light breeze. Unfavorable for iced drinks; ideal for warm comfort beverages.

## What To Promote
- **Cardamom Vanilla Bean Latte**: Feature on the front counter chalkboard as today's barista special.
- **Pioneer Signature Drip**: Quick-service commuter special to capture morning foot traffic.

## What To Hold
- **Slow-Drip Kyoto Cold Brew**: Maintain standard menu presence without promotional callouts.

## Why
1. Cool temperatures drive over 70% of morning drink orders toward hot espresso.
2. Spiced lattes deliver an 82% gross margin, maximizing revenue per ticket.
3. Competitor Anchorhead has no featured warm spiced drinks today.`,
        finalConfidence: 'high',
      };

    case 'competitor-parser':
      return {
        brand: 'Anchorhead Coffee',
        items: [
          {
            name: 'Quake Cold Brew',
            category: 'cold drinks',
            price: 5.5,
            currency: 'USD',
            description: 'Heavy body cold brew with dark chocolate notes',
            isPromo: false,
          },
          {
            name: 'Seasonal Single Origin Pour Over',
            category: 'hot drinks',
            price: 6.5,
            currency: 'USD',
            description: 'Direct trade washed Ethiopian Yirgacheffe',
            isPromo: false,
          },
        ],
        promos: [
          {
            text: 'Morning Pastry Bundle: $2 off any bakery item with large specialty drink',
            discountPercent: 15,
            validUntil: '11:00 AM',
          },
        ],
        notes: [
          'Anchorhead charges $6.50 for single origin pour-overs',
          'Active morning food bundle promotion',
        ],
      };

    case 'competitor-analyst':
      return {
        competitors: [
          {
            brand: 'Anchorhead Coffee',
            totalItems: 12,
            priceRange: { min: 4.5, max: 7.0, average: 5.8 },
            categories: ['Espresso', 'Pour Over', 'Cold Drinks', 'Bakery'],
            activePromos: 1,
            promoHighlights: ['$2 off morning bakery bundle with large drink'],
            strengths: ['Strong brand recognition in Pike Place & Downtown'],
            weaknesses: ['Premium price point ($6.50 pour over) allows margin undercut'],
          },
        ],
        priceComparison: {
          ourCheaperCount: 3,
          theirCheaperCount: 1,
          samePriceCount: 2,
          biggestGap: {
            ourItem: 'Micro-Lot Pour Over',
            theirItem: 'Seasonal Single Origin Pour Over',
            difference: 1.0,
          },
        },
        promoIntelligence: [
          {
            competitor: 'Anchorhead Coffee',
            promo: 'Morning Pastry Bundle',
            discountPercent: 15,
            threat: 'medium',
          },
        ],
        opportunities: [
          'Highlight our $5.50 micro-lot pour over as superior craftsmanship at better value than Anchorhead ($6.50)',
          'Counter their morning bundle by highlighting artisan scone pairings',
        ],
        threats: [
          'Anchorhead morning bakery bundle may draw commuter traffic seeking breakfast',
        ],
        recommendations: [
          'Feature micro-lot pour over at $5.50 on counter display',
          'Maintain espresso drink pricing while emphasizing single-origin quality',
        ],
      };

    default:
      throw new Error(`No mock output defined for agent: ${agentName}`);
  }
}
