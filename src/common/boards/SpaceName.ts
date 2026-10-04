// Off-Mars spaces (space havens / space colonies) live in the '9xx' range so that the on-Mars
// board can grow past 63 spaces (the bigger maps) without colliding with them. Ganymede and
// Phobos keep their historical '01'/'02' ids: they sort before the board (which starts at '03')
// and so never collide as the board grows upward.
// When changing any of these ids, add the old id to SPACE_ID_RENAMES in Board.ts so saved games
// can still be loaded.
export const SpaceName = {
  GANYMEDE_COLONY: '01',
  NOCTIS_CITY: '31',
  PHOBOS_SPACE_HAVEN: '02',
  LUNA_METROPOLIS: '904',
  DAWN_CITY: '905',
  STRATOPOLIS: '906',
  MAXWELL_BASE: '907',
  HELLAS_OCEAN_TILE: '61',

  STANFORD_TORUS: '903',

  // Vastitas Borealis
  VASTITAS_BOREALIS_NORTH_POLE: '33',

  // Pathfinders
  CERES_SPACEPORT: '908',
  DYSON_SCREENS: '909',
  LUNAR_EMBASSY: '910',
  VENERA_BASE: '911',
} as const;
