export interface IConfigProvider {
  get: <T = unknown>(propertyPath: string) => T;
}
