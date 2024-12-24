/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare interface String {
  isNullOrWhitespace(): boolean;
  isValidEmail(): boolean;
  truncate(n: number): string;
  trimAllSpace(): string;
}

declare interface Window {
  devtools: {
    isOpen: boolean;
    orientation: any;
  };
}
