import Type from 'typebox';
import Value from 'typebox/value';
import generated from './contracts.generated.json' with {type:'json'};
import type {Identity,User,OnlineState,RoundMessage,PublicConfig,MatchList,MatchRecord} from './network.ts';
import type {Plans} from './game.ts';
/** Schemas are generated from the same shared interfaces; generation is checked before each build. */
export const contracts={Identity:Type.Unsafe<Identity>(generated.Identity),User:Type.Unsafe<User>(generated.User),OnlineState:Type.Unsafe<OnlineState>(generated.OnlineState),RoundMessage:Type.Unsafe<RoundMessage>(generated.RoundMessage),PublicConfig:Type.Unsafe<PublicConfig>(generated.PublicConfig),MatchList:Type.Unsafe<MatchList>(generated.MatchList),MatchRecord:Type.Unsafe<MatchRecord>(generated.MatchRecord),Plans:Type.Unsafe<Plans>(generated.Plans)};
export function parseContract<S extends Type.TSchema>(schema:S,value:unknown):Type.Static<S>{if(!Value.Check(schema,value))throw new Error('服务器返回的数据格式无效');return value;}
