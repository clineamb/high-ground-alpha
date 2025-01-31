/** @type {import('./$types').PageLoad} */
import { supabase } from "$lib/supabaseClient";

export async function load({ url }) {
  const gameId =  url.searchParams.get('gameid') || 1;
  const result = await Promise.all([
    supabase.from("moves").select(),
    supabase.from("game").select().eq('id', gameId)
  ]);
  const [movesRes, gameRes] = result;
  return {
    'moves': movesRes.data ?? [],
    'game': gameRes.data[0] ?? {}
  };
}
