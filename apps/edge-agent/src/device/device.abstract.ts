import { DeviceStatus } from './device.types';

type OnDataListener = (deviceId: string, data: unknown) => void;
type OnDisconnectListener = (deviceId: string) => void;
type OnErrorListener = (deviceId: string, error: Error) => void;

export abstract class DeviceAbstract<Options = unknown> {
  static readonly type: string;
  static availableDevices: () => Promise<unknown[]>;

  private readonly onDataListeners = new Set<OnDataListener>();
  private readonly onDisconnectListeners = new Set<OnDisconnectListener>();
  private readonly onErrorListeners = new Set<OnErrorListener>();

  constructor(
    private readonly deviceId: string,
    protected readonly options?: Options
  ) {}

  abstract connect(): Promise<DeviceStatus>;

  abstract disconnect(): Promise<DeviceStatus>;

  abstract send(data: unknown): Promise<DeviceStatus>;

  abstract setupDataListener(): void;

  abstract setupDisconnectListener(): void;

  abstract setupErrorListener(): void;

  get id(): string {
    return this.deviceId;
  }

  get type(): string {
    return (this.constructor as typeof DeviceAbstract).getType(
      this.constructor.name
    );
  }

  initEvents(): void {
    this.setupDataListener();
    this.setupErrorListener();
    this.setupDisconnectListener();
  }

  addEventListener(event: 'data', listener: OnDataListener): void;
  addEventListener(event: 'disconnect', listener: OnDisconnectListener): void;
  addEventListener(event: 'error', listener: OnErrorListener): void;
  addEventListener(
    event: 'data' | 'disconnect' | 'error',
    listener: OnDataListener | OnDisconnectListener | OnErrorListener
  ): void {
    switch (event) {
      case 'data':
        this.onDataListeners.add(listener as OnDataListener);
        break;
      case 'disconnect':
        this.onDisconnectListeners.add(listener as OnDisconnectListener);
        break;
      case 'error':
        this.onErrorListeners.add(listener as OnErrorListener);
        break;
      default:
        throw new Error(`Unknown event: ${event}`);
    }
  }

  emit(event: 'data', data: unknown): void;
  emit(event: 'disconnect'): void;
  emit(event: 'error', error: Error): void;
  emit(event: 'data' | 'disconnect' | 'error', data?: unknown | Error): void {
    switch (event) {
      case 'data':
        this.onDataListeners.forEach((listener) =>
          listener(this.deviceId, data)
        );
        break;
      case 'disconnect':
        this.onDisconnectListeners.forEach((listener) =>
          listener(this.deviceId)
        );
        break;
      case 'error':
        this.onErrorListeners.forEach((listener) =>
          listener(this.deviceId, data as Error)
        );
        break;
      default:
        throw new Error(`Unknown event: ${event}`);
    }
  }

  static getType(className: string): string {
    if (!this.type) {
      throw new Error(
        `Device type not defined for class: ${className}, please set the static type property`
      );
    }
    return this.type;
  }

  static async listDevices<DeviceInfo = unknown>(): Promise<DeviceInfo[]> {
    if (!this.availableDevices) {
      throw new Error(
        'Device list not available, please set the static availableDevices property'
      );
    }
    return this.availableDevices() as Promise<DeviceInfo[]>;
  }
}
