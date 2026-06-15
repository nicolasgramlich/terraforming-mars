import {expect} from 'chai';
import {testGame} from '../TestGame';
import {chooseMilestonesAndAwards} from '../../src/server/ma/MilestoneAwardSelector';
import {milestoneManifest} from '../../src/server/milestones/Milestones';
import {awardManifest} from '../../src/server/awards/Awards';
import {BoardName} from '../../src/common/boards/BoardName';
import {RandomMAOptionType} from '../../src/common/ma/RandomMAOptionType';
import {DEFAULT_GAME_OPTIONS} from '../../src/server/game/GameOptions';

const MILESTONES = ['Terran5', 'Landshaper', 'Merchant3', 'Sponsor', 'Lobbyist'];
const AWARDS = ['Collector', 'Innovator', 'Constructor', 'Manufacturer', 'Physicist'];

describe('Amazonis Planitia milestones and awards', () => {
  it('declares the curated milestone and award sets', () => {
    expect(milestoneManifest.boards[BoardName.AMAZONIS_PLANITIA]).deep.eq(MILESTONES);
    expect(awardManifest.boards[BoardName.AMAZONIS_PLANITIA]).deep.eq(AWARDS);
  });

  it('fixed (non-random) selection uses the curated sets', () => {
    const mas = chooseMilestonesAndAwards({
      ...DEFAULT_GAME_OPTIONS,
      boardName: BoardName.AMAZONIS_PLANITIA,
      randomMA: RandomMAOptionType.NONE,
    });
    expect(mas.milestones).deep.eq(MILESTONES);
    expect(mas.awards).deep.eq(AWARDS);
  });

  it('the curated set scores without throwing, even without Turmoil/Colonies', () => {
    // testGame defaults to randomMA NONE and no expansions.
    const [game, player] = testGame(2, {boardName: BoardName.AMAZONIS_PLANITIA});

    expect(game.milestones.map((m) => m.name)).deep.eq(MILESTONES);
    expect(game.awards.map((a) => a.name)).deep.eq(AWARDS);

    for (const milestone of game.milestones) {
      expect(() => milestone.getScore(player), milestone.name).to.not.throw();
    }
    for (const award of game.awards) {
      expect(() => award.getScore(player), award.name).to.not.throw();
    }

    // Lobbyist normally reads Turmoil; with Turmoil disabled it scores 0 rather than throwing.
    const lobbyist = game.milestones.find((m) => m.name === 'Lobbyist');
    expect(lobbyist?.getScore(player)).to.eq(0);
  });
});
