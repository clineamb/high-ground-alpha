/** @type {import('./$types').PageLoad} */
import { supabase } from "$lib/supabaseClient";

export async function load({ url }) {
  const gameId =  url.searchParams.get('gameid') || 1;

  const gameRes = await supabase
    .from('game')
    .select()
    .eq('id', gameId)
    .limit(1)
    .single();
  
  const movesRes = await supabase
    .from('moves')
    .select()
    .eq('round', parseInt(gameRes.data.current_round));

  return {
    'moves': movesRes.data ?? [],
    'game': gameRes.data ?? {}
  };
}
