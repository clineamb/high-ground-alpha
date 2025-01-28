import { json } from '@sveltejs/kit';
import * as database from '$lib/server/database.js';

export async function POST({ request, cookies }) {
	const { moveName } = await request.json();

	const moveData = await database.makeMove({ moveName });

	return json(moveData, { status: 201 });
}
