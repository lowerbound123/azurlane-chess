export type VoiceAction='skill'|'lose'|'victory';
export type MusicTrack='main-menu'|'stage-select'|'fleet-assembly'|'archive'|'port'|'campaign'|'combat';
export interface RuntimeAudioCatalog {
 music:Partial<Record<MusicTrack,string>>;
 voices:Record<string,Record<VoiceAction,string[]>>;
 effects:Record<string,string>;
}
