import type {ShipType} from '../shared/game.ts';
import type {CharacterProfile} from './characters/config.ts';
import {profileIdFor} from './characters/config.ts';
import generated from './characters/ships.generated.json' with {type:'json'};

export interface ShipArtIdentity {name:string;avatar:string;portrait:string}
export interface ShipArtManifest {
 profiles:Record<string,CharacterProfile>;
 catalog:Record<string,string>;
 historical:Record<string,Record<string,string>>;
 templates:Partial<Record<ShipType,string>>;
 identities:Record<string,ShipArtIdentity>;
}
export const shipArt = generated as unknown as ShipArtManifest;
/** Historical unit IDs are scoped by scenario; labels are never used as identities. */
export function shipCharacterProfile(ship:{id:string;template:string;catalogId?:string},scenarioId?:string,manifest:ShipArtManifest=shipArt):string {
 const identity=scenarioId ? manifest.historical[scenarioId]?.[ship.id] : ship.catalogId && manifest.catalog[ship.catalogId];
 return identity || manifest.templates[ship.template as ShipType] || profileIdFor(ship.template);
}
export function catalogArt(catalogId:string,manifest:ShipArtManifest=shipArt):ShipArtIdentity|undefined {
 return manifest.identities[manifest.catalog[catalogId]];
}
