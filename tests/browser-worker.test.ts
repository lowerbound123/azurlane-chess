import {test,afterAll,afterEach} from 'vitest';
import assert from 'node:assert/strict';
import {createGame} from '../src/engine.ts';
import {BattleComputer} from '../src/composables/battle-computer.ts';
test('worker timeout releases worker and permits a new task',async()=>{let stopped=0;const computer=new BattleComputer(()=>({api:{resolve:()=>new Promise(()=>{})},dispose:()=>{stopped++;}}),5);await assert.rejects(computer.resolve({game:createGame(),plans:{}}),/超时/);assert.equal(stopped,1);assert.equal(computer.pending,false);computer.dispose();});
test('worker busy rejects duplicate and disposal rejects running task',async()=>{const computer=new BattleComputer(()=>({api:{resolve:()=>new Promise(()=>{})},dispose:()=>{}}),500);const request={game:createGame(),plans:{}};const task=computer.resolve(request);await assert.rejects(computer.resolve(request),/正在/);computer.dispose();await assert.rejects(task,/取消/);assert.equal(computer.pending,false);});
