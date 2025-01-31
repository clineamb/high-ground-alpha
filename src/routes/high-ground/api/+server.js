import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import qs from '$lib/utils/querystr';

export async function POST({ request, cookies }) {
  const clientData = await request.json();
  const { action, currGameId = 1 } = clientData;
  let resError = null;

  if(action === 'make-move') {
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
    const startGameRes = await supabase
      .from('game')
      .update({ 'game_started': true })
      .eq('id', currGameId);

    if(!startGameRes.error) {
      return json({ 'started': true }, { status: 201 });
    }
    resError = startGameRes.error;
  }

  if(action === 'reset-game') {
    const resetGameRes = await supabase
      .from('game')
      .update({ 
        'game_started': false,
        'players': null,
        'priority_player': null,
        'current_round': 1
      })
      .eq('id', currGameId);

    const resetMovesRes = await supabase
      .from('moves')
      .update({
        'game_id': 0 // placeholder game entry
      })
      .eq('game_id', currGameId);

    if(!resetGameRes.error && !resetMovesRes.error) {
      return json({ 'started': true }, { status: 201 });
    }
    resError = resetGameRes.error || resetMovesRes.error;
  }

  if(action === 'next-round') {
    const nextRoundRes = await supabase
      .rpc('increment_current_round', { game_id: currGameId });
    if(!nextRoundRes.error) {
      return json({ 'started': true }, { status: 201 });
    }
    resError = nextRoundRes.error;
  }

  if(action === 'add-player') {
    const playerSelect = await supabase
      .from('game')
      .select('players')
      .eq('id', currGameId)
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
      .eq('id', currGameId);

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

    if(!movesRes.error) {
      return json({ 'data': movesRes.data }, { status: 201 });
    }
    resError = movesRes.error;
  }

  if(action === 'reveal-moves') {
    const revealRes = await supabase.rpc('reveal_moves', {
      round_number: parseInt(clientData.currentRound),
      current_game_id: parseInt(currGameId)
    });
    if(!revealRes.error) {
      return json({ 'status': 'revealed'}, { status: 201 });
    }
    resError = revealRes.error;
  }

  if(resError) {
    console.log('>> RES ERROR', resError);
    return json(resError, { status: 201 }); // whatever
  }

  return json(moveData, { status: 201 });
}
