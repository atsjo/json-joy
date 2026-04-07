import {spawn} from 'child_process';
import {Defer} from 'thingies/lib/Defer';
import {parseArgs} from 'util';
import * as path from 'path';

const {
  values: {server, suite},
} = parseArgs({
  options: {
    server: {
      type: 'string',
      default: 'http1',
    },
    suite: {
      type: 'string',
      default: 'sample-api',
    },
  },
});

const pkgDir = path.resolve(__dirname, '../../..');
const rootDir = path.resolve(pkgDir, '../..');

const startServer = async () => {
  const started = new Defer<void>();
  const exitCode = new Defer<number>();
  const entryPoint = path.join('src', '__demos__', suite!, `main-${server}.ts`);
  const cp = spawn('npx', ['ts-node', '--transpile-only', entryPoint], {
    cwd: pkgDir,
  });
  process.on('exit', () => {
    cp.kill();
  });
  cp.stdout.on('data', (data) => {
    const line = String(data);
    if (line.indexOf('SERVER_STARTED') > -1) started.resolve();
    process.stderr.write('[server] ' + line);
  });
  cp.stderr.on('data', (data) => {
    const msg = Buffer.isBuffer(data) ? data.toString() : String(data);
    // tslint:disable-next-line no-console
    console.error('Could not start server', msg);
    started.reject(data);
    process.stderr.write('ERROR: [server] ' + msg);
  });
  cp.on('close', (code) => {
    exitCode.resolve(code || 0);
    process.stdout.write('[server] ' + `process exited with code ${code}\n`);
  });
  return {
    cp,
    started: started.promise,
    exitCode: exitCode.promise,
  };
};

const runTests = async () => {
  const exitCode = new Defer<number>();
  const cp = spawn('npx', ['vitest', 'run', '--reporter=verbose', `packages/rpc-server/src/__tests__/e2e/${suite}/`], {
    cwd: rootDir,
    env: {
      ...process.env,
      TEST_E2E: '1',
    },
    stdio: 'inherit',
  });
  process.on('exit', () => {
    cp.kill();
  });
  cp.on('close', (code) => {
    exitCode.resolve(code || 0);
    process.stdout.write('[vitest] ' + `process exited with code ${code}\n`);
  });
  return {
    cp,
    exitCode: exitCode.promise,
  };
};

(async () => {
  try {
    const server = await startServer();
    await server.started;
    let exitCode = 0;
    const test = await runTests();
    exitCode = await test.exitCode;
    if (exitCode !== 0) throw exitCode;
    process.exit(exitCode);
  } catch (error) {
    // tslint:disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
})();
