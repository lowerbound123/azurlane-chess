import {inject,type InjectionKey} from 'vue';
import type {createAppSession} from './app-session.ts';

export const SESSION_KEY:InjectionKey<ReturnType<typeof createAppSession>> = Symbol('azurlane-game-session');
export function useAppSession() {
  const session = inject(SESSION_KEY);
  if (!session) throw new Error('Game page must be inside the application shell');
  return session;
}
