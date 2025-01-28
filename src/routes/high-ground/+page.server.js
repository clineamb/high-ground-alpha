/** @type {import('./$types').PageLoad} */
import { supabase } from "$lib/supabaseClient";

export async function load() {
  const result = await supabase.from("moves").select();
  const { data } = result;
  return {
    moves: data ?? [],
  };
}
