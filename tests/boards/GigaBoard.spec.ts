import {expect} from 'chai';
import {GigaBoard, GIGA_TILES_PER_ROW} from '../../src/server/boards/GigaBoard';
import {TharsisBoard} from '../../src/server/boards/TharsisBoard';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';
import {SeededRandom} from '../../src/common/utils/Random';
import {SpaceType} from '../../src/common/boards/SpaceType';
import {SpaceBonus} from '../../src/common/boards/SpaceBonus';
import {BoardName} from '../../src/common/boards/BoardName';
import {Space} from '../../src/server/boards/Space';
import {MarsBoard} from '../../src/server/boards/MarsBoard';
import {spaceLabel} from '../../src/common/boards/spaces';
import {TileType} from '../../src/common/TileType';
import {testGame} from '../TestGame';
import {maxOutOceans, runAllActions, setOxygenLevel, setTemperature} from '../TestingUtils';
import {Phase} from '../../src/common/Phase';
import {TemperatureRequirement} from '../../src/server/cards/requirements/TemperatureRequirement';
import {OxygenRequirement} from '../../src/server/cards/requirements/OxygenRequirement';
import {OceanRequirement} from '../../src/server/cards/requirements/OceanRequirement';
import {IProjectCard} from '../../src/server/cards/IProjectCard';
import {Inventrix} from '../../src/server/cards/corporation/Inventrix';

// Where a space sits on the page, in tile widths: rows are centred, so neighbours are exactly the
// spaces one tile width away.
function position(space: Space, tilesPerRow: ReadonlyArray<number>, rowStartX: number): {px: number, py: number} {
  return {px: (space.x - rowStartX) - tilesPerRow[space.y] / 2, py: space.y};
}

function geometricNeighbours(board: MarsBoard, tilesPerRow: ReadonlyArray<number>): Map<string, Array<string>> {
  const marsSpaces = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);
  const rowStart = (y: number) => Math.min(...marsSpaces.filter((s) => s.y === y).map((s) => s.x));
  const positions = marsSpaces.map((space) => ({space, ...position(space, tilesPerRow, rowStart(space.y))}));
  const result = new Map<string, Array<string>>();
  for (const a of positions) {
    const neighbours = positions.filter((b) => {
      if (a === b) {
        return false;
      }
      const dy = Math.abs(a.py - b.py);
      const dx = Math.abs(a.px - b.px);
      return (dy === 0 && dx === 1) || (dy === 1 && dx === 0.5);
    });
    result.set(a.space.id, neighbours.map((n) => n.space.id).sort());
  }
  return result;
}

describe('GigaBoard', () => {
  const board = GigaBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
  const marsSpaces = board.spaces.filter((s) => s.spaceType !== SpaceType.COLONY);

  it('is an oval of 175 spaces over 11 rows', () => {
    expect(GIGA_TILES_PER_ROW).deep.eq([12, 15, 16, 17, 18, 19, 18, 17, 16, 15, 12]);
    expect(marsSpaces).has.length(175);
    for (let y = 0; y < GIGA_TILES_PER_ROW.length; y++) {
      expect(marsSpaces.filter((s) => s.y === y), `row ${y}`).has.length(GIGA_TILES_PER_ROW[y]);
    }
    const ids = marsSpaces.map((s) => Number(s.id));
    expect(Math.min(...ids)).eq(3);
    expect(Math.max(...ids)).eq(177);
  });

  it('has 55 ocean spaces and 12 volcanic spaces', () => {
    expect(marsSpaces.filter((s) => s.spaceType === SpaceType.OCEAN)).has.length(55);
    expect(marsSpaces.filter((s) => s.volcanic)).has.length(12);
  });

  it('computes adjacency for the oval, including across the trimmed rows', () => {
    const expected = geometricNeighbours(board, GIGA_TILES_PER_ROW);
    for (const space of marsSpaces) {
      const actual = board.getAdjacentSpaces(space).map((s) => s.id).sort();
      expect(actual, `space ${space.id} (${space.x},${space.y})`).deep.eq(expected.get(space.id));
    }
  });

  it('the same adjacency check holds for a standard map', () => {
    const tharsis = TharsisBoard.newInstance(DEFAULT_GAME_OPTIONS, new SeededRandom(0));
    const expected = geometricNeighbours(tharsis, [5, 6, 7, 8, 9, 8, 7, 6, 5]);
    for (const space of tharsis.spaces.filter((s) => s.spaceType !== SpaceType.COLONY)) {
      const actual = tharsis.getAdjacentSpaces(space).map((s) => s.id).sort();
      expect(actual, `space ${space.id}`).deep.eq(expected.get(space.id));
    }
  });

  it('edges are the spaces with fewer than six neighbours', () => {
    const edges = board.getEdges();
    // Both end rows, both ends of the nine rows between, and on each side of the second and
    // second-to-last rows the tile next to the end, which overhangs the shorter end row.
    expect(edges).has.length(12 + 12 + 9 * 2 + 4);
    for (const space of marsSpaces.filter((s) => s.y === 0 || s.y === 10)) {
      expect(edges).includes(space);
    }
    const middle = marsSpaces.filter((s) => s.y === 5).sort((a, b) => a.x - b.x);
    expect(edges).includes(middle[0]);
    expect(edges).does.not.include(middle[1]);
  });

  it('labels spaces by their position in the row', () => {
    const row = (y: number) => marsSpaces.filter((s) => s.y === y).sort((a, b) => a.x - b.x);
    expect(spaceLabel(row(0)[0].id, board.spaces)).eq('A1');
    expect(spaceLabel(row(0)[11].id, board.spaces)).eq('A12');
    expect(spaceLabel(row(5)[18].id, board.spaces)).eq('F19');
    expect(spaceLabel(row(10)[0].id, board.spaces)).eq('L1');
  });

  it('reserves Noctis City', () => {
    const noctis = board.getSpaceOrThrow(board.noctisCitySpaceId!);
    expect(spaceLabel(noctis.id, board.spaces)).eq('G4');
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    expect(game.board.getAvailableSpacesOnLand(player).map((s) => s.id)).does.not.include(noctis.id);
  });

  it('has 21 oceans, 1C temperature steps and half-percent oxygen steps', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    game.phase = Phase.ACTION;
    expect(game.globalParameterMaximums).deep.eq({oceans: 21, temperature: 9, oxygen: 15});

    const tr = player.terraformRating;
    game.increaseTemperature(player, 1);
    expect(game.getTemperature()).eq(-29);
    game.increaseTemperature(player, 3);
    expect(game.getTemperature()).eq(-26);
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(0.5);
    game.increaseOxygenLevel(player, 2);
    expect(game.getOxygenLevel()).eq(1.5);
    expect(player.terraformRating).eq(tr + 7);
  });

  it('stops at the maximums', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    game.phase = Phase.ACTION;
    const tr = player.terraformRating;

    setTemperature(game, 8);
    game.increaseTemperature(player, 3);
    expect(game.getTemperature()).eq(9);

    setOxygenLevel(game, 14.5);
    game.increaseOxygenLevel(player, 2);
    expect(game.getOxygenLevel()).eq(15);

    expect(player.terraformRating).eq(tr + 2);
  });

  it('lowers the parameters one step at a time', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    setTemperature(game, -10);
    setOxygenLevel(game, 4);
    game.increaseTemperature(player, -2);
    game.increaseOxygenLevel(player, -2);
    expect(game.getTemperature()).eq(-12);
    expect(game.getOxygenLevel()).eq(3);
  });

  it('grants the track bonuses: heat production at -24C and -20C, an ocean at 0C, temperature at 6% oxygen', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    game.phase = Phase.ACTION;

    setTemperature(game, -25);
    game.increaseTemperature(player, 1);
    expect(player.production.heat).eq(1);
    setTemperature(game, -21);
    game.increaseTemperature(player, 1);
    expect(player.production.heat).eq(2);

    setTemperature(game, -1);
    game.increaseTemperature(player, 1);
    expect(game.deferredActions.length).eq(1);
    game.deferredActions.pop();

    setTemperature(game, -10);
    setOxygenLevel(game, 5.5);
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(6);
    expect(game.getTemperature()).eq(-9);
    game.increaseOxygenLevel(player, 1);
    expect(game.getTemperature()).eq(-9);
  });

  it('card requirements stay in degrees and percent; leniency counts steps', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    const card = {} as IProjectCard;
    const temperature = new TemperatureRequirement({count: -6});
    const oxygen = new OxygenRequirement({count: 5});

    setTemperature(game, -7);
    setOxygenLevel(game, 4.5);
    expect(temperature.satisfies(player, card)).is.false;
    expect(oxygen.satisfies(player, card)).is.false;
    expect(temperature.distance(player)).eq(1);
    expect(oxygen.distance(player)).eq(1);

    setTemperature(game, -6);
    setOxygenLevel(game, 5);
    expect(temperature.satisfies(player, card)).is.true;
    expect(oxygen.satisfies(player, card)).is.true;

    // Inventrix: +/-2 steps, which is 2C and 1% here.
    player.playCorporationCard(new Inventrix());
    setTemperature(game, -8);
    setOxygenLevel(game, 4);
    expect(temperature.satisfies(player, card)).is.true;
    expect(oxygen.satisfies(player, card)).is.true;
    setTemperature(game, -9);
    setOxygenLevel(game, 3.5);
    expect(temperature.satisfies(player, card)).is.false;
    expect(oxygen.satisfies(player, card)).is.false;
  });

  it('doubles ocean requirements', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    const card = {} as IProjectCard;
    const atLeast = new OceanRequirement({count: 3});
    const atMost = new OceanRequirement({count: 3, max: true});

    maxOutOceans(player, 5);
    expect(atLeast.satisfies(player, card)).is.false;
    expect(atLeast.distance(player)).eq(1);
    expect(atMost.satisfies(player, card)).is.true;

    maxOutOceans(player, 6);
    expect(atLeast.satisfies(player, card)).is.true;
    expect(atMost.satisfies(player, card)).is.true;

    maxOutOceans(player, 7);
    expect(atMost.satisfies(player, card)).is.false;

    // Inventrix's leniency is still two oceans, not four.
    player.playCorporationCard(new Inventrix());
    expect(new OceanRequirement({count: 5}).satisfies(player, card)).is.false;
    maxOutOceans(player, 8);
    expect(new OceanRequirement({count: 5}).satisfies(player, card)).is.true;
    expect(game.board.getOceanSpaces()).has.length(8);
  });

  it('standard maps keep ocean requirements as printed', () => {
    const [/* game */, player] = testGame(2);
    const card = {} as IProjectCard;
    maxOutOceans(player, 3);
    expect(new OceanRequirement({count: 3}).satisfies(player, card)).is.true;
    expect(new OceanRequirement({count: 4}).satisfies(player, card)).is.false;
  });

  it('the south pole space places an ocean for 5 M€', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    game.phase = Phase.ACTION;
    const space = game.board.spaces.find((s) => s.bonus.includes(SpaceBonus.OCEAN_5MC))!;
    expect(spaceLabel(space.id, game.board.spaces)).eq('L6');

    player.megaCredits = 4;
    expect(game.board.getAvailableSpacesOnLand(player).map((s) => s.id)).does.not.include(space.id);
    player.megaCredits = 5;
    expect(game.board.getAvailableSpacesOnLand(player).map((s) => s.id)).includes(space.id);

    game.addTile(player, space, {tileType: TileType.GREENERY});
    runAllActions(game);
    expect(player.megaCredits).eq(0);
    expect(player.popWaitingFor()).is.not.undefined;
  });
});
