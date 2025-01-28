import { supabase } from '$lib/supabaseClient';

export async function makeMove({ moveName }) {
  const { data, error } = await supabase
    .from('moves')
    .insert({
      'move': moveName,
      'player': 'beeb',
      'game_id': 1
    })
    .select();

  if(!error) {
    return data;
  }
  return error;
}