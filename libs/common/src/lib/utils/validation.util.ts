export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function stringToBoolean(str: string): boolean {
  return str === 'true';
}
