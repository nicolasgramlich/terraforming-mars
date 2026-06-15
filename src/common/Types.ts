export type PlayerId = `p${string}`;
export type GameId = `g${string}`;
export type SpectatorId = `s${string}`;
export type ParticipantId = PlayerId | SpectatorId;
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type TwoDigits = `${Digit}${Digit}`;
type ThreeDigits = `${Digit}${Digit}${Digit}`;
// Mars spaces are two or three digit ids. Two digits ('03'..'63') cover the standard 61-space
// maps; three digits give room for larger maps and for off-Mars spaces in the '9xx' range. The
// Moon uses an 'm' prefix with two digits.
export type SpaceId = `${TwoDigits}` | `${ThreeDigits}` | `m${TwoDigits}`;
export type Named<T> = {name: T};

export function isPlayerId(object: any): object is PlayerId {
  return object?.charAt?.(0) === 'p';
}

export function isGameId(object: string): object is GameId {
  return object?.charAt?.(0) === 'g';
}

export function isSpectatorId(object: string): object is SpectatorId {
  return object?.charAt?.(0) === 's';
}

export function isSpaceId(object: string): object is SpaceId {
  return /^([0-9]{2,3}|m[0-9]{2})$/.test(object);
}

export function safeCast<T>(object: any, tester: (object: any) => object is T) {
  if (tester(object)) {
    return object;
  }
  throw new Error('failed cast: ' + tester.name);
}

/**
 * Very similar to `any` but only contains primitives, arrays of primitives, or dictionaries of primitives.
 *
 * An object of this type is guaranteed safe to serialize and deserialize.
 */
export type JSONValue =
    | undefined
    | string
    | number
    | boolean
    | JSONObject
    | Array<JSONValue>;

export type JSONObject = { [x: string]: JSONValue };

