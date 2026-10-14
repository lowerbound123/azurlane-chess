import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, realpathSync, existsSync, chmodSync } from 'node:fs';
import path from 'node:path';
import type {SessionUser,StoredMatch,StoredUser,NewUser} from './types.ts';
import type {MatchRecord,MatchList} from '../shared/network.ts';
import {isRecord} from '../src/lib/errors.ts';
import {parseContract,contracts} from '../shared/contracts.ts';
const stringField=(row:Record<string,unknown>,key:string):string=>{const value=row[key];if(typeof value!=='string')throw new Error('账号数据库字段无效');return value;};

export class AccountStore {
  readonly db:DatabaseSync;
  constructor(filename:string, { staticRoot }:{staticRoot?:string} = {}) {
    if (filename !== ':memory:') {
      filename = path.resolve(filename);
      mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
      const actual = existsSync(filename) ? realpathSync(filename) : path.join(realpathSync(path.dirname(filename)), path.basename(filename));
      const publicRoot = staticRoot && (existsSync(staticRoot) ? realpathSync(staticRoot) : path.resolve(staticRoot));
      if (publicRoot && (actual === publicRoot || actual.startsWith(publicRoot + path.sep))) throw new Error('账号数据库不能放在网页公开目录内');
    }
    this.db = new DatabaseSync(filename, { enableForeignKeyConstraints: true, timeout: 1000 });
    try {
      if (filename !== ':memory:') chmodSync(filename, 0o600);
      this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;');
      const version = this.db.prepare('PRAGMA user_version').get()?.user_version;
      if (typeof version!=='number'||version > 1) throw new Error('账号数据库版本高于当前服务支持的版本');
      if (version === 0) this.db.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE users (id TEXT PRIMARY KEY, username TEXT NOT NULL, username_key TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL) STRICT;
        CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL) STRICT;
        CREATE INDEX sessions_expiry ON sessions(expires_at);
        CREATE TABLE matches (id TEXT PRIMARY KEY, ended_at INTEGER NOT NULL, snapshot TEXT NOT NULL) STRICT;
        CREATE TABLE participants (match_id TEXT NOT NULL REFERENCES matches(id), user_id TEXT NOT NULL REFERENCES users(id),
          team INTEGER NOT NULL, PRIMARY KEY(match_id, user_id)) STRICT;
        CREATE INDEX participants_user ON participants(user_id, match_id);
        PRAGMA user_version=1;
        COMMIT;
      `);
    } catch (error) { this.db.close(); throw error; }
  }
  findUser(key:string):StoredUser|undefined {const row=this.db.prepare('SELECT * FROM users WHERE username_key=?').get(key);if(!row)return;return {id:stringField(row,'id'),username:stringField(row,'username'),password_hash:stringField(row,'password_hash'),salt:stringField(row,'salt')};}
  createUser(user:NewUser) {
    return this.db.prepare('INSERT INTO users (id,username,username_key,password_hash,salt,created_at) VALUES (?,?,?,?,?,?)')
      .run(user.id, user.username, user.key, user.hash, user.salt, user.createdAt);
  }
  createSession(hash:string, userId:string, expiresAt:number, now:number) {
    this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);
    this.db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash, userId, expiresAt);
  }
  session(hash:string, now:number):SessionUser|null {
    const row=this.db.prepare(`SELECT u.id,u.username,s.token_hash AS sessionHash,s.expires_at AS expiresAt
      FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).get(hash, now);if(!row)return null;if(typeof row.expiresAt!=='number')throw new Error('账号数据库字段无效');return {id:stringField(row,'id'),username:stringField(row,'username'),sessionHash:stringField(row,'sessionHash'),expiresAt:row.expiresAt};
  }
  revokeSession(hash:string) { this.db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash); }
  saveMatch(snapshot:StoredMatch) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const inserted = this.db.prepare('INSERT OR IGNORE INTO matches (id,ended_at,snapshot) VALUES (?,?,?)')
        .run(snapshot.id, snapshot.endedAt, JSON.stringify(snapshot));
      if (inserted.changes) for (const participant of snapshot.participants) {
        if (participant.accountId) this.db.prepare('INSERT INTO participants (match_id,user_id,team) VALUES (?,?,?)')
          .run(snapshot.id, participant.accountId, participant.team);
      }
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  listMatches(userId:string, cursor:[number,string]|null, limit = 20):MatchList {
    const rows = this.db.prepare(`SELECT m.snapshot,p.team FROM matches m JOIN participants p ON p.match_id=m.id
      WHERE p.user_id=? AND (? IS NULL OR m.ended_at<? OR (m.ended_at=? AND m.id<?))
      ORDER BY m.ended_at DESC,m.id DESC LIMIT ?`).all(userId, cursor?.[0] ?? null, cursor?.[0] ?? 0, cursor?.[0] ?? 0, cursor?.[1] ?? '', limit + 1);
    const items = rows.slice(0, limit).map(row => this.publicMatch(row, false));
    const last = items.at(-1);
    return { items, nextCursor: rows.length > limit ? Buffer.from(JSON.stringify([last!.endedAt, last!.id])).toString('base64url') : null };
  }
  getMatch(userId:string, matchId:string) {
    const row = this.db.prepare(`SELECT m.snapshot,p.team FROM matches m JOIN participants p ON p.match_id=m.id
      WHERE m.id=? AND p.user_id=?`).get(matchId, userId);
    return row ? this.publicMatch(row, true) : null;
  }
  publicMatch(row:Record<string,unknown>, detail:boolean):MatchRecord {
    const value:unknown=JSON.parse(stringField(row,'snapshot'));if(!isRecord(value)||!Array.isArray(value.participants)||typeof row.team!=='number')throw new Error('战绩数据库字段无效');const snapshot=parseContract(contracts.MatchRecord,{...value,myTeam:row.team,participants:value.participants.map(seat=>{if(!isRecord(seat))throw new Error('战绩数据库字段无效');const {accountId,...publicSeat}=seat;return publicSeat;})});
    return { ...snapshot, participants: snapshot.participants.map(({ ships, ...seat }) => ({ ...seat, ...(detail ? { ships } : {}) })) };
  }
  close() { this.db.close(); }
}
