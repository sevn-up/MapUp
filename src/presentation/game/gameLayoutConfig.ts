// Per-game mobile top-panel height. The shared game layout splits the
// screen between a top "globe / map" panel and a bottom "game" panel.
// Each game has different needs: Worldle wants more room for guess
// history, Population barely needs the globe, Name All wants the globe
// large enough to watch fill in.
//
// Values use `dvh` (dynamic viewport height) so iOS Safari's address
// bar doesn't cause layout flicker.

const MOBILE_TOP_PANEL_HEIGHT_BY_PATH: Record<string, string> = {
  "/worldle": "25dvh",
  "/population": "20dvh",
  "/name-all": "45dvh",
  "/capitals": "30dvh",
  "/flag-quiz": "30dvh",
  "/country-shape": "30dvh",
};

export const DEFAULT_MOBILE_TOP_PANEL_HEIGHT = "40dvh";

export function getMobileTopPanelHeight(pathname: string): string {
  return MOBILE_TOP_PANEL_HEIGHT_BY_PATH[pathname] ?? DEFAULT_MOBILE_TOP_PANEL_HEIGHT;
}
