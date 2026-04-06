import {runUtilTests} from '../../../__tests__/json-crdt-server/util';
import {setup} from './setup';
import type {ApiTestSetup} from './setup';

runUtilTests(setup as ApiTestSetup);
