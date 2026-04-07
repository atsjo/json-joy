import {spawn} from 'child_process';
import {Defer} from 'thingies/lib/Defer';
import * as path from 'path';

const pkgDir = path.resolve(__dirname, '../../..');
const rootDir = path.resolve(pkgDir, '../..');

const startServer = async (serverType: string, suite: string, port: number) => {
  const started = new Defer<void>();
  const exitCode = new Defer<number>();
  const entryPoint = path.join('src', '__demos__', suite, `main-${serverType}.ts`);
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

const runTests = async (suite: string, port: number) => {
  const exitCode = new Defer<number>();
  const cp = spawn('npx', ['vitest', 'run', '--reporter=verbose', `packages/rpc-server/src/__tests__/e2e/${suite}/`], {
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
  let serverProc: Awaited<ReturnType<typeof startServer>> | undefined;
  const killServer = async () => {
    if (serverProc && !serverProc.cp.killed) {
      serverProc.cp.kill();
      await Promise.race([serverProc.exitCode, new Promise((r) => setTimeout(r, 3000))]);
    }
  };
  try {
    const specs = [
      {server: 'http1', suite: 'sample-api', port: 9999},
      {server: 'http1', suite: 'json-crdt-server', port: 10000},
      {server: 'uws', suite: 'sample-api', port: 10001},
      {server: 'uws', suite: 'json-crdt-server', port: 10002},
    ];
    let overallExitCode = 0;

    for (const {server, suite, port} of specs) {
      console.log(`\n[RUN] ${server} + ${suite} (port ${port})`);
      // Start server for this combination
      serverProc = await startServer(server, suite, port);
      await serverProc.started;

      // Run tests against server
      const test = await runTests(suite, port);
      const testExitCode = await test.exitCode;
      if (testExitCode !== 0) {
        overallExitCode = testExitCode;
      }

      // Kill server before next combination
      await killServer();
    }

    process.exit(overallExitCode);
  } catch (error) {
    console.error(error);
    await killServer();
    process.exit(1);
  }
})();
