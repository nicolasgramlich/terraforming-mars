import {BoardName} from './BoardName';
import {Resource} from '../Resource';
import {
  OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS,
  TEMPERATURE_BONUS_FOR_HEAT_1,
  TEMPERATURE_BONUS_FOR_HEAT_2,
  TEMPERATURE_FOR_OCEAN_BONUS,
} from '../constants';

/**
 * A bonus printed on a global-parameter track, granted to the player who raises the parameter
 * across the threshold value (upward). `production`/`card` are player benefits and are skipped
 * during the solar (World Government) phase; `ocean`/`temperature` are global effects that happen
 * regardless and can cascade into further parameter increases.
 */
export type GlobalParameterTrackBonus =
  | {type: 'production', resource: Resource, amount: number}
  | {type: 'card', amount: number}
  | {type: 'ocean'}
  | {type: 'temperature'};

/** When the track rises from below `value` to at-or-above it, `bonus` is granted. */
export type GlobalParameterThreshold = {
  value: number;
  bonus: GlobalParameterTrackBonus;
};

/**
 * The bonuses printed along a map's temperature and oxygen tracks. Standard maps share the classic
 * layout (heat production at -24/-20C, an ocean at 0C, a temperature step at 8% oxygen). The larger
 * Amazonis Planitia, with its longer tracks, spreads out a richer set of bonuses.
 */
export type GlobalParameterTracks = {
  temperature: ReadonlyArray<GlobalParameterThreshold>;
  oxygen: ReadonlyArray<GlobalParameterThreshold>;
};

const STANDARD: GlobalParameterTracks = {
  temperature: [
    {value: TEMPERATURE_BONUS_FOR_HEAT_1, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
    {value: TEMPERATURE_BONUS_FOR_HEAT_2, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
    {value: TEMPERATURE_FOR_OCEAN_BONUS, bonus: {type: 'ocean'}},
  ],
  oxygen: [
    {value: OXYGEN_LEVEL_FOR_TEMPERATURE_BONUS, bonus: {type: 'temperature'}},
  ],
};

const AMAZONIS_PLANITIA: GlobalParameterTracks = {
  temperature: [
    {value: -24, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
    {value: -20, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
    {value: -12, bonus: {type: 'production', resource: Resource.PLANTS, amount: 1}},
    {value: 0, bonus: {type: 'ocean'}},
  ],
  oxygen: [
    {value: 7, bonus: {type: 'card', amount: 1}},
    {value: 12, bonus: {type: 'temperature'}},
  ],
};

const BY_BOARD: Partial<Record<BoardName, GlobalParameterTracks>> = {
  [BoardName.AMAZONIS_PLANITIA]: AMAZONIS_PLANITIA,
};

export function getGlobalParameterTracks(boardName: BoardName): GlobalParameterTracks {
  return BY_BOARD[boardName] ?? STANDARD;
}
