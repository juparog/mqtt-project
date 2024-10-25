export interface IMqttTransport {
  publish<Message = unknown, Options = unknown>(
    topic: string,
    message: Message,
    options?: Options
  ): void;
  subscribe(topic: string, callback: (message: string) => void): void;
  getOptions(): unknown;
}
