import {BoardName} from './BoardName';
import {MAX_OCEAN_TILES, MAX_OXYGEN_LEVEL, MAX_TEMPERATURE} from '../constants';

/**
 * The maximum values of the three Mars global parameters. These are normally the standard values
 * (9 oceans, +8C, 14% oxygen) but a map may raise them: the larger Amazonis Planitia, having more
 * room to terraform, goes up to 11 oceans, +14C and 18% oxygen.
 */
export type GlobalParameterMaximums = {
  oceans: number;
  temperature: number;
  oxygen: number;
};

const STANDARD: GlobalParameterMaximums = {
  oceans: MAX_OCEAN_TILES,
  temperature: MAX_TEMPERATURE,
  oxygen: MAX_OXYGEN_LEVEL,
};

const BY_BOARD: Partial<Record<BoardName, GlobalParameterMaximums>> = {
  [BoardName.AMAZONIS_PLANITIA]: {oceans: 11, temperature: 14, oxygen: 18},
};

export function getGlobalParameterMaximums(boardName: BoardName): GlobalParameterMaximums {
  return BY_BOARD[boardName] ?? STANDARD;
}
