import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import iconv from 'iconv-lite';
import { convert } from '../srttrans.js';

const cli = fileURLToPath(new URL('../srttrans.js', import.meta.url));
const subtitle = text => `1\r\n00:00:01,000 --> 00:00:03,000\r\n${text}\r\n`;
const chinese = '\u4f60\u597d\uff0c\u4e16\u754c\uff01';
const french = 'Un caf\u00e9, s\u2019il vous pla\u00eet.';

test('valid UTF-8 and ASCII stay byte-for-byte unchanged', () => {
  for (const text of [chinese, french, 'Hello world!', '']) {
    const bytes = Buffer.from(subtitle(text));
    assert.deepEqual(convert(bytes).output, bytes);
    assert.equal(convert(bytes).changed, false);
  }
});

test('Big5, GBK and Windows-1252 can be decoded explicitly without data loss', () => {
  for (const [encoding, text] of [['big5', chinese], ['gbk', chinese], ['windows-1252', french]]) {
    assert.equal(convert(iconv.encode(subtitle(text), encoding), { encoding }).output.toString(), subtitle(text));
  }
});

test('Unicode BOMs are detected, decoded and removed', () => {
  for (const encoding of ['utf8', 'utf16le', 'utf16be', 'utf32le', 'utf32be']) {
    const input = iconv.encode(subtitle(chinese), encoding, { addBOM: true });
    assert.equal(convert(input).output.toString(), subtitle(chinese));
  }
});

test('detect representative Chinese encodings and decline low-confidence Western guesses', () => {
  const traditional = '\u9019\u662f\u4e00\u500b\u95dc\u65bc\u96fb\u5f71\u8207\u751f\u6d3b\u7684\u6545\u4e8b\u3002\u6211\u5011\u4eca\u5929\u4e00\u8d77\u5230\u5716\u66f8\u9928\u5b78\u7fd2\u4e2d\u6587\uff0c\u7136\u5f8c\u56de\u5bb6\u5403\u98ef\u3002';
  const simplified = '\u8fd9\u662f\u4e00\u4e2a\u5173\u4e8e\u7535\u5f71\u4e0e\u751f\u6d3b\u7684\u6545\u4e8b\u3002\u6211\u4eec\u4eca\u5929\u4e00\u8d77\u5230\u56fe\u4e66\u9986\u5b66\u4e60\u4e2d\u6587\uff0c\u7136\u540e\u56de\u5bb6\u5403\u996d\u3002';
  const western = 'C\u2019est d\u00e9j\u00e0 l\u2019\u00e9t\u00e9. Un caf\u00e9, s\u2019il vous pla\u00eet !';
  for (const [encoding, text] of [['big5', traditional], ['gbk', simplified]]) {
    const content = subtitle(text.repeat(8));
    assert.equal(convert(iconv.encode(content, encoding)).output.toString(), content);
  }
  const ambiguous = iconv.encode(subtitle(western.repeat(8)), 'windows-1252');
  assert.throws(() => convert(ambiguous), /ambiguous/);
  assert.equal(convert(ambiguous, { encoding: 'windows-1252' }).output.toString(), subtitle(western.repeat(8)));
});

test('repair reversible single and double UTF-8 mojibake', () => {
  let text = subtitle('Un caf\u00e9.');
  for (let pass = 0; pass < 2; pass++) {
    text = iconv.decode(Buffer.from(text), 'windows-1252');
    assert.equal(convert(Buffer.from(text)).output.toString(), subtitle('Un caf\u00e9.'));
  }
});

test('Traditional Chinese conversion is opt-in', () => {
  const bytes = Buffer.from(subtitle('\u6c49\u8bed'));
  assert.equal(convert(bytes).changed, false);
  assert.equal(convert(bytes, { traditional: true }).output.toString(), subtitle('\u6f22\u8a9e'));
});

test('reject ambiguous, lossy, replacement-character and binary inputs', () => {
  assert.throws(() => convert(Buffer.from([0x81])), /ambiguous/);
  assert.throws(() => convert(Buffer.from([0x81]), { encoding: 'gbk' }), /losslessly/);
  assert.throws(() => convert(Buffer.from(subtitle('\ufffd'))), /replacement/);
  assert.throws(() => convert(Buffer.from([0, 1, 2])), /binary\/control/);
  assert.throws(() => convert(Buffer.from('test'), { encoding: 'not-real' }), /Unsupported/);
});

test('sample broken file is repaired; good file is unchanged', async () => {
  const good = await readFile(new URL('../samples/good-utf8.srt', import.meta.url));
  const broken = await readFile(new URL('../samples/broken-mojibake.srt', import.meta.url));
  assert.equal(convert(good).changed, false);
  assert.deepEqual(convert(broken).output, good);
});

test('CLI handles files, directories, recursion, dry runs, backups and failures', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'srttrans-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'movie.SRT');
  const original = iconv.encode(subtitle(chinese), 'utf16le', { addBOM: true });
  await writeFile(file, original);
  await writeFile(path.join(directory, 'movie.mkv'), original);
  await mkdir(path.join(directory, 'nested'));
  const nested = path.join(directory, 'nested', 'other.srt');
  await writeFile(nested, original);
  const run = (...args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  assert.match(run('--dry-run', directory), /Would convert/);
  assert.deepEqual(await readFile(file), original);
  await assert.rejects(access(`${file}.bak`));
  assert.match(run(directory), /Converted/);
  assert.equal((await readFile(file)).toString(), subtitle(chinese));
  assert.deepEqual(await readFile(`${file}.bak`), original);
  assert.deepEqual(await readFile(nested), original);
  assert.deepEqual(await readFile(path.join(directory, 'movie.mkv')), original);
  assert.match(run(file), /Unchanged/);
  assert.match(run('--recursive', directory), /other.srt/);
  await writeFile(file, original);
  const collision = spawnSync(process.execPath, [cli, file], { encoding: 'utf8' });
  assert.equal(collision.status, 1);
  assert.deepEqual(await readFile(file), original);
  assert.deepEqual(await readFile(`${file}.bak`), original);
  const missing = spawnSync(process.execPath, [cli, path.join(directory, 'missing.srt')], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(run('--help'), /Usage:/);
  assert.equal(spawnSync(process.execPath, [cli]).status, 1);
  assert.equal(spawnSync(process.execPath, [cli, '--unknown']).status, 1);
});