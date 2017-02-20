import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Message {
  action?: string;
  data?: string;
}

export class AppConnectionEvent {
  constructor(public msg: Message) {}
}
export class ConnectedEvent extends AppConnectionEvent {}
export class ReceivedEvent extends AppConnectionEvent {}
export class DisconnectedEvent extends AppConnectionEvent {}
export class PasteDoneEvent extends AppConnectionEvent {}
export class StorageDoneEvent extends AppConnectionEvent {}
export class FontRecievedEvent extends AppConnectionEvent {}

const eventActions: {
  [key: string]: typeof AppConnectionEvent
} = {
  connected: ConnectedEvent,
  onReceive: ReceivedEvent,
  disconnected: DisconnectedEvent,
  onPasteDone: PasteDoneEvent,
  onStorageDone: StorageDoneEvent,
  onSymFont: FontRecievedEvent
};

export class AppConnection {
  connected = false;
  appId = 'hhnlfapopmaimdlldbknjdgekpgffmbo';
  appPort: chrome.runtime.Port;
  events = new BehaviorSubject(null);

  async connectAppPort() {
    await this.checkChromeApp();

    this.appPort = chrome.runtime.connect(this.appId);
    this.appPort.onMessage.addListener((msg: Message) => {
      const eventType = eventActions[msg.action];
      if (eventType) {
        this.events.next(new eventType(msg));
      }
    });

    this.appPort.onDisconnect.addListener(port => {
      this.events.next(new DisconnectedEvent(null));
    });
    this.connected = true;
  }

  connectTcp(host: string, port: number, keepAlive: any) {
    if (!this.connected) return;

    this.appPort.postMessage({ action: 'connect', host, port, keepAlive });
  }

  sendTcp(data: string) {
    if (!this.appPort || !this.connected) return;

    // because ptt seems to reponse back slowly after large
    // chunk of text is pasted, so better to split it up.
    const chunk = 1000;
    const dataLength = data.length;
    for (let i = 0; i < dataLength; i += chunk) {
      this.appPort.postMessage({
        action: 'send',
        data: data.substring(i, i + chunk)
      });
    }
  }

  disconnectTcp() {
    if (!this.connected) return;
    if (!this.appPort) return this.connected = false;

    try {
      this.appPort.postMessage({ action: 'disconnect' });
    } catch (e) {
    }
  }

  async checkChromeApp() {
    if (!chrome.runtime) {
      // show message about not on chrome
      return false;
    }

    return new Promise<any>((resolve, reject) => {
      chrome.runtime.sendMessage(this.appId, { action: 'status' }, (res) => {
        if (!res) return reject();
        resolve();
      });
    });
  }
}