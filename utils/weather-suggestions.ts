import type { WeatherData } from '@/lib/types';

export interface WeatherSuggestion {
  city: string;
  weather: WeatherData;
  headline: string;
  strategy: string;
  actionableTactic: string;
  recommendedDiscount: string;
  impactLevel: 'high' | 'medium' | 'low';
  tag: string;
  suggestedItems: string[];
}

export function generateWeatherSuggestion(weather: WeatherData): WeatherSuggestion {
  const cond = weather.condition.toLowerCase();
  const temp = weather.temperature;

  // Rain / Storm / Snow
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('thunder')) {
    return {
      city: weather.city,
      weather,
      headline: 'Rainy Day Comfort Surge',
      strategy: 'Incentivize indoor dwell time and warm drink cravings to offset slower foot traffic.',
      actionableTactic: 'Launch "Rainy Day Sanctuary": 15% off Cinnamon Spiced Lattes, Hot Mochas, and Warm Artisan Pastries for dine-in guests.',
      recommendedDiscount: '15% Off Warm Combos',
      impactLevel: 'high',
      tag: 'Rain Response',
      suggestedItems: ['Cinnamon Spiced Latte', 'Salted Caramel Hot Cocoa', 'Warm Butter Croissant', 'Tomato Basil Soup'],
    };
  }

  if (cond.includes('snow') || temp <= 5) {
    return {
      city: weather.city,
      weather,
      headline: 'Cold Freeze Warmer Special',
      strategy: 'Capitalize on extreme cold by positioning your cafe as an ultra-warm refuge.',
      actionableTactic: 'Promote "Warm Up Bundle": Free extra espresso shot or complimentary whipped cream on all signature hot drinks + hot lunch melts.',
      recommendedDiscount: 'Free Extra Espresso Shot / 20% on Soup Melts',
      impactLevel: 'high',
      tag: 'Cold Wave',
      suggestedItems: ['Double Dark Mocha', 'Spiced Chai Latte', 'Artisan Grilled Cheese', 'Warm Clam Chowder'],
    };
  }

  // Hot / Heatwave (> 24°C)
  if (temp >= 24) {
    return {
      city: weather.city,
      weather,
      headline: 'High-Temperature Refresher Push',
      strategy: 'Drive afternoon volume with high-margin iced espresso beverages, cold brews, and botanical lemonades.',
      actionableTactic: 'Activate "Beat the Heat 2-5 PM": Buy 1 Cold Brew or Iced Matcha, get the second at 50% off. Perfect for afternoon coworker runs.',
      recommendedDiscount: 'Buy 1, Get 2nd 50% Off on Iced Drinks',
      impactLevel: 'high',
      tag: 'Heatwave',
      suggestedItems: ['Nitro Cold Brew', 'Iced Strawberry Matcha Latte', 'Yuzu Mint Cold Sparkler', 'Acai Berry Bowl'],
    };
  }

  // Mild & Sunny (15°C – 23°C)
  if (cond.includes('sun') || cond.includes('clear')) {
    return {
      city: weather.city,
      weather,
      headline: 'Sunny Day Patio & Grab-and-Go Rush',
      strategy: 'Foot traffic is peaking. Maximize transaction speed and push bundled outdoor snack pairings.',
      actionableTactic: 'Offer "Sunny Afternoon Pairing": $2 off any iced beverage when paired with a fresh bakery item or wrap. Open outdoor patio seating.',
      recommendedDiscount: '$2 Off Beverage + Pastry Combo',
      impactLevel: 'medium',
      tag: 'Sunny Peak',
      suggestedItems: ['Iced Vanilla Bean Latte', 'Cold Brew Tonic', 'Lemon Poppy Seed Muffin', 'Avocado Toast'],
    };
  }

  // Overcast / Cloudy / Default
  return {
    city: weather.city,
    weather,
    headline: 'Midday Slump Revitalizer',
    strategy: 'Gray skies induce afternoon lethargy. Convert passive passersby with an afternoon caffeine pick-me-up.',
    actionableTactic: 'Run "Afternoon Spark": Double loyalty points or $1 off all specialty flat whites and pour-overs from 1:00 PM to 4:00 PM.',
    recommendedDiscount: '$1 Off Specialty Pour-Overs & Flat Whites',
    impactLevel: 'medium',
    tag: 'Cloudy Slump',
    suggestedItems: ['Flat White', 'Single-Origin Pour Over', 'Cardamom Bun', 'Almond Croissant'],
  };
}
