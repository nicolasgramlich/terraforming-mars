import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {Merchant3} from '../../../src/server/milestones/modular/Merchant3';
import {milestoneManifest} from '../../../src/server/milestones/Milestones';
import {BoardName} from '../../../src/common/boards/BoardName';

describe('Merchant3', () => {
  it('claimable with 3 of every standard resource (plus the claim cost)', () => {
    const [/* game */, player] = testGame(1);
    player.stock.override({megacredits: 100, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 3});
    expect(new Merchant3().canClaim(player)).is.true;
    expect(new Merchant3().getScore(player)).eq(1);
  });

  it('2 of each is not enough (the standard Merchant threshold)', () => {
    const [, player] = testGame(1);
    player.stock.override({megacredits: 100, steel: 2, titanium: 2, plants: 2, energy: 2, heat: 2});
    expect(new Merchant3().canClaim(player)).is.false;
    expect(new Merchant3().getScore(player)).eq(0);
  });

  it('one resource short of 3 is not enough', () => {
    const [, player] = testGame(1);
    player.stock.override({megacredits: 100, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 2});
    expect(new Merchant3().canClaim(player)).is.false;
  });

  it('must keep 3 of each reserved after paying the claim cost', () => {
    const [, player] = testGame(1);
    // 3 of each reserved (including 3 M€), but nothing left to pay the claim cost.
    player.stock.override({megacredits: 3, steel: 3, titanium: 3, plants: 3, energy: 3, heat: 3});
    expect(new Merchant3().canClaim(player)).is.false;
  });

  it('Amazonis Planitia uses the curated milestone set', () => {
    expect(milestoneManifest.boards[BoardName.AMAZONIS_PLANITIA])
      .deep.eq(['Terran5', 'Landshaper', 'Merchant3', 'Sponsor', 'Lobbyist']);
  });
});
