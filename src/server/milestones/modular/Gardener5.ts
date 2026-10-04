import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';

export class Gardener5 extends BaseMilestone {
  constructor() {
    super(
      'Gardener5',
      'Own 5 greenery tiles',
      5);
  }
  public getScore(player: IPlayer): number {
    return player.game.board.getGreeneries(player).length;
  }
}
