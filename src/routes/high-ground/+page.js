/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	let isSpectator = url.searchParams.get('spectator') === 'true';
	return { isSpectator };
}