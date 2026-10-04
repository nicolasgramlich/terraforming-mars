import {expect} from 'chai';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {IGame} from '../../src/server/IGame';
import {runAllActions} from '../TestingUtils';
import {Phase} from '../../src/common/Phase';
import {BoardName} from '../../src/common/boards/BoardName';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {UnderworldExpansion} from '../../src/server/underworld/UnderworldExpansion';
import {IdentifySpacesDeferred} from '../../src/server/underworld/IdentifySpacesDeferred';
import {ExcavateSpacesDeferred} from '../../src/server/underworld/ExcavateSpacesDeferred';
import {Keplertec} from '../../src/server/cards/underworld/Keplertec';
import {cast} from '../../src/common/utils/utils';

// Amazonis Planitia has as many spaces as there are underground tokens, so identifying all of it
// leaves the draw pile empty.
describe('Underworld with an empty token pile', () => {
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    [game, player] = testGame(2, {underworldExpansion: true, boardName: BoardName.AMAZONIS_PLANITIA});
    game.phase = Phase.ACTION;
    for (const space of game.board.spaces) {
      UnderworldExpansion.identify(game, space, player);
    }
    expect(game.underworldData.tokens).is.empty;
  });

  // A space whose token went back to the pile (e.g. a tile was placed on it and later removed)
  // and has since been drawn elsewhere: it is unidentified while the pile is empty.
  function unidentifiedSpace() {
    const space = game.board.spaces.find((s) => s.spaceType === SpaceType.LAND)!;
    space.undergroundResources = undefined;
    return space;
  }

  it('identifying a space does nothing', () => {
    const space = unidentifiedSpace();

    expect(UnderworldExpansion.identify(game, space, player)).is.false;
    expect(space.undergroundResources).is.undefined;
  });

  it('excavating does not try to identify the neighbouring spaces', () => {
    const space = unidentifiedSpace();
    const neighbour = game.board.getAdjacentSpaces(space).find((s) => s.undergroundResources !== undefined)!;

    UnderworldExpansion.excavate(player, neighbour);

    expect(neighbour.excavator).eq(player);
    expect(space.undergroundResources).is.undefined;
  });

  it('an unidentified space cannot be excavated', () => {
    const space = unidentifiedSpace();

    expect(UnderworldExpansion.excavatableSpaces(player, {ignorePlacementRestrictions: true})).does.not.include(space);

    game.underworldData.tokens.push('nothing');
    expect(UnderworldExpansion.excavatableSpaces(player, {ignorePlacementRestrictions: true})).includes(space);
  });

  it('identifying from the pile is skipped', () => {
    game.defer(new IdentifySpacesDeferred(player, 2));
    runAllActions(game);

    cast(player.popWaitingFor(), undefined);
  });

  it('excavating from the pile is skipped', () => {
    game.defer(new ExcavateSpacesDeferred(player, 1, false, []));
    runAllActions(game);

    cast(player.popWaitingFor(), undefined);
    expect(player.underworldData.tokens).is.empty;
  });

  it('Keplertec has nothing to offer', () => {
    const card = new Keplertec();
    player.playedCards.push(card);

    expect(card.effect(player, 1)).is.undefined;
  });
});
