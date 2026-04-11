import {spawn} from 'child_process';
import {Defer} from 'thingies/lib/Defer';
import * as path from 'path';

const pkgDir = path.resolve(__dirname, '../../..');
const rootDir = path.resolve(pkgDir, '../..');

const startServer = async (port: number) => {
  const started = new Defer<void>();
  const exitCode = new Defer<number>();
  const entryPoint = path.join('src', 'main.ts');
  const cp = spawn('npx', ['ts-node', '--transpile-only', entryPoint], {
    cwd: pkgDir,
    env: {
      ...process.env,
      PORT: String(port),
    },
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

const runTests = async (port: number) => {
  const exitCode = new Defer<number>();
  const cp = spawn('npx', ['vitest', 'run', '--reporter=verbose', 'packages/json-crdt-server/src/__tests__/e2e/json-crdt-server/'], {
    cwd: rootDir,
    env: {
      ...process.env,
      TEST_E2E: '1',
      PORT: String(port),
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
  let server: Awaited<ReturnType<typeof startServer>> | undefined;
  const killServer = async () => {
    if (server && !server.cp.killed) {
      server.cp.kill();
      await Promise.race([server.exitCode, new Promise((r) => setTimeout(r, 3000))]);
    }
  };
  try {
    const port = 10003;
    server = await startServer(port);
    await server.started;
    const jest = await runTests(port);
    const exitCode = await jest.exitCode;
    await killServer();
    process.exit(exitCode);
  } catch (error) {
    // tslint:disable-next-line no-console
    console.error(error);
    await killServer();
    process.exit(1);
  }
})();
