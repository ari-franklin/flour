import { supabase } from '../lib/supabase';
import { Outcome } from '../types';

// In-memory cache for ID mappings
let idMappings: {
  objectives?: Record<string, string>;
  outcomes?: Record<string, string>;
  bets?: Record<string, string>;
  metrics?: Record<string, string>;
} = {};

/**
 * Converts a frontend ID (e.g., 'outcome-1') to a Supabase UUID
 * Uses in-memory cache if available, otherwise falls back to development mappings
 */
export const toSupabaseId = async (
  type: 'objective' | 'outcome' | 'bet' | 'metric', 
  id?: string
): Promise<string> => {
  // If the ID is already a UUID, return it as is
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }

  if (!id) {
    throw new Error(`ID is required for type: ${type}`);
  }

  // Check if we have a cached mapping
  const cachedId = idMappings[`${type}s` as keyof typeof idMappings]?.[id];
  if (cachedId) {
    return cachedId;
  }

  // Development mapping - can be replaced with a database call in production
  type Mappings = {
    [key: string]: { [key: string]: string };
  };

  const devMappings: Mappings = {
    objectives: {
      'objective-1': '7c21354d-47e5-9e5c-0d83-615398ce3d16', // Improve User Experience
      'objective-2': '1a8caef0-a4c1-e345-65f7-4b700ee9d958'  // Expand Market Reach
    },
    outcomes: {
      'outcome-1': 'b11ef646-6514-ee66-0be4-2edf2becc07d',  // Enhance Mobile Experience
      'outcome-2': '224047b0-ec9c-cae3-8a07-f9296e1ab2d5',  // Reduce Page Load Time
      'outcome-3': '531ae664-2a6d-af20-5e0c-5a09ab03b105'   // Launch in European Market
    },
    bets: {
      'bet-1': 'f3a83a2d-831e-c59c-5778-b5e108952453',      // Redesign mobile navigation
      'bet-2': '7c67201f-2215-e9c6-9597-3bf610b537e7',      // Add onboarding tutorial
      'bet-3': 'f8386242-2542-3c6f-8bac-258cbb10eb89',      // Optimize image assets
      'bet-4': '8687c9df-4c6b-acb8-8bfa-493c7de4860d'       // Localize content for Germany
    },
    metrics: {
      'metric-1': 'd410bb39-86ed-00c4-36e6-8a133837a9ee',  // Mobile App Rating
      'metric-2': 'f29945c6-ce0d-9972-13de-b9d307f5034a',   // Mobile Session Duration
      'metric-3': '37944626-6bbc-fcaa-b3a0-0f979df447d2'    // Page Load Time
    }
  };

  const typeKey = `${type}s`;
  const typeMappings = devMappings[typeKey];
  const mappedId = typeMappings ? typeMappings[id] : undefined;
  
  if (!mappedId) {
    throw new Error(`No mapping found for ${type} with ID: ${id}`);
  }

  // Cache the mapping for future use
  if (!idMappings[`${type}s` as keyof typeof idMappings]) {
    idMappings[`${type}s` as keyof typeof idMappings] = {};
  }
  idMappings[`${type}s` as keyof typeof idMappings]![id] = mappedId;

  return mappedId;
};

interface GetOutcomeWithMetricsResult {
  outcome: Outcome | null;
  error: Error | null;
}

/**
 * Helper function to handle Supabase errors consistently
 */
const handleSupabaseError = (error: any, context: string): Error => {
  console.error(`Supabase error in ${context}:`, error);
  return new Error(error.message || `Error in ${context}`);
};

/**
 * Fetches an outcome by ID along with its metrics and related bets
 */
export const getOutcomeWithMetrics = async (outcomeId: string): Promise<GetOutcomeWithMetricsResult> => {
  console.log(`[getOutcomeWithMetrics] Fetching outcome with ID: ${outcomeId}`);
  
  try {
    // 1. Convert the frontend ID to a Supabase UUID
    const supabaseOutcomeId = await toSupabaseId('outcome', outcomeId);
    console.log(`[getOutcomeWithMetrics] Converted frontend ID '${outcomeId}' to Supabase UUID '${supabaseOutcomeId}'`);
    
    // 2. Fetch the outcome
    console.log(`[getOutcomeWithMetrics] Fetching outcome from database`);
    const { data: outcomeData, error: outcomeError } = await supabase
      .from('outcomes')
      .select('*')
      .eq('id', supabaseOutcomeId)
      .single();

    if (outcomeError) {
      console.error('[getOutcomeWithMetrics] Error fetching outcome:', outcomeError);
      throw handleSupabaseError(outcomeError, 'fetching outcome');
    }
    
    if (!outcomeData) {
      console.error(`[getOutcomeWithMetrics] No outcome found with ID: ${outcomeId}`);
      return { 
        outcome: null, 
        error: new Error(`Outcome not found with ID: ${outcomeId}`) 
      };
    }

    console.log(`[getOutcomeWithMetrics] Fetched outcome:`, outcomeData);

    // 2. Fetch the objective for this outcome
    console.log(`[getOutcomeWithMetrics] Fetching objective for outcome`);
    const supabaseObjectiveId = outcomeData.objective_id;
    console.log(`[getOutcomeWithMetrics] Fetching objective with ID: ${supabaseObjectiveId}`);
    
    const { data: objectiveData, error: objectiveError } = await supabase
      .from('objectives')
      .select('id, title')
      .eq('id', supabaseObjectiveId)
      .single();

    if (objectiveError) {
      console.error('[getOutcomeWithMetrics] Error fetching objective:', objectiveError);
      throw handleSupabaseError(objectiveError, 'fetching objective');
    }

    console.log(`[getOutcomeWithMetrics] Fetched objective:`, objectiveData);

    // 3. Fetch all metrics for this outcome
    console.log(`[getOutcomeWithMetrics] Fetching metrics for outcome`);
    const { data: outcomeMetrics, error: metricsError } = await supabase
      .from('metrics')
      .select('*')
      .eq('parent_type', 'outcome')
      .eq('parent_id', supabaseOutcomeId); // Use the converted UUID

    if (metricsError) {
      console.error('[getOutcomeWithMetrics] Error fetching outcome metrics:', metricsError);
      throw handleSupabaseError(metricsError, 'fetching outcome metrics');
    }

    console.log(`[getOutcomeWithMetrics] Fetched ${outcomeMetrics?.length || 0} metrics for outcome`);

    // 4. Fetch all bets for this outcome
    console.log(`[getOutcomeWithMetrics] Fetching bets for outcome`);
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('outcome_id', supabaseOutcomeId); // Use the converted UUID

    if (betsError) {
      console.error('[getOutcomeWithMetrics] Error fetching bets:', betsError);
      throw handleSupabaseError(betsError, 'fetching bets');
    }

    console.log(`[getOutcomeWithMetrics] Fetched ${bets?.length || 0} bets for outcome`);

    // 5. For each bet, fetch its metrics
    const betsWithMetrics = [];
    if (bets && bets.length > 0) {
      console.log(`[getOutcomeWithMetrics] Fetching metrics for ${bets.length} bets`);
      
      for (const bet of bets) {
        try {
          const { data: betMetrics, error: betMetricsError } = await supabase
            .from('metrics')
            .select('*')
            .eq('parent_type', 'bet')
            .eq('parent_id', bet.id);

          if (betMetricsError) {
            console.error(`[getOutcomeWithMetrics] Error fetching metrics for bet ${bet.id}:`, betMetricsError);
            // Continue with other bets even if one fails
            continue;
          }

          betsWithMetrics.push({
            ...bet,
            metrics: betMetrics || [],
          });
          
          console.log(`[getOutcomeWithMetrics] Fetched ${betMetrics?.length || 0} metrics for bet ${bet.id}`);
        } catch (err) {
          console.error(`[getOutcomeWithMetrics] Error processing bet ${bet.id}:`, err);
          // Continue with other bets even if one fails
          continue;
        }
      }
    }

    // 6. Assemble the complete outcome object
    const outcome: Outcome = {
      ...outcomeData,
      objective: objectiveData ? { 
        id: objectiveData.id, 
        title: objectiveData.title 
      } : undefined,
      metrics: outcomeMetrics || [],
      bets: betsWithMetrics,
    };

    return { outcome, error: null };
  } catch (error) {
    console.error('Error fetching outcome with metrics:', error);
    return { 
      outcome: null, 
      error: error instanceof Error ? error : new Error('Failed to fetch outcome') 
    };
  }
};

/**
 * Fetches all outcomes for a specific objective
 */
export const getOutcomesByObjectiveId = async (objectiveId: string) => {
  try {
    const supabaseObjectiveId = await toSupabaseId('objective', objectiveId);
    const { data, error } = await supabase
      .from('outcomes')
      .select('*')
      .eq('objective_id', supabaseObjectiveId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching outcomes by objective ID:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error('Failed to fetch outcomes') 
    };
  }
};
