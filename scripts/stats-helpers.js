import { PlayerName, Corporation } from "./models.js";
import { games } from "./state.js";

export function getPlayers() {
  return Object.values(PlayerName);
}

export function getCorporations() {
  return Object.values(Corporation);
}

export function isWinner(game, entityName) {
  const maxVP = Math.max(...game.map((player) => player.VP));

  return game.some((player) => (player.name === entityName || player.corporation === entityName) && player.VP === maxVP);
}

export function sortByWinRate(arr) {
  return arr.sort((a, b) => {
    return getWinRate(b) - getWinRate(a);
  });
}

export function getWinRate(entityName) {
  const won = gamesWon(entityName);
  const played = gamesPlayed(entityName);
  return played > 0 ? Math.round((won / played) * 100) : 0;
}

export function gamesWon(entityName) {
  return games.value.filter((game) => isWinner(game, entityName)).length;
}

export function gamesPlayed(entityName) {
  return games.value.filter((game) => isInGame(game, entityName)).length;
}

function isInGame(game, entityName) {
  return game.some((player) => player.name === entityName || player.corporation === entityName);
}

export function getTopStats() {
  const mergedGames = merge(games.value);
  const topScore = Math.max(...mergedGames.map(({ VP }) => VP));
  const topPlayer = mergedGames.find(({ VP }) => VP === topScore);

  return { topPlayer, topScore };
}

function merge(arr) {
  return arr.reduce((acc, next) => acc.concat(next), []);
}
