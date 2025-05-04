"use strict";
export { render } from "https://esm.sh/preact";
export { signal } from "https://esm.sh/@preact/signals";

import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

// Initialize htm with Preact
export const html = htm.bind(h);
