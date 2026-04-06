import {runPresenceTests} from '../../../__tests__/json-crdt-server/presence';
import {setup} from './setup';
import type {ApiTestSetup} from './setup';

runPresenceTests(setup as ApiTestSetup);
