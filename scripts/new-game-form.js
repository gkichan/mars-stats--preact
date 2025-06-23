"use strict";
import { html, render, Component } from "./deps.js";
import { getPlayers, getCorporations } from "./stats-helpers.js";
import { config } from "./config.js";
import { games } from "./state.js";

const newGameModal = "newGameModal";

export function openModal() {
  const cdsModalPlaceholder = document.getElementById("cds-modal-placeholder");
  render(html`<${Modal} />`, cdsModalPlaceholder);

  toggleModal();
}

const playersCounterArray = Array.from({ length: config.playersInGame }, (_, i) => i + 1);

function toggleModal() {
  const modalContainer = document.getElementById(newGameModal);
  modalContainer.toggleAttribute("open");
}

class Modal extends Component {
  formFields = {
    corporation: (i) => `Corporation ${i}`,
    corporationTitleText: (i) => `Корпорація ${i}`,
    player: (i) => `Player ${i}`,
    playerTitleText: (i) => `Гравець ${i}`,
    vp: (i) => `VP ${i}`,
  };

  componentDidMount() {
    setTimeout(this.initCdsForm.bind(this));
  }

  getFormElement() {
    return document.getElementById("newGameForm");
  }

  initCdsForm() {
    const form = this.getFormElement();
    const button = form.querySelector('cds-modal-footer-button[type="submit"]');

    button.addEventListener("click", () => {
      form.dispatchEvent(new SubmitEvent("submit"));
    });
  }

  manualResetFields() {
    const dropdownsToReset = playersCounterArray.map((i) => this.formFields.corporationTitleText(i));
    const form = this.getFormElement();

    dropdownsToReset.forEach((element) => {
      const selector = `cds-dropdown[title-text="${element}"]`;
      const dropdown = form.querySelector(selector);
      dropdown?.setAttribute("value", "");
    });
  }

  async onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const mappedData = this.mapFormDataToGameObject(data);

    try {
      const response = await fetch(`${config.apiUrl}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
        credentials: "include",
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "An error occurred");
      }

      games.value = responseData;
      this.manualResetFields();
      toggleModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error || "Failed to save the game. Please try again.");
    }
  }

  mapFormDataToGameObject(formData) {
    return playersCounterArray.map((i) => {
      return {
        name: formData[this.formFields.player(i)],
        corporation: formData[this.formFields.corporation(i)],
        VP: parseInt(formData[`VP ${i}`], 10),
      };
    });
  }

  render() {
    return html`
      <cds-modal class="cds-theme-zone-g90" size="lg" id="${newGameModal}" prevent-close-on-click-outside="true">
        <cds-modal-header>
          <cds-modal-close-button></cds-modal-close-button>
          <cds-modal-heading>Додати нову гру</cds-modal-heading>
        </cds-modal-header>
        <form onSubmit=${this.onSubmit.bind(this)} method="post" id="newGameForm">
          <cds-modal-body>
            ${playersCounterArray.map((i) => {
              return html`
                <div class="form-column">
                  <cds-dropdown name="${this.formFields.player(i)}" title-text="Гравець ${i}" value="${getPlayers()[i - 1]}">
                    ${getPlayers().map((player) => html`<cds-dropdown-item value=${player}>${player}</cds-dropdown-item>`)}
                  </cds-dropdown>
                  <cds-dropdown name="${this.formFields.corporation(i)}" title-text="Корпорація ${i}">
                    ${getCorporations()
                      .sort()
                      .map((corporation) => html`<cds-dropdown-item value=${corporation}>${corporation}</cds-dropdown-item>`)}
                  </cds-dropdown>
                  <cds-number-input name="${this.formFields.vp(i)}" value="0" max="999" min="0" label="VP ${i}" size="md" hide-steppers></cds-number-input>
                </div>
              `;
            })}
          </cds-modal-body>
          <cds-modal-footer>
            <cds-modal-footer-button data-modal-primary-focus kind="secondary" data-modal-close>Cancel</cds-modal-footer-button>
            <cds-modal-footer-button kind="primary" type="submit">Save</cds-modal-footer-button>
          </cds-modal-footer>
        </form>
      </cds-modal>
    `;
  }
}
