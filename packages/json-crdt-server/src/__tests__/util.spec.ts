import {runUtilTests} from './server/util';
import {setup} from './setup';
import type {ApiTestSetup} from './types';

runUtilTests(setup as ApiTestSetup);
