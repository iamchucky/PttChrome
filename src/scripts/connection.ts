export interface Connection {
  connect(host: string, port: number): void;
  send(str: string): void;
  convSend(str: string): void;
  sendNaws(): void;
}