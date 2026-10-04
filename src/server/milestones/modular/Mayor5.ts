import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';

export class Mayor5 extends BaseMilestone {
  constructor() {
    super(
      'Mayor5',
      'Own 5 city tiles',
      5);
  }
  public getScore(player: IPlayer): number {
    return player.game.board.getCities(player).length;
  }
}
