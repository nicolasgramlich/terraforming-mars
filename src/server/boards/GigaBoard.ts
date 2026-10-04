import {SpaceBonus} from '../../common/boards/SpaceBonus';
import {BoardBuilder} from './BoardBuilder';
import {Random} from '../../common/utils/Random';
import {GameOptions} from '../game/GameOptions';
import {MarsBoard} from './MarsBoard';
import {Space} from './Space';
import {SpaceCosts} from './Board';
import {GIGA_BONUS_OCEAN_COST} from '../../common/constants';

// Giga is an oval map: eleven rows of 175 spaces. It is not a hexagon; the first and last rows are
// three tiles shorter than their neighbours.
export const GIGA_TILES_PER_ROW: ReadonlyArray<number> = [12, 15, 16, 17, 18, 19, 18, 17, 16, 15, 12];

// Zero-based index, in reading order, of Noctis City among the map's spaces.
const NOCTIS_CITY_INDEX = 12 + 15 + 16 + 17 + 18 + 19 + 3;

export class GigaBoard extends MarsBoard {
  public static newInstance(gameOptions: GameOptions, rng: Random): GigaBoard {
    const builder = new BoardBuilder(gameOptions, rng, GIGA_TILES_PER_ROW);

    const PLANT = SpaceBonus.PLANT;
    const STEEL = SpaceBonus.STEEL;
    const TITANIUM = SpaceBonus.TITANIUM;
    const DRAW_CARD = SpaceBonus.DRAW_CARD;
    const HEAT = SpaceBonus.HEAT;
    const MEGACREDITS = SpaceBonus.MEGACREDITS;

    // The 14 spaces the printed map marks with a snowflake are the polar regions: the middle four
    // of rows A and L, and the middle three of rows B and K. Polar Explorer counts tiles on them.

    // Row A (Vastitas Borealis)
    builder.ocean().ocean(TITANIUM, DRAW_CARD).ocean().land(STEEL)
      .polar(STEEL).polar(HEAT, HEAT).polar(HEAT, DRAW_CARD).polar(HEAT, HEAT)
      .land(STEEL).ocean().ocean().ocean();
    // Row B
    builder.ocean().ocean(PLANT).land(PLANT).land(PLANT, PLANT).ocean(PLANT).ocean(PLANT)
      .polar().polar().polar()
      .ocean().ocean().ocean().ocean(STEEL).ocean(TITANIUM, TITANIUM).ocean();
    // Row C (Arcadia, Acidalia, Utopia)
    builder.ocean().land(PLANT).land(STEEL, STEEL).land(PLANT).land(PLANT).land(PLANT, PLANT)
      .ocean(DRAW_CARD).ocean(PLANT, PLANT).ocean(PLANT, PLANT).ocean(PLANT, PLANT).ocean(PLANT, PLANT).ocean(PLANT, PLANT)
      .ocean(STEEL).ocean(DRAW_CARD, DRAW_CARD).ocean(TITANIUM).ocean();
    // Row D (D2 = Acheron, D4 = Alba, D16 = Galaxias, D17 = Hecates Tholus; all volcanic)
    builder.ocean(PLANT).volcanic(PLANT).land(STEEL).volcanic(TITANIUM).land().land(PLANT, PLANT)
      .ocean(DRAW_CARD, DRAW_CARD).ocean(PLANT, PLANT).land(PLANT, PLANT).land(PLANT).land(PLANT).land(PLANT, PLANT)
      .ocean(PLANT, PLANT).ocean(STEEL).ocean(STEEL).volcanic(PLANT).volcanic(TITANIUM, TITANIUM);
    // Row E (E2-E3 = Olympus Mons, E4 = Ascraeus Mons, E5 = Tharsis Tholus, E17 = Elysium Mons; all volcanic)
    builder.ocean(PLANT, PLANT).volcanic(DRAW_CARD, DRAW_CARD, DRAW_CARD).volcanic(STEEL).volcanic(DRAW_CARD).volcanic(MEGACREDITS, MEGACREDITS, MEGACREDITS, MEGACREDITS, MEGACREDITS).land()
      .ocean(PLANT, PLANT).ocean(PLANT, PLANT).land(PLANT).land(DRAW_CARD, DRAW_CARD).land().land().land(PLANT)
      .ocean(TITANIUM, DRAW_CARD).ocean(PLANT, PLANT).ocean(PLANT, PLANT).volcanic(STEEL, STEEL).land(PLANT);
    // Row F, the equator (F3 and F4 = Pavonis Mons, volcanic)
    builder.ocean(PLANT, PLANT).ocean(PLANT, PLANT).volcanic(PLANT).volcanic(PLANT, TITANIUM).land(PLANT, PLANT).land(PLANT).land(PLANT)
      .ocean(PLANT, PLANT).land(PLANT).land().land().land().land().land(PLANT).land(PLANT).land(PLANT)
      .ocean(PLANT, PLANT).ocean(PLANT, PLANT).ocean(PLANT, PLANT);
    // Row G (G3 = Arsia Mons, volcanic; G4 = Noctis City)
    builder.land(PLANT).land(PLANT).volcanic(TITANIUM, DRAW_CARD).land(PLANT, PLANT).doNotShuffleLastSpace().land(PLANT, PLANT).land(PLANT, PLANT)
      .land(PLANT, PLANT).land(PLANT, PLANT).land().land(STEEL).land(STEEL).land()
      .land(PLANT, PLANT).land(PLANT).land(PLANT).land(PLANT).land(PLANT, PLANT).land(PLANT, PLANT);
    // Row H (Hellas basin on the right)
    builder.land().land().land().land(STEEL).land().land(PLANT).land(PLANT).land().land(STEEL).land(STEEL, STEEL).land(STEEL)
      .ocean(PLANT).ocean(PLANT).land(PLANT).land().land(DRAW_CARD).land(DRAW_CARD);
    // Row J (Argyre and Hellas)
    builder.land(STEEL, TITANIUM).land().land(STEEL).land(STEEL, STEEL).land(PLANT)
      .ocean(PLANT, PLANT).ocean(DRAW_CARD, DRAW_CARD).land().land(STEEL).land()
      .ocean(DRAW_CARD).ocean(HEAT, HEAT, HEAT).ocean(PLANT, PLANT).land().land(STEEL).land(STEEL, STEEL);
    // Row K
    builder.land().land().land(DRAW_CARD).land(DRAW_CARD).land(STEEL).ocean(TITANIUM, TITANIUM)
      .polar(HEAT, HEAT).polar(STEEL).polar(HEAT, HEAT)
      .land(PLANT).ocean().ocean(TITANIUM).land().land(STEEL).land();
    // Row L (Planum Australe; L6 lets the player pay to place an ocean)
    builder.land().land().land().land()
      .polar(HEAT, HEAT).polar(SpaceBonus.OCEAN_5MC).doNotShuffleLastSpace().polar().polar(HEAT, HEAT)
      .land().land().land(TITANIUM).land();

    const spaces = builder.build();
    return new GigaBoard(spaces, spaces.filter((space) => space.y >= 0)[NOCTIS_CITY_INDEX].id);
  }

  public override spaceCosts(space: Space): SpaceCosts {
    const costs = super.spaceCosts(space);
    if (space.bonus.includes(SpaceBonus.OCEAN_5MC)) {
      costs.megacredits = GIGA_BONUS_OCEAN_COST;
      costs.tr.oceans = 1;
    }
    return costs;
  }
}
