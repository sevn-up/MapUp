export const APP_NAME = "MapUp";
export const APP_DESCRIPTION =
  "Test your geography knowledge with interactive 3D globe games";

export const GAME_MODES = {
  COUNTRY_SHAPE: "country_shape",
  NAME_ALL: "name_all",
  WORLDLE: "worldle",
  STREET_VIEW: "street_view",
} as const;

export const GAME_MODE_LABELS: Record<string, string> = {
  [GAME_MODES.COUNTRY_SHAPE]: "Country Shape Quiz",
  [GAME_MODES.NAME_ALL]: "Name All Countries",
  [GAME_MODES.WORLDLE]: "Worldle",
  [GAME_MODES.STREET_VIEW]: "Street View",
};

export const TOTAL_COUNTRIES = 197;

export const XP_PER_LEVEL_BASE = 100;
export const XP_LEVEL_EXPONENT = 1.5;

export const WORLDLE_MAX_GUESSES = 6;
export const STREET_VIEW_ROUNDS = 5;
export const STREET_VIEW_MAX_SCORE = 5000;
