export const API = {
  ARTIC_BASE:      "https://api.artic.edu/api/v1",
  ARTIC_IMG:       "https://www.artic.edu/iiif/2",
  LOCAL_BASE:      "http://localhost:5000/api",
  LOCAL_FRONTEND:  "http://localhost:5173",
};

export const ARTIC_IMG_PARAMS       = "full/400,/0/default.jpg";
export const ARTIC_IMG_PARAMS_MAIN  = "full/843,/0/default.jpg";
export const ARTIC_ART_FIELDS       = "id,title,image_id";

export const DEFAULT_AUTHOR         = "Anonyme";
export const UNKNOWN_ARTIST         = "Unknown artist";
export const DATE_LOCALE            = "fr-CA";
export const DATE_OPTIONS           = { day: "numeric", month: "short", year: "numeric" };

export const ARTWORK_IDS            = [27992, 129884, 111628, 28560, 81539, 6565, 12345, 12101];
export const PALETTE_COLOR_COUNT    = 8;
export const CARD_ANIMATION_STEP_MS = 60;

export const ROUTES = {
  PAINT:     "/paint",
  COMMUNITY: "/community",
};