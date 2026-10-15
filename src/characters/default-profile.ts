import type {CharacterProfile} from './config.ts';
export const DEFAULT_CHARACTER_PROFILE:CharacterProfile = {
      skeleton: 'characters/default/sailor.json', atlas: 'characters/default/sailor.atlas',
      runtimeVersion: '3.8', format: 'json', scale: .012, offset: [0, 0], skin: 'default',
      animations: { idle: 'stand', move: 'move', torpedo: 'attack', fire: 'attack', mainFire:'attack_left', hit: 'yun', dead:'dead', dance:'dance', yun:'yun', aircraft: 'attack', sweep: 'attack' },
    };
