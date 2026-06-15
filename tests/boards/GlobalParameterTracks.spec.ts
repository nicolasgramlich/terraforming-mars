import {expect} from 'chai';
import {BoardName} from '../../src/common/boards/BoardName';
import {Phase} from '../../src/common/Phase';
import {Resource} from '../../src/common/Resource';
import {getGlobalParameterTracks} from '../../src/common/boards/GlobalParameterTracks';
import {testGame} from '../TestGame';
import {setOxygenLevel, setTemperature} from '../TestingUtils';

describe('GlobalParameterTracks', () => {
  it('standard maps keep the classic track bonuses', () => {
    const tracks = getGlobalParameterTracks(BoardName.THARSIS);
    expect(tracks.temperature).deep.eq([
      {value: -24, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
      {value: -20, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
      {value: 0, bonus: {type: 'ocean'}},
    ]);
    expect(tracks.oxygen).deep.eq([
      {value: 8, bonus: {type: 'temperature'}},
    ]);
  });

  it('Amazonis Planitia has its own track bonuses', () => {
    const tracks = getGlobalParameterTracks(BoardName.AMAZONIS_PLANITIA);
    expect(tracks.temperature).deep.eq([
      {value: -24, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
      {value: -20, bonus: {type: 'production', resource: Resource.HEAT, amount: 1}},
      {value: -12, bonus: {type: 'production', resource: Resource.PLANTS, amount: 1}},
      {value: 0, bonus: {type: 'ocean'}},
    ]);
    expect(tracks.oxygen).deep.eq([
      {value: 7, bonus: {type: 'card', amount: 1}},
      {value: 12, bonus: {type: 'temperature'}},
    ]);
  });

  it('Amazonis Planitia grants plant production at -12C', () => {
    const [game, player] = testGame(1, {boardName: BoardName.AMAZONIS_PLANITIA});
    game.phase = Phase.ACTION;
    setTemperature(game, -14);

    const before = player.production.plants;
    game.increaseTemperature(player, 1);
    expect(game.getTemperature()).eq(-12);
    expect(player.production.plants).eq(before + 1);
  });

  it('standard maps grant no production at -12C', () => {
    const [game, player] = testGame(1);
    game.phase = Phase.ACTION;
    setTemperature(game, -14);

    const before = player.production.plants;
    game.increaseTemperature(player, 1);
    expect(player.production.plants).eq(before);
  });

  it('Amazonis Planitia draws a card at 7% oxygen', () => {
    const [game, player] = testGame(1, {boardName: BoardName.AMAZONIS_PLANITIA});
    game.phase = Phase.ACTION;
    setOxygenLevel(game, 6);

    const before = player.cardsInHand.length;
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(7);
    expect(player.cardsInHand.length).eq(before + 1);
  });

  it('Amazonis Planitia raises temperature at 12% oxygen, not 8%', () => {
    const [game, player] = testGame(1, {boardName: BoardName.AMAZONIS_PLANITIA});
    game.phase = Phase.ACTION;
    setTemperature(game, -10);

    // Crossing 8% does not raise temperature on this map.
    setOxygenLevel(game, 7);
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(8);
    expect(game.getTemperature()).eq(-10);

    // Crossing 12% raises temperature one step.
    setOxygenLevel(game, 11);
    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(12);
    expect(game.getTemperature()).eq(-8);
  });

  it('standard maps still raise temperature at 8% oxygen', () => {
    const [game, player] = testGame(1);
    game.phase = Phase.ACTION;
    setTemperature(game, -10);
    setOxygenLevel(game, 7);

    game.increaseOxygenLevel(player, 1);
    expect(game.getOxygenLevel()).eq(8);
    expect(game.getTemperature()).eq(-8);
  });

  it('player-benefit bonuses are skipped in the solar phase, but cascades still apply', () => {
    const [game, player] = testGame(1, {boardName: BoardName.AMAZONIS_PLANITIA});
    game.phase = Phase.SOLAR;

    // The 7% oxygen card draw is a player benefit and is skipped during World Government terraforming.
    setOxygenLevel(game, 6);
    const cardsBefore = player.cardsInHand.length;
    game.increaseOxygenLevel(player, 1);
    expect(player.cardsInHand.length).eq(cardsBefore);

    // The 12% oxygen -> temperature cascade is a global effect and applies regardless.
    setTemperature(game, -10);
    setOxygenLevel(game, 11);
    game.increaseOxygenLevel(player, 1);
    expect(game.getTemperature()).eq(-8);
  });
});
