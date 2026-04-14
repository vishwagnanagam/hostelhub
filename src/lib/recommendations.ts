import type { Hostel, SearchFilters } from './types';

export interface RecommendationScore {
  hostel: Hostel;
  score: number;
  reasons: string[];
}

export function getRecommendations(
  hostels: Hostel[],
  filters: Partial<SearchFilters>,
  budget?: number,
  preferAC?: boolean,
  preferFood?: boolean,
  preferWifi?: boolean
): RecommendationScore[] {
  return hostels
    .map((hostel) => {
      let score = 0;
      const reasons: string[] = [];

      score += hostel.rating * 10;

      if (budget) {
        if (hostel.price <= budget) {
          const savingsRatio = (budget - hostel.price) / budget;
          score += savingsRatio * 20;
          if (hostel.price <= budget * 0.8) {
            reasons.push('Great value within your budget');
          } else {
            reasons.push('Fits your budget');
          }
        } else {
          score -= ((hostel.price - budget) / budget) * 30;
        }
      }

      if (preferAC && hostel.type === 'AC') {
        score += 15;
        reasons.push('AC rooms available');
      }

      if (preferFood && hostel.facilities?.food) {
        score += 12;
        reasons.push('Meals included');
      }

      if (preferWifi && hostel.facilities?.wifi) {
        score += 8;
        reasons.push('High-speed WiFi');
      }

      if (hostel.facilities?.security) {
        score += 6;
        reasons.push('24/7 security');
      }

      if (hostel.hygiene_score >= 8.5) {
        score += 10;
        reasons.push('Excellent hygiene rating');
      } else if (hostel.hygiene_score >= 7.5) {
        score += 6;
        reasons.push('Good hygiene standards');
      }

      if (hostel.available_rooms > 0) {
        score += 5;
      } else {
        score -= 20;
      }

      if (filters.city && hostel.city.toLowerCase() === filters.city.toLowerCase()) {
        score += 10;
      }

      return { hostel, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}
