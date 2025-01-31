import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import qs from '$lib/utils/querystr';

export async function POST({ request, cookies }) {
  const clientData = await request.json();
  const { action } = clientData;
  let resError = null;

  if(action === 'make-move') {
    console.log('>> clientData', clientData);
    const makeMoveRes = await supabase
      .from('moves')
      .insert(clientData.moveData)
      .select();

    if(!makeMoveRes.error) {
      return json(makeMoveRes.data, { status: 201 });
    }
    resError = makeMoveRes.error;
  }

  if(action === 'start-game') {
    const { data, error } = await supabase
      .from('game')
      .update({ 'game_started': true })
      .eq('id', 1);

    if(!error) {
      console.log('>> start-game data', data);
      return json({ 'started': true }, { status: 201 });
    }
    resError = error;
  }

  if(action === 'next-round') {
    const { data, error } = await supabase
      .rpc('increment_current_round', { game_id: 1 });
    if(!error) {
      return json({ 'started': true }, { status: 201 });
    }
    resError = error;
  }

  if(action === 'add-player') {
    const playerSelect = await supabase
      .from('game')
      .select('players')
      .eq('id', 1)
      .limit(1)
      .single();
    
    let newPlayers = '';
    const pData = playerSelect.data;
    if(!pData.players) {
      newPlayers = clientData.playerName;
    } else if(pData.players.indexOf(clientData.playerName) < 0) {
      newPlayers = pData.players + ',' + clientData.playerName;
    } else {
      newPlayers = pData.players;
    }

    const upData = await supabase
      .from('game')
      .update({ 'players': newPlayers })
      .eq('id', 1);

    if(!upData.error) {
      return json({ ...upData.data }, { status: 201 });
    }
    resError = upData.error;
  }

  if(action === 'get-moves') {
    const movesRes = await supabase
      .from('moves')
      .select()
      .eq('round', parseInt(clientData.current_round));


    console.log('>> HELLO????', movesRes);

    if(!movesRes.error) {
      return json({ 'data': movesRes.data }, { status: 201 });
    }
    movesRes = movesRes.error;
  }

  if(resError) {
    return json(resError, { status: 201 }); // whatever
  }

  return json(moveData, { status: 201 });
}
