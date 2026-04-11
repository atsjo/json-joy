import {runPresenceTests} from './server/presence';
import {setup} from './setup';
import type {ApiTestSetup} from './types';

runPresenceTests(setup as ApiTestSetup);
