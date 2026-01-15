'use strict';
// import & export a single pinned preact instance
import { h, render, Component } from 'https://esm.sh/preact@10.26.5?target=es2022';
export { render, Component };

// import signals pinned to the same preact version (esm.sh `deps` ensures same resolution)
export { signal } from 'https://esm.sh/@preact/signals@2.0.4?target=es2022&deps=preact@10.26.5';

// htm
import htm from 'https://esm.sh/htm@3.1.1?target=es2022';

// Initialize htm with Preact
export const html = htm.bind(h);
