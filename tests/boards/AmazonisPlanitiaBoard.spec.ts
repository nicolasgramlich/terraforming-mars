import {expect} from 'chai';
import {AmazonisPlanitiaBoard, AMAZONIS_PLANITIA_TILES_PER_ROW} from '../../src/server/boards/AmazonisPlanitiaBoard';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';
import {SeededRandom} from '../../src/common/utils/Random';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {Board} from '../../src/server/boards/Board';
import {BoardName} from '../../src/common/boards/BoardName';
import {Game} from '../../src/server/Game';
import {TileType} from '../../src/common/TileType';
import {testGame} from '../TestGame';
import {marsTileLabel, getSpaceName} from '../../src/common/boards/spaces';
import {TharsisBoard} from '../../src/server/boards/TharsisBoard';
import * as constants from '../../src/common/constants';

describe('AmazonisPlanitiaBoard', () => {
  const board = AmazonisPlanitiaBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
  const marsSpaces = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);

  it('is one ring larger than the standard map: 91 spaces over 11 rows', () => {
    expect(AMAZONIS_PLANITIA_TILES_PER_ROW).deep.eq([6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6]);
    expect(marsSpaces).has.length(91);
  });

  it('has the expected per-row tile distribution and centered x-coordinates', () => {
    const maxTiles = Math.max(...AMAZONIS_PLANITIA_TILES_PER_ROW);
    for (let y = 0; y < AMAZONIS_PLANITIA_TILES_PER_ROW.length; y++) {
      const row = marsSpaces.filter((s) => s.y === y).sort((a, b) => a.x - b.x);
      const tilesInRow = AMAZONIS_PLANITIA_TILES_PER_ROW[y];
      expect(row, `row ${y}`).has.length(tilesInRow);
      // Each row is centered: the widest row spans x=0..10, narrower rows are inset by (maxTiles - tiles).
      expect(row[0].x, `row ${y} first x`).eq(maxTiles - tilesInRow);
      expect(row[row.length - 1].x, `row ${y} last x`).eq(maxTiles - 1);
    }
  });

  it('spans x,y in 0..10 with ids 03..93', () => {
    expect(Math.max(...marsSpaces.map((s) => s.x))).eq(10);
    expect(Math.max(...marsSpaces.map((s) => s.y))).eq(10);
    expect(Math.min(...marsSpaces.map((s) => s.x))).eq(0);
    const ids = marsSpaces.map((s) => s.id).sort();
    expect(ids[0]).eq('03');
    expect(ids[ids.length - 1]).eq('93');
  });

  it('computes hex adjacency correctly for the larger hexagon', () => {
    // The six corners of a radius-6 hexagon each have three neighbours.
    const corners = [[5, 0], [10, 0], [0, 5], [10, 5], [5, 10], [10, 10]];
    for (const [x, y] of corners) {
      const space = marsSpaces.find((s) => s.x === x && s.y === y);
      expect(space, `corner ${x},${y}`).is.not.undefined;
      expect(board.getAdjacentSpaces(space!), `corner ${x},${y}`).has.length(3);
    }
    // Every space has between 3 and 6 neighbours; a sampled interior space has 6.
    for (const space of marsSpaces) {
      const n = board.getAdjacentSpaces(space).length;
      expect(n, `space ${space.id}`).is.least(3).and.is.most(6);
    }
    const interior = marsSpaces.find((s) => s.x === 5 && s.y === 5);
    expect(board.getAdjacentSpaces(interior!)).has.length(6);
  });

  it('gives every space a unique coordinate label (no "n/a" in the coords view)', () => {
    // middleRow = maxY / 2 = 5 for this 11-row map.
    const labels = marsSpaces.map((s) => marsTileLabel(s.x, s.y, 5));
    expect(labels.every((l) => l !== 'n/a'), 'no n/a labels').is.true;
    expect(new Set(labels).size, 'labels are unique').eq(marsSpaces.length);
    expect(marsTileLabel(5, 0, 5)).eq('A1'); // top row
    expect(marsTileLabel(0, 5, 5)).eq('F1'); // middle row, leftmost
    expect(marsTileLabel(10, 5, 5)).eq('F11'); // middle row, rightmost
    expect(marsTileLabel(5, 10, 5)).eq('L1'); // bottom row
  });

  it('reproduces the standard map coordinate labels exactly (no regression)', () => {
    const tharsis = TharsisBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
    for (const s of tharsis.spaces.filter((s) => s.spaceType !== SpaceType.COLONY)) {
      expect(marsTileLabel(s.x, s.y, 4), s.id).eq(getSpaceName(s.id));
    }
  });

  it('has 30 perimeter (edge) spaces', () => {
    // Perimeter of a hexagon with 6 tiles per side is 6 * (6 - 1) = 30.
    expect(board.getEdges()).has.length(30);
  });

  it('has enough ocean spaces to fully terraform the planet', () => {
    const oceanSpaces = marsSpaces.filter((s) => s.spaceType === SpaceType.OCEAN);
    expect(oceanSpaces.length).is.least(constants.MAX_OCEAN_TILES);
  });

  it('every space carries a tile type and unique id', () => {
    const ids = new Set(board.spaces.map((s) => s.id));
    expect(ids.size).eq(board.spaces.length);
    board.spaces.forEach((space) => {
      expect(Board.deserializeSpace(space, []).id, space.id).eq(space.id);
    });
  });

  it('raises the global parameter maximums to 11 oceans / +14C / 18% oxygen', () => {
    const [game] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA});
    expect(game.globalParameterMaximums).deep.eq({oceans: 11, temperature: 14, oxygen: 18});
  });

  it('leaves standard maps at the default maximums', () => {
    const [game] = testGame(2, {boardName: BoardName.THARSIS});
    expect(game.globalParameterMaximums).deep.eq({oceans: 9, temperature: 8, oxygen: 14});
  });

  it('lets temperature and oxygen rise to the raised maximums', () => {
    const [game, player] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA});
    for (let i = 0; i < 40; i++) {
      game.increaseTemperature(player, 1);
      game.increaseOxygenLevel(player, 1);
    }
    expect(game.getTemperature()).eq(14);
    expect(game.getOxygenLevel()).eq(18);
  });

  it('is fully terraformed only once oceans/temperature/oxygen reach the raised maximums', () => {
    const [game, player] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA});
    for (let i = 0; i < 40; i++) {
      game.increaseTemperature(player, 1);
      game.increaseOxygenLevel(player, 1);
    }
    // Temperature and oxygen are maxed but oceans are not, so the planet is not terraformed.
    expect(game.marsIsTerraformed()).is.false;
    const oceanSpaces = game.board.getAvailableSpacesForOcean(player);
    expect(oceanSpaces.length).is.least(11);
    for (let i = 0; game.canAddOcean() && i < oceanSpaces.length; i++) {
      game.addOcean(player, oceanSpaces[i]);
    }
    expect(game.board.getOceanSpaces().length).eq(11);
    expect(game.canAddOcean()).is.false;
    expect(game.marsIsTerraformed()).is.true;
  });

  it('supports a full game: placement and serialize/deserialize round-trip', () => {
    const [game, player] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA});
    expect(game.board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY)).has.length(91);

    const citySpace = game.board.getAvailableSpacesForType(player, 'city')[0];
    game.addCity(player, citySpace);

    const deserialized = Game.deserialize(game.serialize());
    expect(deserialized.board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY)).has.length(91);
    expect(Board.isCitySpace(deserialized.board.getSpaceOrThrow(citySpace.id))).is.true;
  });
});
