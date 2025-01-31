import { supabase } from '$lib/supabaseClient';

export async function makeMove() {
  const { data, error } = await supabase
    .from('moves')
    .insert({
      'move': moveName,
      'player': playerName,
      'game_id': 1
    })
    .select();

  if(!error) {
    return data;
  }
  return error;
}