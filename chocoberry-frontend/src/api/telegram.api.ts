import api from './axios';

export interface TelegramStatus {
  linked: boolean;
  linkedAt?: string;
}

export interface ConnectLink {
  url: string;
  token: string;
}

export const telegramApi = {
  getStatus: (): Promise<TelegramStatus> =>
    api.get('/telegram/status'),

  getConnectLink: (): Promise<ConnectLink> =>
    api.get('/telegram/connect-link'),

  unsubscribe: (): Promise<{ ok: boolean }> =>
    api.delete('/telegram/unsubscribe'),
};
