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

	console.log('POST', clientData);

	// const moveData = await database.makeMove(clientMoveData);

	const moveData = {};

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
