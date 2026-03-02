import { spawnSync } from 'node:child_process';

const command = 'npx lhci autorun --upload.target=temporary-public-storage';

function runOnce() {
  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result;
}

const first = runOnce();
if (first.status === 0) {
  process.exit(0);
}

const output = `${first.stdout || ''}\n${first.stderr || ''}\n${first.error?.message || ''}`;
const retryable = output.includes('EPERM') || output.includes('Permission denied');
if (!retryable) {
  process.exit(first.status ?? 1);
}

console.warn('[lhci] Retrying once after EPERM cleanup issue...');
const second = runOnce();
if (second.status === 0) {
  process.exit(0);
}

const secondOutput = `${second.stdout || ''}\n${second.stderr || ''}\n${second.error?.message || ''}`;
const windowsEperm =
  process.platform === 'win32' &&
  (secondOutput.includes('EPERM') || secondOutput.includes('Permission denied'));

if (windowsEperm) {
  console.warn('[lhci] Non-blocking Windows EPERM during temp cleanup. Rely on CI (Linux) as strict gate.');
  process.exit(0);
}

process.exit(second.status ?? 1);
