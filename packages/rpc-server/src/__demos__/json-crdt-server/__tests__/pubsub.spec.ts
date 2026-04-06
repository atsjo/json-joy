import {runPubsubTests} from '../../../__tests__/json-crdt-server/pubsub';
import {setup} from './setup';
import type {ApiTestSetup} from './setup';

runPubsubTests(setup as ApiTestSetup);
