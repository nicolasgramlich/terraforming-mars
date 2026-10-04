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
  [BoardName.GIGA]: {oceans: 21, temperature: 9, oxygen: 15},
};

export function getGlobalParameterMaximums(boardName: BoardName): GlobalParameterMaximums {
  return BY_BOARD[boardName] ?? STANDARD;
}

/**
 * How far one step moves each track. Standard maps raise temperature 2C and oxygen 1% per step.
 * Giga's tracks are twice as fine: 1C and 0.5% per step.
 */
export type GlobalParameterSteps = {
  temperature: number;
  oxygen: number;
};

const STANDARD_STEPS: GlobalParameterSteps = {temperature: 2, oxygen: 1};

const STEPS_BY_BOARD: Partial<Record<BoardName, GlobalParameterSteps>> = {
  [BoardName.GIGA]: {temperature: 1, oxygen: 0.5},
};

export function getGlobalParameterSteps(boardName: BoardName): GlobalParameterSteps {
  return STEPS_BY_BOARD[boardName] ?? STANDARD_STEPS;
}

const OCEAN_REQUIREMENT_MULTIPLIER_BY_BOARD: Partial<Record<BoardName, number>> = {
  [BoardName.GIGA]: 2,
};

/**
 * What a card's ocean requirement is multiplied by. Giga has more than twice the oceans, so its
 * rules double every ocean requirement ("requires 3 oceans" needs 6, "max 3 oceans" allows 6).
 */
export function getOceanRequirementMultiplier(boardName: BoardName): number {
  return OCEAN_REQUIREMENT_MULTIPLIER_BY_BOARD[boardName] ?? 1;
}
