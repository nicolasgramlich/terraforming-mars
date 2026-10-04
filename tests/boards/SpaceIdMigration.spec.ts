import {expect} from 'chai';
import {testGame} from '../TestGame';
import {Game} from '../../src/server/Game';
import {Board} from '../../src/server/boards/Board';
import {BoardName} from '../../src/common/boards/BoardName';
import {SpaceName} from '../../src/common/boards/SpaceName';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {spaceLabel} from '../../src/common/boards/spaces';
import {TileType} from '../../src/common/TileType';
import {SpaceId} from '../../src/common/Types';

// Off-Mars spaces used to be '69'..'78', and now live in the '9xx' range.
const OLD_LUNA_METROPOLIS: SpaceId = '70';

describe('Space id migration', () => {
  it('loads a save that predates the off-Mars renumbering', () => {
    const [game, player] = testGame(2, {venusNextExtension: true});
    game.simpleAddTile(player, game.board.getSpaceOrThrow(SpaceName.LUNA_METROPOLIS), {tileType: TileType.CITY});

    const serialized = game.serialize();
    const lunaMetropolis = serialized.board.spaces.find((space) => space.id === SpaceName.LUNA_METROPOLIS)!;
    lunaMetropolis.id = OLD_LUNA_METROPOLIS;
    serialized.stJosephCathedrals = [OLD_LUNA_METROPOLIS];

    const deserialized = Game.deserialize(serialized);

    const space = deserialized.board.getSpaceOrThrow(SpaceName.LUNA_METROPOLIS);
    expect(space.spaceType).eq(SpaceType.COLONY);
    expect(Board.isCitySpace(space)).is.true;
    expect(deserialized.board.spaces.map((s) => s.id)).does.not.include(OLD_LUNA_METROPOLIS);
    expect(deserialized.stJosephCathedrals).deep.eq([SpaceName.LUNA_METROPOLIS]);
  });

  it('leaves on-Mars spaces of the larger map alone, though they reuse the old off-Mars ids', () => {
    const [game, player] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA, venusNextExtension: true});
    const marsSpace = game.board.getSpaceOrThrow(OLD_LUNA_METROPOLIS);
    expect(marsSpace.spaceType).not.eq(SpaceType.COLONY);
    game.simpleAddTile(player, marsSpace, {tileType: TileType.CITY});
    game.stJosephCathedrals = [OLD_LUNA_METROPOLIS, SpaceName.LUNA_METROPOLIS];

    const deserialized = Game.deserialize(game.serialize());

    expect(Board.isCitySpace(deserialized.board.getSpaceOrThrow(OLD_LUNA_METROPOLIS))).is.true;
    expect(deserialized.stJosephCathedrals).deep.eq([OLD_LUNA_METROPOLIS, SpaceName.LUNA_METROPOLIS]);
  });
});

describe('spaceLabel', () => {
  it('labels the same id by its position on each map', () => {
    const [standard] = testGame(2, {venusNextExtension: true});
    const [large] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA, venusNextExtension: true});

    // Row A holds five spaces on the standard maps and six on the larger one.
    expect(spaceLabel('08', standard.board.spaces)).eq('B1');
    expect(spaceLabel('08', large.board.spaces)).eq('A6');
    expect(spaceLabel('63', standard.board.spaces)).eq('J5');
    expect(spaceLabel('93', large.board.spaces)).eq('L6');
  });

  it('has no coordinate for off-Mars or unknown spaces', () => {
    const [game] = testGame(2, {venusNextExtension: true});
    expect(spaceLabel(SpaceName.LUNA_METROPOLIS, game.board.spaces)).eq('n/a');
    expect(spaceLabel('93', game.board.spaces)).eq('n/a');
  });
});
