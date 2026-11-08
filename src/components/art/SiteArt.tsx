import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

const PAPER = "#f7f1e3";
const PAPER_SHADE = "#d8ccb2";
const INK = "#3a4654";
const LINE = "#b9b09c";
const TEAL = "#1fa394";
const TEAL_DARK = "#15786d";
const GOLD = "#f2b63f";
const GOLD_DARK = "#c78a1e";
const RED = "#e45a4e";
const RED_DARK = "#b53c32";
const BLUE = "#4d96de";
const BLUE_DARK = "#2f6fb2";
const PURPLE = "#8f6de2";
const PURPLE_DARK = "#6a4cbb";
const WOOD = "#c58b4c";
const WOOD_DARK = "#99672f";
const GREEN = "#55b36b";

const art = {
  house: (
    <>
      <rect x="14" y="30" width="36" height="26" rx="3" fill={PAPER_SHADE} />
      <rect x="14" y="28" width="36" height="26" rx="3" fill={PAPER} />
      <path d="M8 31 32 9l24 22a2 2 0 0 1-2.7 3L32 16 10.7 34a2 2 0 0 1-2.7-3Z" fill={RED_DARK} />
      <path d="M8 29 32 7l24 22a2 2 0 0 1-2.7 3L32 14 10.7 32a2 2 0 0 1-2.7-3Z" fill={RED} />
      <rect x="27" y="38" width="10" height="16" rx="2" fill={TEAL} />
      <circle cx="34" cy="46" r="1.2" fill={GOLD} />
    </>
  ),
  newspaper: (
    <>
      <rect x="9" y="12" width="46" height="44" rx="5" fill={PAPER_SHADE} />
      <rect x="9" y="9" width="46" height="44" rx="5" fill={PAPER} />
      <rect x="15" y="15" width="34" height="7" rx="2" fill={TEAL} />
      <rect x="15" y="27" width="15" height="13" rx="2" fill={BLUE} />
      <circle cx="26" cy="31" r="2" fill={GOLD} />
      <path d="M15 40v-3l5-4 4 3 3-2 3 3v3Z" fill={GREEN} />
      <path d="M34 28h15M34 33h15M34 38h15M15 45h34M15 49h24" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="9" y="14" width="46" height="42" rx="6" fill={PAPER_SHADE} />
      <rect x="9" y="11" width="46" height="42" rx="6" fill={PAPER} />
      <path d="M9 17a6 6 0 0 1 6-6h34a6 6 0 0 1 6 6v7H9Z" fill={RED} />
      <rect x="19" y="6" width="5" height="11" rx="2.5" fill={INK} />
      <rect x="40" y="6" width="5" height="11" rx="2.5" fill={INK} />
      <g fill={LINE}>
        <rect x="16" y="29" width="7" height="6" rx="1.5" />
        <rect x="28" y="29" width="7" height="6" rx="1.5" />
        <rect x="16" y="40" width="7" height="6" rx="1.5" />
        <rect x="40" y="40" width="7" height="6" rx="1.5" />
      </g>
      <rect x="40" y="29" width="7" height="6" rx="1.5" fill={TEAL} />
      <rect x="27" y="39" width="9" height="8" rx="2" fill={GOLD} />
    </>
  ),
  schedule: (
    <>
      <path d="m16 51-5 7M48 51l5 7" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="14" cy="16" r="8" fill={GOLD} />
      <circle cx="50" cy="16" r="8" fill={GOLD} />
      <circle cx="32" cy="36" r="23" fill={TEAL_DARK} />
      <circle cx="32" cy="34" r="23" fill={TEAL} />
      <circle cx="32" cy="34" r="17" fill={PAPER} />
      <path d="M32 23v11l8 5" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="34" r="2.2" fill={RED} />
    </>
  ),
  photos: (
    <>
      <rect x="8" y="13" width="36" height="38" rx="3" fill={PAPER_SHADE} transform="rotate(-9 26 32)" />
      <rect x="20" y="16" width="36" height="40" rx="3" fill={WOOD_DARK} opacity="0.35" transform="rotate(6 38 36)" />
      <g transform="rotate(6 38 34)">
        <rect x="20" y="14" width="36" height="40" rx="3" fill={PAPER} />
        <rect x="24" y="18" width="28" height="26" rx="1.5" fill={BLUE} />
        <circle cx="46" cy="25" r="3.5" fill={GOLD} />
        <path d="M24 44v-7l8-8 7 8 4-4 9 8v3Z" fill={GREEN} />
      </g>
    </>
  ),
  bell: (
    <>
      <circle cx="28" cy="52" r="5" fill={WOOD_DARK} />
      <path d="M28 12c-9 0-14 7-14 16 0 8-2 12-6 16 0 3 2 4 4 4h32c2 0 4-1 4-4-4-4-6-8-6-16 0-9-5-16-14-16Z" fill={GOLD_DARK} />
      <path d="M28 10c-9 0-14 7-14 16 0 8-2 12-6 16 0 3 2 4 4 4h32c2 0 4-1 4-4-4-4-6-8-6-16 0-9-5-16-14-16Z" fill={GOLD} />
      <path d="M20 26c0-5 2-8 5-10" fill="none" stroke="#fbe3a6" strokeWidth="3" strokeLinecap="round" />
      <rect x="24" y="4" width="8" height="9" rx="4" fill={WOOD} />
      <circle cx="53" cy="20" r="4" fill={TEAL} />
      <path d="M57 20V7l-6 2" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  poll: (
    <>
      <g transform="rotate(-5 32 18)">
        <rect x="19" y="5" width="26" height="32" rx="2.5" fill={PAPER_SHADE} />
        <rect x="19" y="4" width="26" height="31" rx="2.5" fill={PAPER} />
        <path d="m25 18 5 5 10-11" fill="none" stroke={TEAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="8" y="31" width="48" height="27" rx="4" fill={BLUE_DARK} />
      <rect x="8" y="28" width="48" height="27" rx="4" fill={BLUE} />
      <rect x="18" y="26" width="28" height="6" rx="3" fill={INK} />
      <rect x="25" y="39" width="14" height="8" rx="2" fill={PAPER} />
    </>
  ),
  meme: (
    <>
      <circle cx="32" cy="35" r="25" fill={GOLD_DARK} />
      <circle cx="32" cy="32" r="25" fill={GOLD} />
      <path d="M15 27c2-5 8-5 10 0M39 27c2-5 8-5 10 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M15 35h34c0 11-8 17-17 17s-17-6-17-17Z" fill={INK} />
      <path d="M20 35h24v3a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3Z" fill={PAPER} />
      <path d="M26 49a12 12 0 0 1 12 0c-3 2-9 2-12 0Z" fill={RED} />
      <path d="M8 28c-3 4-5 7-5 9a4 4 0 0 0 8 0c0-2-1-5-3-9ZM56 28c-2 4-3 7-3 9a4 4 0 0 0 8 0c0-2-2-5-5-9Z" fill={BLUE} />
    </>
  ),
  trophy: (
    <>
      <path d="M17 13H7c0 13 4 20 14 22M47 13h10c0 13-4 20-14 22" fill="none" stroke={GOLD_DARK} strokeWidth="5" strokeLinecap="round" />
      <rect x="27" y="36" width="10" height="12" fill={GOLD_DARK} />
      <path d="M16 7h32v18c0 10-7 16-16 16S16 35 16 25Z" fill={GOLD} />
      <path d="M23 12v13c0 4 1 7 3 9" fill="none" stroke="#fbe3a6" strokeWidth="3" strokeLinecap="round" />
      <path d="m34 14 2.4 5 5.6.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.6-.8Z" fill={PAPER} />
      <rect x="18" y="47" width="28" height="11" rx="3" fill={WOOD_DARK} />
      <rect x="18" y="46" width="28" height="9" rx="3" fill={WOOD} />
      <rect x="26" y="49" width="12" height="3" rx="1.5" fill={GOLD} />
    </>
  ),
  gamepad: (
    <>
      <path d="M18 19h28c9 0 13 8 14 20 1 8-1 13-6 13-4 0-7-3-10-8H20c-3 5-6 8-10 8-5 0-7-5-6-13 1-12 5-20 14-20Z" fill={PURPLE_DARK} transform="translate(0 3)" />
      <path d="M18 19h28c9 0 13 8 14 20 1 8-1 13-6 13-4 0-7-3-10-8H20c-3 5-6 8-10 8-5 0-7-5-6-13 1-12 5-20 14-20Z" fill={PURPLE} />
      <path d="M17 26h4v5h5v4h-5v5h-4v-5h-5v-4h5Z" fill={PAPER} />
      <circle cx="45" cy="28" r="3.2" fill={GOLD} />
      <circle cx="52" cy="34" r="3.2" fill={RED} />
      <circle cx="38" cy="34" r="3.2" fill={TEAL} />
      <circle cx="45" cy="40" r="3.2" fill={BLUE} />
    </>
  ),
  help: (
    <>
      <path d="M12 11h40a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H31L19 60V49h-7a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z" fill={TEAL_DARK} transform="translate(0 2)" />
      <path d="M12 9h40a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H31L19 58V47h-7a6 6 0 0 1-6-6V15a6 6 0 0 1 6-6Z" fill={TEAL} />
      <path d="M24 22c0-5 4-7 8-7s8 2 8 7c0 7-8 6-8 12" fill="none" stroke={PAPER} strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="41" r="3" fill={PAPER} />
    </>
  ),
  envelope: (
    <>
      <rect x="6" y="16" width="52" height="38" rx="5" fill={PAPER_SHADE} />
      <rect x="6" y="13" width="52" height="38" rx="5" fill={PAPER} />
      <path d="m8 49 18-18M56 49 38 31" stroke={PAPER_SHADE} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 18a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5L36 34a7 7 0 0 1-8 0Z" fill={BLUE} />
      <circle cx="32" cy="32" r="7" fill={RED} />
      <path d="M32 36s-4-2.500-4-5a2.200 2.200 0 0 1 4-1.300 2.200 2.200 0 0 1 4 1.300c0 2.500-4 5-4 5Z" fill={PAPER} />
    </>
  ),
  laptop: (
    <>
      <rect x="12" y="9" width="40" height="33" rx="4" fill={INK} />
      <rect x="16" y="13" width="32" height="25" rx="1.5" fill="#1f2a35" />
      <path d="M20 19h9M20 24h17M24 29h13M20 34h7" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M33 19h7" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M41 29h3" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M5 44h54l-3 8a4 4 0 0 1-4 3H12a4 4 0 0 1-4-3Z" fill={PAPER_SHADE} />
      <rect x="25" y="44" width="14" height="3" rx="1.5" fill={LINE} />
    </>
  ),
  scroll: (
    <>
      <rect x="14" y="11" width="36" height="42" fill={PAPER} />
      <path d="M21 21h22M21 27h22M21 33h22M21 39h14" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="42" r="6" fill={RED} />
      <rect x="9" y="6" width="46" height="9" rx="4.500" fill={WOOD} />
      <rect x="9" y="49" width="46" height="9" rx="4.500" fill={WOOD_DARK} />
    </>
  ),
  star: (
    <>
      <path d="m30 11 6.500 13.500 14.800 2-10.800 10.300 2.700 14.700L30 44.300l-13.200 7.200 2.700-14.700L8.700 26.500l14.800-2Z" fill={GOLD_DARK} transform="translate(0 3)" />
      <path d="m30 11 6.500 13.500 14.800 2-10.800 10.300 2.700 14.700L30 44.300l-13.200 7.200 2.700-14.700L8.700 26.500l14.800-2Z" fill={GOLD} />
      <path d="M52 5c1 4 2 5 6 6-4 1-5 2-6 6-1-4-2-5-6-6 4-1 5-2 6-6ZM53 44c.8 3 1.500 3.700 4.500 4.500-3 .8-3.700 1.500-4.500 4.500-.8-3-1.500-3.700-4.500-4.500 3-.8 3.700-1.500 4.500-4.500Z" fill={TEAL} />
    </>
  ),
  box: (
    <>
      <path d="M10 24 32 32 54 24 32 16Z" fill={WOOD_DARK} />
      <path d="M10 24 32 16l-5-7L5 17ZM54 24 32 16l5-7 22 8Z" fill={WOOD} />
      <path d="M10 24v24a3 3 0 0 0 2 2.800L32 58V32Z" fill={WOOD} />
      <path d="M54 24v24a3 3 0 0 1-2 2.800L32 58V32Z" fill={WOOD_DARK} />
      <path d="m16 35 10 3.600v4L16 39Z" fill={PAPER} />
    </>
  ),
  pencil: (
    <>
      <g transform="rotate(38 32 32)">
        <rect x="26" y="-3" width="12" height="8" rx="2" fill={RED} />
        <rect x="26" y="4" width="12" height="4" fill={PAPER_SHADE} />
        <path d="M26 8h12v19l-3-2-3 3-3-3-3 2Z" fill={GOLD} />
        <path d="m26 37 3 2 3-3 3 3 3-2v15H26Z" fill={GOLD} />
        <path d="M26 52h12l-6 13Z" fill={PAPER} />
        <path d="m29.500 59.500 5 0L32 65Z" fill={INK} />
      </g>
      <g fill={WOOD}>
        <circle cx="47" cy="17" r="1.800" />
        <circle cx="52" cy="24" r="1.300" />
        <circle cx="14" cy="42" r="1.500" />
      </g>
    </>
  ),
  map: (
    <>
      <path d="M6 14 22 8l20 6 16-6v42l-16 6-20-6-16 6Z" fill={PAPER_SHADE} transform="translate(0 2)" />
      <path d="M6 14 22 8v42L6 56Z" fill={PAPER} />
      <path d="m22 8 20 6v42l-20-6Z" fill="#b8dcd3" />
      <path d="M42 14 58 8v42l-16 6Z" fill={PAPER} />
      <path d="M13 44c5-8 9-1 14-7s5-9 11-11 4-3 7-5" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
      <path d="m47 13 5 5m0-5-5 5" stroke={RED_DARK} strokeWidth="3.500" strokeLinecap="round" />
    </>
  ),
  cone: (
    <>
      <rect x="8" y="50" width="48" height="9" rx="3" fill={INK} />
      <path d="M26 7a6 6 0 0 1 12 0l13 44H13Z" fill="#f28a35" />
      <path d="M21.500 23h21l3 11h-27Z" fill={PAPER} />
      <path d="M15.500 44h33l2 7h-37Z" fill={PAPER} />
      <path d="M36 7a4 4 0 0 0-2-3.400L44 51h7L38 7Z" fill="#000" opacity="0.1" />
    </>
  ),
  lock: (
    <>
      <path d="M19 30V20a13 13 0 0 1 26 0v10" fill="none" stroke={LINE} strokeWidth="6" strokeLinecap="round" />
      <rect x="10" y="29" width="44" height="30" rx="6" fill={GOLD_DARK} />
      <rect x="10" y="27" width="44" height="29" rx="6" fill={GOLD} />
      <circle cx="32" cy="38" r="4.500" fill={INK} />
      <rect x="30" y="39" width="4" height="10" rx="2" fill={INK} />
    </>
  ),
  key: (
    <>
      <g transform="rotate(-38 32 32)">
        <rect x="27" y="30" width="33" height="9" rx="2" fill={GOLD_DARK} />
        <rect x="27" y="28" width="33" height="9" rx="2" fill={GOLD} />
        <path d="M48 37h4v8h-4ZM55 37h5v6h-5Z" fill={GOLD_DARK} />
        <circle cx="18" cy="34" r="15" fill={GOLD_DARK} />
        <circle cx="18" cy="32" r="15" fill={GOLD} />
        <circle cx="16" cy="32" r="5.500" fill={TEAL_DARK} />
      </g>
    </>
  ),
  badge: (
    <>
      <rect x="5" y="15" width="54" height="40" rx="6" fill={PAPER_SHADE} />
      <rect x="5" y="12" width="54" height="40" rx="6" fill={PAPER} />
      <path d="M5 18a6 6 0 0 1 6-6h42a6 6 0 0 1 6 6v5H5Z" fill={TEAL} />
      <rect x="25" y="6" width="14" height="10" rx="3" fill={INK} />
      <circle cx="21" cy="33" r="5.500" fill={BLUE} />
      <path d="M11 46c0-6 4.500-8 10-8s10 2 10 8Z" fill={BLUE} />
      <path d="M37 31h15M37 38h15M37 45h9" stroke={LINE} strokeWidth="2.500" strokeLinecap="round" />
    </>
  ),
  comment: (
    <>
      <path d="M26 5h28a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5h-2v8l-9-8H26a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z" fill={GOLD} />
      <path d="M10 20h28a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H21L12 58V48h-2a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5Z" fill={TEAL_DARK} transform="translate(0 2)" />
      <path d="M10 20h28a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H21L12 58V48h-2a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5Z" fill={TEAL} />
      <circle cx="15" cy="34" r="3" fill={PAPER} />
      <circle cx="24" cy="34" r="3" fill={PAPER} />
      <circle cx="33" cy="34" r="3" fill={PAPER} />
    </>
  ),
  document: (
    <>
      <path d="M14 8h26l13 13v35a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5Z" fill={PAPER_SHADE} transform="translate(0 2)" />
      <path d="M14 6h26l13 13v35a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5Z" fill={PAPER} />
      <path d="M40 6v9a4 4 0 0 0 4 4h9Z" fill={PAPER_SHADE} />
      <path d="M17 19h15M17 27h28M17 35h28M17 43h14" stroke={LINE} strokeWidth="2.500" strokeLinecap="round" />
      <path d="m38 49-3 11 6-3 6 3-3-11Z" fill={BLUE_DARK} />
      <circle cx="41" cy="46" r="7.500" fill={RED} />
      <path d="m37.500 46 2.500 2.500 4.500-5" fill="none" stroke={PAPER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  plug: (
    <>
      <path d="M41 28c7 0 11 4 11 11 0 8 4 13 9 13" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M12 15h5v11h-5ZM24 15h5v11h-5Z" fill={LINE} />
      <path d="M8 24h25v8a12.5 12.5 0 0 1-25 0Z" fill={PAPER_SHADE} />
      <path d="M8 24h25v5a12.5 12.5 0 0 1-25 0Z" fill={PAPER} />
      <rect x="18" y="42" width="5" height="7" fill={INK} />
      <path d="M44 7 40 15h5l-4 8" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M53 13 49 18h4l-3 4" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  rocket: (
    <>
      <path d="M26 47h12l-6 15Z" fill={GOLD} />
      <path d="M29 47h6l-3 9Z" fill={RED} />
      <path d="M21 31 10 45v6l12-5ZM43 31l11 14v6l-12-5Z" fill={RED_DARK} />
      <path d="M32 3c8 6 12 15 12 26 0 7-1 13-3 19H23c-2-6-3-12-3-19 0-11 4-20 12-26Z" fill={PAPER} />
      <path d="M32 3c8 6 12 15 12 26 0 7-1 13-3 19h-9Z" fill={PAPER_SHADE} />
      <path d="M32 3c5 4 8 8 10 14H22c2-6 5-10 10-14Z" fill={RED} />
      <circle cx="32" cy="28" r="6.5" fill={INK} />
      <circle cx="32" cy="28" r="4.5" fill={BLUE} />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type SiteArtName = keyof typeof art;

interface SiteArtProps {
  name: SiteArtName;
  className?: string;
}

/**
 * Hand-drawn objects for the places where a page introduces itself: headers, empty and error
 * states, the home page and the "Още" menus. Plain icons stay in buttons and dense controls.
 * The colours are fixed, so every drawing has to read well on both light and dark themes.
 */
export function SiteArt({ name, className }: SiteArtProps) {
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden="true" focusable="false">
      {art[name]}
    </svg>
  );
}
