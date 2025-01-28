/** @type {import('./$types').PageLoad} */
export function load({ params, url, data }) {
	let isSpectator = url.searchParams.get('spectator') === 'true';
	return {
		isSpectator,
		'moves': data.moves
	};
}