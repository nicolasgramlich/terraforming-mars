import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {addCity, addGreenery, fakeCard} from '../../TestingUtils';
import {BoardName} from '../../../src/common/boards/BoardName';
import {SpaceType} from '../../../src/common/boards/SpaceType';
import {TileType} from '../../../src/common/TileType';
import {Tag} from '../../../src/common/cards/Tag';
import {Gardener5} from '../../../src/server/milestones/modular/Gardener5';
import {Mayor5} from '../../../src/server/milestones/modular/Mayor5';
import {RimSettler5} from '../../../src/server/milestones/modular/RimSettler5';
import {PolarExplorer5} from '../../../src/server/milestones/modular/PolarExplorer5';
import {milestoneManifest} from '../../../src/server/milestones/Milestones';

describe('Giga milestones', () => {
  it('Giga uses the 5 versions', () => {
    const names = milestoneManifest.boards[BoardName.GIGA];
    expect(names).includes.members(['Gardener5', 'Mayor5', 'Rim Settler5', 'Polar Explorer5']);
    expect(names).does.not.include.members(['Gardener', 'Mayor', 'Rim Settler', 'Polar Explorer']);
  });

  it('Gardener5 needs 5 greeneries', () => {
    const [/* game */, player] = testGame(2, {boardName: BoardName.GIGA});
    const milestone = new Gardener5();
    for (let i = 0; i < 4; i++) {
      addGreenery(player);
    }
    expect(milestone.canClaim(player)).is.false;
    addGreenery(player);
    expect(milestone.getScore(player)).eq(5);
    expect(milestone.canClaim(player)).is.true;
  });

  it('Mayor5 needs 5 cities', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    const milestone = new Mayor5();
    const spaces = game.board.spaces.filter((space) => space.spaceType === SpaceType.LAND && space.y === 7);
    for (let i = 0; i < 4; i++) {
      addCity(player, spaces[i * 2].id);
    }
    expect(milestone.canClaim(player)).is.false;
    addCity(player, spaces[8].id);
    expect(milestone.getScore(player)).eq(5);
    expect(milestone.canClaim(player)).is.true;
  });

  it('Rim Settler5 needs 5 Jovian tags', () => {
    const [/* game */, player] = testGame(2, {boardName: BoardName.GIGA});
    const milestone = new RimSettler5();
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN, Tag.JOVIAN]}));
    expect(milestone.canClaim(player)).is.false;
    player.playedCards.push(fakeCard({tags: [Tag.JOVIAN]}));
    expect(milestone.getScore(player)).eq(5);
    expect(milestone.canClaim(player)).is.true;
  });

  it('Polar Explorer5 needs 5 tiles on the polar spaces', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    const milestone = new PolarExplorer5();
    const polar = game.board.spaces.filter((space) => space.polar);
    expect(polar).has.length(14);
    expect(polar.map((space) => space.y).sort((a, b) => a - b)).deep.eq([0, 0, 0, 0, 1, 1, 1, 9, 9, 9, 10, 10, 10, 10]);

    // Both poles count.
    for (const space of [polar[0], polar[5], polar[8], polar[13]]) {
      game.simpleAddTile(player, space, {tileType: TileType.GREENERY});
    }
    // A tile on the bottom row outside the polar region does not.
    const elsewhere = game.board.spaces.find((space) => space.y === 10 && !space.polar)!;
    game.simpleAddTile(player, elsewhere, {tileType: TileType.GREENERY});
    expect(milestone.getScore(player)).eq(4);
    expect(milestone.canClaim(player)).is.false;

    game.simpleAddTile(player, polar[1], {tileType: TileType.GREENERY});
    expect(milestone.getScore(player)).eq(5);
    expect(milestone.canClaim(player)).is.true;
  });
});
