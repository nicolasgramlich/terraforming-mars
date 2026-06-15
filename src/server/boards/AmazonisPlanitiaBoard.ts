import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {BoardBuilder} from './BoardBuilder';
import {Random} from '../../common/utils/Random';
import {GameOptions} from '../game/GameOptions';
import {MarsBoard} from './MarsBoard';

// Amazonis Planitia is one hex-ring larger than the standard maps: eleven rows of tile counts
// [6,7,8,9,10,11,10,9,8,7,6] for 91 spaces (the standard maps are nine rows / 61 spaces).
export const AMAZONIS_PLANITIA_TILES_PER_ROW: ReadonlyArray<number> = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];

export class AmazonisPlanitiaBoard extends MarsBoard {
  public static newInstance(gameOptions: GameOptions, rng: Random): AmazonisPlanitiaBoard {
    const builder = new BoardBuilder(gameOptions, rng, AMAZONIS_PLANITIA_TILES_PER_ROW);

    const PLANT = SpaceBonus.PLANT;
    const STEEL = SpaceBonus.STEEL;
    const TITANIUM = SpaceBonus.TITANIUM;
    const DRAW_CARD = SpaceBonus.DRAW_CARD;
    const ENERGY = SpaceBonus.ENERGY;
    const WILD = SpaceBonus.WILD;
    // "lobbyist" in the layout maps to the delegate (lobby a party) placement bonus.
    const DELEGATE = SpaceBonus.DELEGATE;

    // Row A
    builder.land(STEEL).land(STEEL, STEEL).land(STEEL).land(DRAW_CARD).land(TITANIUM, TITANIUM).land();
    // Row B
    builder.ocean().land(DELEGATE).land(STEEL).land().land(PLANT).ocean(PLANT, PLANT).ocean(TITANIUM, TITANIUM);
    // Row C
    builder.ocean(STEEL, STEEL).land().land(DRAW_CARD, DRAW_CARD).land().land(PLANT).ocean().land().land();
    // Row D
    builder.land(TITANIUM).ocean().land().land().land(PLANT).land(PLANT).land(PLANT, PLANT).land(PLANT).land(PLANT, DRAW_CARD);
    // Row E (E1 = Hecates Tholus, volcanic)
    builder.volcanic(STEEL, STEEL).land(PLANT).land(WILD).land(PLANT).ocean(DRAW_CARD).land(PLANT).land(PLANT, PLANT).land(PLANT).land(WILD).ocean(PLANT, PLANT);
    // Row F
    builder.land(PLANT).land(PLANT).land(PLANT, PLANT).land(PLANT, PLANT).ocean(PLANT, PLANT).ocean(PLANT, PLANT)
      .land(STEEL, PLANT, PLANT).land(PLANT).land().land(PLANT).ocean(DRAW_CARD);
    // Row G
    builder.land(PLANT).land(PLANT, PLANT).ocean(PLANT, PLANT).land(ENERGY, ENERGY).land(ENERGY).land(ENERGY, ENERGY).land().land(PLANT).land(PLANT).land();
    // Row H (H7 = Olympus Mons, H9 = Ascraeus Mons; both volcanic)
    builder.land(PLANT).ocean(DRAW_CARD, DRAW_CARD).land(PLANT).land(ENERGY).land(ENERGY, ENERGY).land(PLANT).volcanic(DELEGATE, DELEGATE).land(STEEL).volcanic(DELEGATE);
    // Row J (J8 = Pavonis Mons, volcanic)
    builder.ocean(STEEL, TITANIUM).land().land(TITANIUM).land().land().land(PLANT, PLANT).land().volcanic(TITANIUM);
    // Row K (K7 = Arsia Mons, volcanic)
    builder.ocean().land().land(WILD).land().land(PLANT, PLANT, PLANT).land(PLANT, PLANT).volcanic(STEEL, STEEL);
    // Row L
    builder.land().land(STEEL, TITANIUM).land(STEEL, STEEL).land().land(PLANT).land(DRAW_CARD);

    const spaces = builder.build();
    return new AmazonisPlanitiaBoard(spaces);
  }
}
