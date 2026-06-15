import {expect} from 'chai';
import {cast} from '../../src/common/utils/utils';
import {testGame} from '../TestGame';
import {runAllActions} from '../TestingUtils';
import {SpaceBonus} from '../../src/common/boards/SpaceBonus';
import {SelectResource} from '../../src/server/inputs/SelectResource';

describe('SpaceBonus.WILD', () => {
  it('lets the player choose any one standard resource', () => {
    const [game, player] = testGame(1);

    game.grantSpaceBonus(player, SpaceBonus.WILD, 1);
    runAllActions(game);

    const select = cast(player.popWaitingFor(), SelectResource);
    expect(select.include).to.have.members(['megacredits', 'steel', 'titanium', 'plants', 'energy', 'heat']);

    select.process({type: 'resource', resource: 'titanium'});
    expect(player.titanium).to.eq(1);
    expect(player.plants).to.eq(0);
  });

  it('grants count independent choices', () => {
    const [game, player] = testGame(1);

    game.grantSpaceBonus(player, SpaceBonus.WILD, 2);

    runAllActions(game);
    cast(player.popWaitingFor(), SelectResource).process({type: 'resource', resource: 'plants'});

    runAllActions(game);
    cast(player.popWaitingFor(), SelectResource).process({type: 'resource', resource: 'steel'});

    expect(player.plants).to.eq(1);
    expect(player.steel).to.eq(1);
  });

  it('renders a display name', () => {
    expect(SpaceBonus.toString(SpaceBonus.WILD)).to.eq('Any resource');
  });
});
