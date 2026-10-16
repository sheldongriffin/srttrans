#!/usr/bin/env node
import { constants } from 'node:fs';
import { copyFile, lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, TextDecoder } from 'node:util';
import { analyse } from 'chardet';
import iconv from 'iconv-lite';
import { Converter } from 'opencc-js';

const help = `Usage: node srttrans.js [options] <file.srt|directory> [...paths]

Convert subtitles to UTF-8 in place; changed files get a .bak backup.
Directories include only .srt files (case-insensitive).

Options:
  --encoding <name>   Override detection (e.g. big5, gbk, windows-1252)
  --traditional      Convert Simplified Chinese to Traditional Chinese
  --recursive        Include subdirectories; symbolic links are skipped
  --dry-run          Report changes without writing files or backups
  --help             Show this help
`;

function strictUtf8(bytes) {
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}

function decodeChecked(bytes, encoding) {
  if (!iconv.encodingExists(encoding)) {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }
  const text = iconv.decode(bytes, encoding, { stripBOM: false });
  if (!iconv.encode(text, encoding, { addBOM: false }).equals(bytes)) {
    throw new Error(`Cannot decode ${encoding} losslessly; check --encoding`);
  }
  return text;
}

function decode(bytes, encoding) {
  if (encoding) return { text: decodeChecked(bytes, encoding), encoding };
  const signatures = [
    ['utf32le', [0xff, 0xfe, 0x00, 0x00]],
    ['utf32be', [0x00, 0x00, 0xfe, 0xff]],
    ['utf8', [0xef, 0xbb, 0xbf]],
    ['utf16le', [0xff, 0xfe]],
    ['utf16be', [0xfe, 0xff]],
  ];
  for (const [name, signature] of signatures) {
    if (bytes.subarray(0, signature.length).equals(Buffer.from(signature))) {
      const content = bytes.subarray(signature.length);
      return { text: name === 'utf8' ? strictUtf8(content) : decodeChecked(content, name), encoding: name };
    }
  }
  try {
    return { text: strictUtf8(bytes), encoding: 'utf8' };
  } catch {
    if (bytes.length < 4) {
      throw new Error('Encoding is ambiguous; specify --encoding (e.g. big5 or gbk)');
    }
    const candidate = analyse(bytes).find(result =>
      result.confidence >= 50 && iconv.encodingExists(result.name));
    if (!candidate) {
      throw new Error('Encoding is ambiguous; specify --encoding (e.g. big5 or gbk)');
    }
    return { text: decodeChecked(bytes, candidate.name), encoding: candidate.name };
  }
}

function repairMojibake(text) {
  const suspicious = value => (value.match(/\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]|\u00e2[\u0080-\u00bf\u2000-\u2122]{2}|\u00ef\u00bb\u00bf/g) ?? []).length;
  for (let pass = 0; pass < 2 && suspicious(text); pass++) {
    const bytes = iconv.encode(text, 'windows-1252');
    if (iconv.decode(bytes, 'windows-1252') !== text) break;
    try {
      const repaired = strictUtf8(bytes);
      if (repaired.length >= text.length || suspicious(repaired) > suspicious(text)) break;
      text = repaired;
    } catch {
      break;
    }
  }
  return text;
}

export function convert(bytes, options = {}) {
  const decoded = decode(bytes, options.encoding);
  let text = repairMojibake(decoded.text).replace(/^\uFEFF/, '');
  if (text.includes('\uFFFD')) {
    throw new Error('Subtitle contains replacement characters; recover the original bytes first');
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) {
    throw new Error('Subtitle contains binary/control data; check --encoding');
  }
  if (options.traditional) text = Converter({ from: 'cn', to: 'tw' })(text);
  const output = Buffer.from(text, 'utf8');
  return { output, encoding: decoded.encoding, changed: !bytes.equals(output) };
}

async function* subtitles(target, recursive, explicit = true) {
  const info = await lstat(target);
  if (info.isSymbolicLink()) {
    if (explicit) throw new Error('Symbolic links are not processed');
    return;
  }
  if (info.isDirectory()) {
    const entries = await readdir(target, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.srt') {
        yield* subtitles(path.join(target, entry.name), recursive, false);
      } else if (recursive && entry.isDirectory()) {
        yield* subtitles(path.join(target, entry.name), recursive, false);
      }
    }
  } else if (info.isFile() && path.extname(target).toLowerCase() === '.srt') {
    yield target;
  } else if (explicit) {
    throw new Error('Expected an .srt file or a directory');
  }
}

export async function main(args = process.argv.slice(2)) {
  let values;
  let positionals;
  try {
    ({ values, positionals } = parseArgs({ args, allowPositionals: true, options: {
      encoding: { type: 'string' },
      traditional: { type: 'boolean' },
      recursive: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      help: { type: 'boolean' },
    } }));
    if (values.help) {
      console.log(help);
      return 0;
    }
    if (!positionals.length) throw new Error('Provide an .srt file or directory. Use --help for usage.');
    if (values.encoding && !iconv.encodingExists(values.encoding)) {
      throw new Error(`Unsupported encoding: ${values.encoding}`);
    }
  } catch (error) {
    console.error(error.message);
    return 1;
  }
  let failed = false;
  let count = 0;
  const seen = new Set();
  for (const target of positionals) {
    try {
      for await (const file of subtitles(path.resolve(target), values.recursive)) {
        if (seen.has(file)) continue;
        seen.add(file);
        count++;
        try {
          const result = convert(await readFile(file), values);
          if (result.changed && !values['dry-run']) {
            await copyFile(file, `${file}.bak`, constants.COPYFILE_EXCL);
            await writeFile(file, result.output);
          }
          const status = result.changed ? (values['dry-run'] ? 'Would convert' : 'Converted') : 'Unchanged';
          console.log(`${status}: ${file} (${result.encoding})`);
        } catch (error) {
          failed = true;
          console.error(`${file}: ${error.message}`);
        }
      }
    } catch (error) {
      failed = true;
      console.error(`${target}: ${error.message}`);
    }
  }
  if (!count && !failed) console.log('No .srt files found.');
  return failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await main();
}