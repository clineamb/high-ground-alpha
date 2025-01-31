import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import qs from '$lib/utils/querystr';

/*
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
*/

export async function POST({ request, cookies }) {
  const clientData = await request.json();
  const { action } = clientData;
  let resError = null;

  if(action === 'make-move') {
    let { moveName, playerName } = clientData;
    const { data, error } = await supabase
      .from('moves')
      .insert({
        'move': moveName,
        'player': playerName,
        'game_id': 1 //lol
      })
      .select();

    if(!error) {
      return json(data, { status: 201 });
    }
    resError = error;
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
    } else if(pData.players.indexOf(clientData.playerName) > -1) {
      newPlayers = pData.players + ',' + clientData.playerName;
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

  if(resError) {
    return json(resError, { status: 201 }); // whatever
  }

  return json(moveData, { status: 201 });
}

export async function GET({ request, cookies }) {
  const queryStr = qs.getQueryString(request.url);
  const queryParams = qs.queryStringToObject(queryStr);
  let error = null;
  let { action = null } = queryParams;

  if(action) {
    // do get stuff if you need to...
  }

  if(error) {
    // shouldn't be 201 w/e
    return json(error, { status: 201 });
  }

  return json({'action': 'unhandled'}, { status: 201 });
}
