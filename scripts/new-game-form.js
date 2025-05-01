"use strict";
import { html, render } from "https://esm.sh/htm/preact/standalone";
import { getPlayers, getCorporations } from "./stats-helpers.js";
import { config } from "./config.js";

const playersInGame = 3;

export function openModal() {
  const modalContainer = document.getElementById("newGameModal");

  modalContainer.toggleAttribute("open");
  modalContainer.innerHTML = "";
  render(html`<${Modal} />`, modalContainer);
  setTimeout(initCdsForm);
}

function onSubmit(event) {
  console.log(event);
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  const mappedData = mapFormDataToGameObject(data);

  console.log("Form submitted:", data);
  console.log("mapped data:", mappedData);
  // TODO: clear form after submit
  // TODO: close modal after submit

  fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mappedData),
  })
    .then((response) => {
      // TODO handle errors
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((updatedGamesList) => {
      console.log("Success:", updatedGamesList); // TODO: render new list
    });
}

function initCdsForm() {
  const form = document.getElementById("newGameForm");
  const button = form.querySelector('cds-modal-footer-button[type="submit"]');

  button.addEventListener("click", () => {
    form.dispatchEvent(new SubmitEvent("submit"));
  });

  // TODO: Prevent duplicates
}

function mapFormDataToGameObject(formData) {
  return Array.from({ length: playersInGame }, (_, i) => i + 1).map((i) => {
    return {
      name: formData[`Player ${i}`],
      corporation: formData[`Corporation ${i}`],
      VP: parseInt(formData[`VP ${i}`], 10),
    };
  });
}

function Modal() {
  // TODO: add pending state on submit
  return html`
    <cds-modal-header>
      <cds-modal-heading>Додати нову гру</cds-modal-heading>
    </cds-modal-header>
    <form onSubmit=${onSubmit} method="post" id="newGameForm">
      <cds-modal-body>
        ${Array.from({ length: playersInGame }, (_, i) => i + 1).map((i) => {
          return html`
            <div class="form-column">
              <cds-dropdown name="Player ${i}" title-text="Гравець ${i}">
                ${getPlayers().map((player) => html`<cds-dropdown-item value=${player}>${player}</cds-dropdown-item>`)}
              </cds-dropdown>
              <cds-dropdown name="Corporation ${i}" title-text="Корпорація ${i}">
                ${getCorporations().map((corporation) => html`<cds-dropdown-item value=${corporation}>${corporation}</cds-dropdown-item>`)}
              </cds-dropdown>
              <cds-number-input name="VP ${i}" value="0" max="999" min="0" label="VP ${i}" size="md" hide-steppers></cds-number-input>
            </div>
          `;
        })}
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button data-modal-primary-focus kind="secondary" data-modal-close>Cancel</cds-modal-footer-button>
        <cds-modal-footer-button kind="primary" type="submit">Save</cds-modal-footer-button>
      </cds-modal-footer>
    </form>
  `;
}
