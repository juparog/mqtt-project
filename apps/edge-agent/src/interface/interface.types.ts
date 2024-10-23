export type SerialProps = {
  path: string;
  baudRate: number;
};

export type SerialCloseProps = {
  path: string;
};

export interface IDeviceInterface {
  listConnections(): Promise<{ path: string; status: string }[]>;
  openConnection(path: string, options?: any): Promise<void>;
  closeConnection(path: string): Promise<void>;
}
