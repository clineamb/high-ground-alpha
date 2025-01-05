// hooks.js
import skio from "sveltekit-io";
import { setContext } from "svelte";
import { dev, browser } from '$app/environment';
import handleGame from '$lib/hooks/game-logic.js';

skio.setup('http://localhost:3001', {
  cors: {
    origin: `http://localhost:${dev ? 5173 : 4173}`,
    credentials: true,
  },
}).then(io => {
  // launch the game
  handleGame(io);
});

export const handle = async ({ event, resolve }) => {
  if (!browser)
    skio.get()?.emit('message', {message: `New request: ${event.request.url}`} );

  return await resolve(event);
}