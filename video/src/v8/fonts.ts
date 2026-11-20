import { continueRender, delayRender, staticFile } from "remotion";

/** Montserrat (SIL OFL, bundled in public/fonts) for display type; Inter for small UI labels. */
export const DISPLAY = '"Montserrat", "Inter", "Helvetica Neue", Arial, sans-serif';
export const UI = '"Inter", "Helvetica Neue", Arial, sans-serif';

const handle = delayRender("Loading Montserrat");
Promise.all(
  [600, 700, 800, 900].map((w) =>
    new FontFace("Montserrat", `url(${staticFile(`fonts/montserrat-latin-${w}-normal.woff2`)}) format("woff2")`, { weight: String(w) })
      .load()
      .then((ff) => document.fonts.add(ff)),
  ),
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error("font load failed", e);
    continueRender(handle);
  });
