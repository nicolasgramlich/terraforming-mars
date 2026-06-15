import {IPlayer} from '../../IPlayer';
import {IAward} from '../IAward';
import {hazardSeverity} from '../../../common/AresTileType';
import {SpaceType} from '../../../common/boards/SpaceType';

// Is this exactly the same as Edgedancer?
export class Suburbian implements IAward {
  public readonly name = 'Suburbian';
  public readonly description = 'Most tiles on areas along the edges of the map';
  public getScore(player: IPlayer): number {
    const board = player.game.board;
    return board.spaces.filter((space) => {
      // A space on the edge of the (hexagonal) map has fewer than six neighbours. Computing this
      // from adjacency keeps the award correct on any board size, including the larger maps.
      // Off-Mars colony spaces report no neighbours, so they are excluded explicitly.
      if (space.spaceType === SpaceType.COLONY || board.getAdjacentSpaces(space).length >= 6) {
        return false;
      }
      if (space.tile === undefined || hazardSeverity(space.tile.tileType) !== 'none') {
        return false;
      }
      return space.player === player;
    }).length;
  }
}
