import {runPubsubTests} from './server/pubsub';
import {setup} from './setup';
import type {ApiTestSetup} from './types';

runPubsubTests(setup as ApiTestSetup);
