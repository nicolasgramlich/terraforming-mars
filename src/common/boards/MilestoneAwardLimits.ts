import {BoardName} from './BoardName';
import {AWARD_COSTS, MAX_MILESTONES} from '../constants';

/**
 * How many milestones may be claimed on a map, and what each successive award costs to fund (the
 * number of costs is the number of awards that may be funded). Standard maps allow three of each;
 * Giga, which offers fifteen of each, allows seven.
 */
export type MilestoneAwardLimits = {
  milestones: number;
  awardCosts: ReadonlyArray<number>;
};

const STANDARD: MilestoneAwardLimits = {
  milestones: MAX_MILESTONES,
  awardCosts: AWARD_COSTS,
};

const BY_BOARD: Partial<Record<BoardName, MilestoneAwardLimits>> = {
  [BoardName.GIGA]: {milestones: 7, awardCosts: [8, 10, 12, 14, 16, 18, 20]},
};

export function getMilestoneAwardLimits(boardName: BoardName): MilestoneAwardLimits {
  return BY_BOARD[boardName] ?? STANDARD;
}
