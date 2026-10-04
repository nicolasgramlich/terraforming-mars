import {BaseMilestone} from '../IMilestone';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';

export class RimSettler5 extends BaseMilestone {
  constructor() {
    super(
      'Rim Settler5',
      'Have 5 Jovian tags in play',
      5);
  }
  public getScore(player: IPlayer): number {
    return player.tags.count(Tag.JOVIAN, 'milestone');
  }
}
