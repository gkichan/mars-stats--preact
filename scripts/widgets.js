'use strict';
import { html } from './deps.js';
import { getTopStats, getWinRate, getPlayers, getCorporations, isWinner, sortByWinRate, gamesWon, gamesPlayed } from './stats-helpers.js';
import { playersColors, playersNicknames, primaryColor } from './models.js';
import { openModal } from './new-game-form.js';

export function LastGamesWidget(props) {
  const players = getPlayers();
  const games = props.games.value;
  const last3Games = games.slice(-3).reverse();
  const isAuthenticated = props.isAuthenticated;

  return html`
    <div class="position-rel">
      <h3>Останні матчі</h3>
      ${isAuthenticated ? html`<button id="btn-plus" onClick=${openModal}>+</button>` : ''}
    </div>
    <div class="last-games">
      <div class="last-games__row">
        ${players.map((player) => html` <span class="last-games__cell" style="color: ${playersColors[player]}"> ${playersNicknames[player]} </span> `)}
      </div>
      ${last3Games.map(
        (game) => html`
          <div class="last-games__row">
            ${players.map((player) => {
              const { corporation, VP } = game.find(({ name }) => name === player) || {};

              return corporation && VP
                ? html`
                    <div class="last-games__cell ${isWinner(game, player) ? 'winner' : ''}">
                      <div class="last-games__corp">${corporation || '-'}</div>
                      <div class="last-games__vp">${VP || '-'}</div>
                    </div>
                  `
                : html` <div class="last-games__cell">-</div> `;
            })}
          </div>
        `
      )}
    </div>
  `;
}

export function PlayersWinstatWidget() {
  const playersSortedByWinRate = sortByWinRate(getPlayers());

  return html`
    <h3>Гравці</h3>
    <div class="chart-box">
      ${playersSortedByWinRate.map((player) => {
        return html`
          <${Column}
            name=${playersNicknames[player]}
            color=${playersColors[player]}
            winRate=${getWinRate(player)}
            won=${gamesWon(player)}
            played=${gamesPlayed(player)}
          />
        `;
      })}
    </div>
  `;
}

// LEGACY: this widget is not used anywhere, but I want to keep it for now, maybe I'll add it later
export function TopScoreWidget(props) {
  const games = props.games.value;
  const { topPlayer, topScore } = getTopStats(games);

  return topPlayer && topScore
    ? html`
        <h3>Рекорд</h3>
        <div class="top-score">
          <div class="top-score__names">
            <span style="color: ${playersColors[topPlayer.name]}"> ${playersNicknames[topPlayer.name]} </span>
            ${'\u00A0'}+${'\u00A0'}
            <span style="color: ${primaryColor}"> ${topPlayer.corporation} </span>
          </div>
          <div class="top-score__number">${topScore}</div>
        </div>
      `
    : html` <h3>Рекорд</h3>`;
}

export function CorporationsWidget() {
  const corporationsSortedByWinRate = sortByWinRate(getCorporations());

  return html`
    <h3>Корпорації</h3>
    <div class="chart-box">
      ${corporationsSortedByWinRate.map((corporation, i) => {
        return html`
          <${Column}
            name="${++i} ${corporation}"
            color=${primaryColor}
            winRate=${getWinRate(corporation)}
            won=${gamesWon(corporation)}
            played=${gamesPlayed(corporation)}
          />
        `;
      })}
    </div>
  `;
}

export function TopCorpsByPlayerWidget(props) {
  const stats = {};

  for (const game of props.games.value) {
    if (!Array.isArray(game) || game.length === 0) continue;
    const maxVP = Math.max(...game.map(p => Number(p.VP) || 0));
    const winners = new Set(game.filter(p => Number(p.VP) === maxVP).map(p => p.name));

    for (const p of game) {
      const player = p.name;
      const corp = p.corporation;
      if (!player || !corp) continue;

      stats[player] ??= {};
      stats[player][corp] ??= { games: 0, wins: 0 };
      stats[player][corp].games += 1;
      if (winners.has(player)) stats[player][corp].wins += 1;
    }
  }

  const result = {};
  for (const player of Object.keys(stats)) {
    result[player] = Object.entries(stats[player])
      .map(([corporation, { games, wins }]) => ({
        corporation,
        games,
        wins,
        winRate: games > 0 ? (wins / games).toFixed(2) : 0,
      }))
      .sort((a,b) => b.winRate - a.winRate || b.games - a.games || b.corporation.localeCompare(a.corporation))
      .slice(0, 5);
  }

  return html`
    <h3>Топ корпорації гравців</h3>
    <div class="chart-box top-corps-by-player">
      ${getPlayers().map((player) => {
        return html`
          <${PlayersTopCorporations}
            name=${playersNicknames[player]}
            color=${playersColors[player]}
            corporations=${result[player] || []}
          />
        `;
      })}
    </div>
  `;
};

// Reusable components

function Column({ name, color, winRate, won, played }) {
  const height = winRate * 2.5;

  return html`
    <div class="column">
      <div class="text-content ta-center" style="color: ${color}">${name}</div>
      <div class="column__data-viz" style="background-color: ${color}; height: ${height}px"></div>
      <div class="text-content">${winRate}%</div>
      <div class="text-content white-space-nowrap">${won} / ${played}</div>
    </div>
  `;
}

function PlayersTopCorporations({ name, color, corporations }) {
  return html`
    <div class="column">
      <div class="text-content ta-center" style="color: ${color}">${name}</div>
      ${corporations.map((corp) => html`
        <div class="top-corps-by-player__row">
          <div class="text-content" style="color: ${primaryColor}">${corp.corporation}:</div>
          <div class="text-content ta-center">${(corp.winRate*100).toFixed(0)}% <br /> ${corp.wins} / ${corp.games} </div>
        </div>
      `)}
    </div>
  `;
}
