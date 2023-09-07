declare module '*/planets.yml' {
  export interface Planet {
    readonly id: string;
    readonly name: string;
    readonly background: string;
    readonly dark: boolean;
    readonly rotationTime: number;
    readonly revolutionTime: number;
  }

  declare const planets: readonly Planet[];

  export default planets;
}
