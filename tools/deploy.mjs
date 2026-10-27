// Publikasikan build ke branch gh-pages (GitHub Pages menyajikan branch itu).
// Pemakaian: npm run deploy  (build dulu, lalu force-push dist/ sebagai satu commit
// atas nama user.name/user.email git lokal — tanpa bot, tanpa kontributor lain).
import { execFileSync } from 'node:child_process';
import { copyFile, cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();

execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true });

const remote = run('git', ['remote', 'get-url', 'origin']);
const name = run('git', ['config', 'user.name']);
const email = run('git', ['config', 'user.email']);
const sha = run('git', ['rev-parse', '--short', 'HEAD']);

const tmp = await mkdtemp(join(tmpdir(), 'gh-pages-'));
try {
  await cp(join(root, 'dist'), tmp, { recursive: true });
  // SPA: GitHub Pages menyajikan 404.html untuk route yang tidak ada → React Router mengambil alih
  await copyFile(join(tmp, 'index.html'), join(tmp, '404.html'));
  await writeFile(join(tmp, '.nojekyll'), '');
  run('git', ['init', '-q', '-b', 'gh-pages'], tmp);
  run('git', ['add', '-A'], tmp);
  run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '-m', `Deploy ${sha}`], tmp);
  execFileSync('git', ['push', '-q', '--force', remote, 'gh-pages'], { cwd: tmp, stdio: 'inherit' });
  console.log(`Deployed ${sha} → gh-pages`);
} finally {
  await rm(tmp, { recursive: true, force: true });
}
