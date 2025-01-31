/** @type {import('./$types').PageLoad} */
export async function load({ page, params, url, data }) {
	let isSpectator = url.searchParams.get('spectator') === 'true';
	let gameId = url.searchParams.get('id')  || '1';
	
	return {
		isSpectator,
		gameId,
		'moves': data.moves,
		'game': data.game
	};
}