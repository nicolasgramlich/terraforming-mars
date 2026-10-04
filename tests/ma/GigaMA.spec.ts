import {expect} from 'chai';
import {testGame} from '../TestGame';
import {BoardName} from '../../src/common/boards/BoardName';
import {getMilestoneAwardLimits} from '../../src/common/boards/MilestoneAwardLimits';
import {AWARD_COSTS, MAX_MILESTONES} from '../../src/common/constants';

describe('Giga milestones and awards', () => {
  it('standard maps keep three milestones and the 8/14/20 award costs', () => {
    expect(getMilestoneAwardLimits(BoardName.THARSIS)).deep.eq({milestones: MAX_MILESTONES, awardCosts: AWARD_COSTS});

    const [game, player, player2] = testGame(2);
    const costs = [];
    for (const award of game.awards.slice(0, 3)) {
      expect(game.allAwardsFunded()).is.false;
      costs.push(game.getAwardFundingCost());
      game.fundAward(player, award);
    }
    expect(costs).deep.eq([8, 14, 20]);
    expect(game.allAwardsFunded()).is.true;

    for (const milestone of game.milestones.slice(0, 3)) {
      expect(game.allMilestonesClaimed()).is.false;
      game.claimedMilestones.push({player: player2, milestone});
    }
    expect(game.allMilestonesClaimed()).is.true;
  });

  it('offers fifteen milestones, and fifteen awards once Venus adds Venuphile', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    expect(game.milestones).has.length(15);
    expect(game.awards).has.length(14);
    for (const milestone of game.milestones) {
      expect(() => milestone.getScore(player), milestone.name).to.not.throw();
    }
    for (const award of game.awards) {
      expect(() => award.getScore(player), award.name).to.not.throw();
    }

    const [venusGame] = testGame(2, {boardName: BoardName.GIGA, venusNextExtension: true});
    expect(venusGame.awards.map((a) => a.name)).includes('Venuphile');
    expect(venusGame.awards).has.length(15);
  });

  it('allows seven milestones to be claimed', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    for (const milestone of game.milestones.slice(0, 7)) {
      expect(game.allMilestonesClaimed()).is.false;
      game.claimedMilestones.push({player, milestone});
    }
    expect(game.allMilestonesClaimed()).is.true;
  });

  it('allows seven awards to be funded, costing 8 to 20 in steps of 2', () => {
    const [game, player] = testGame(2, {boardName: BoardName.GIGA});
    const costs = [];
    for (const award of game.awards.slice(0, 7)) {
      expect(game.allAwardsFunded()).is.false;
      costs.push(game.getAwardFundingCost());
      game.fundAward(player, award);
    }
    expect(costs).deep.eq([8, 10, 12, 14, 16, 18, 20]);
    expect(game.allAwardsFunded()).is.true;
  });
});
