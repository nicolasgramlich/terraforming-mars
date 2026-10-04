import {expect} from 'chai';
import {testGame} from '../TestGame';
import {BoardName} from '../../src/common/boards/BoardName';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {TileType} from '../../src/common/TileType';
import {DesertSettler} from '../../src/server/awards/DesertSettler';
import {PolarExplorer} from '../../src/server/milestones/PolarExplorer';
import {Tropicalist} from '../../src/server/milestones/amazonisPlanitia/Tropicalist';

// The rows (y) each milestone or award counts, on the nine-row standard maps and on the
// eleven-row Amazonis Planitia.
const RUNS = [
  {name: 'Desert Settler', ma: new DesertSettler(), boardName: BoardName.THARSIS, rows: [5, 6, 7, 8]},
  {name: 'Desert Settler', ma: new DesertSettler(), boardName: BoardName.AMAZONIS_PLANITIA, rows: [6, 7, 8, 9, 10]},
  {name: 'Polar Explorer', ma: new PolarExplorer(), boardName: BoardName.THARSIS, rows: [7, 8]},
  {name: 'Polar Explorer', ma: new PolarExplorer(), boardName: BoardName.AMAZONIS_PLANITIA, rows: [9, 10]},
  {name: 'Tropicalist', ma: new Tropicalist(), boardName: BoardName.THARSIS, rows: [3, 4, 5]},
  {name: 'Tropicalist', ma: new Tropicalist(), boardName: BoardName.AMAZONIS_PLANITIA, rows: [4, 5, 6]},
] as const;

describe('Regional milestones and awards', () => {
  for (const run of RUNS) {
    it(`${run.name} on ${run.boardName} counts rows ${run.rows.join(', ')}`, () => {
      const [game, player] = testGame(2, {boardName: run.boardName});
      const countedRows = [];
      for (let y = 0; y <= game.board.bottomRow; y++) {
        const before = run.ma.getScore(player);
        const space = game.board.spaces.find((s) => s.y === y && s.spaceType === SpaceType.LAND && s.tile === undefined)!;
        game.simpleAddTile(player, space, {tileType: TileType.GREENERY});
        if (run.ma.getScore(player) === before + 1) {
          countedRows.push(y);
        }
      }
      expect(countedRows).deep.eq(run.rows);
    });
  }
});
