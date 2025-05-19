"use strict";
import { html } from "./deps.js";
import { getTopStats, getWinRate, getPlayers, getCorporations, isWinner, sortByWinRate, gamesWon, gamesPlayed } from "./stats-helpers.js";
import { playersColors, primaryColor } from "./models.js";
import { openModal } from "./new-game-form.js";
import { config } from "./config.js";

function SignIn() {
  return html`<a href="${config.apiUrl}/auth/signin/github?callbackUrl=${encodeURIComponent(window.location.origin)}/mars-stats--preact/">Sign in</a>`;
function SignOut() {
  return html`<a href="${config.apiUrl}/auth/signout">Sign out</a>`;
}

export function LastGamesWidget(props) {
  const players = getPlayers();
  const games = props.games.value;
  const last3Games = games.slice(-3).reverse();
  const isAuthenticated = props.isAuthenticated;

  return html`
    <div class="position-rel">
      <h3>Останні матчі</h3>
      ${isAuthenticated ? html`<button class="btn-plus" onClick=${openModal}>+</button>${SignOut()}` : SignIn()}
    </div>
    <div class="last-games">
      <div class="last-games__row">
        ${players.map((player) => html` <span class="last-games__cell" style="color: ${playersColors[player]}"> ${player} </span> `)}
      </div>
      ${last3Games.map(
        (game) => html`
          <div class="last-games__row">
            ${players.map((player) => {
              const { corporation, VP } = game.find(({ name }) => name === player) || {};

              return corporation && VP
                ? html`
                    <div class="last-games__cell ${isWinner(game, player) ? "winner" : ""}">
                      <div class="last-games__corp">${corporation || "-"}</div>
                      <div class="last-games__vp">${VP || "-"}</div>
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
          <${Column} name=${player} color=${playersColors[player]} winRate=${getWinRate(player)} won=${gamesWon(player)} played=${gamesPlayed(player)} />
        `;
      })}
    </div>
  `;
}

export function TopScoreWidget(props) {
  const games = props.games.value;
  const { topPlayer, topScore } = getTopStats(games);

  return topPlayer && topScore
    ? html`
        <h3>Рекорд</h3>
        <div class="top-score">
          <div class="top-score__names">
            <span style="color: ${playersColors[topPlayer.name]}"> ${topPlayer.name} </span>
            ${"\u00A0"}+${"\u00A0"}
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
      ${corporationsSortedByWinRate.map((corporation) => {
        return html`
          <${Column}
            name=${corporation}
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

// Reusable components

function Column({ name, color, winRate, won, played }) {
  const height = winRate * 2.5;

  return html`
    <div class="column">
      <div class="text-content ta-center" style="color: ${color}">${name}</div>
      <div class="column__data-viz" style="background-color: ${color}; height: ${height}px"></div>
      <div class="text-content">${winRate}%</div>
      <div class="text-content">${won} / ${played}</div>
    </div>
  `;
}
