# SrtTrans

A small Node.js command-line tool for rescuing subtitle encodings. Most subtitles
are already UTF-8 these days; those normally need no changes. This is mainly for
older collections and the occasional incorrectly decoded download.

The original Windows Forms app previewed Big5, GBK and UTF-8, with optional
Simplified-to-Traditional Chinese conversion. This version replaces that UI with
a cross-platform script. It keeps the subtitle's filename rather than renaming it
to match an MKV.

## Run

Requires Node.js 22 or newer.

```sh
npm install
node srttrans.js "movie.srt"
node srttrans.js "subtitles"
node srttrans.js --recursive "subtitles"
node srttrans.js --dry-run "subtitles"
node srttrans.js --encoding big5 "movie.srt"
node srttrans.js --encoding gbk --traditional "movie.srt"
```

No file/directory switch is needed. Multiple paths are accepted. Directory scans
process only `.srt` files (case-insensitive); subdirectories are opt-in, and
symbolic links are skipped. Use `--` before filenames beginning with a dash.
Run `node srttrans.js --help` for all options.

Changed files are rewritten in place as UTF-8 without a BOM. Before writing, the
original bytes are copied to `<filename>.bak`. Existing backups are never
overwritten: if a changed file already has a backup, conversion fails without
modifying either file. Move the backup elsewhere before deliberately converting
that file again. Unchanged files are not written and get no backup. `--dry-run`
does not write anything. Keep backups until you have checked the resulting text.

## Repairs And Limits

- Recognizes UTF-8 and BOM-marked UTF-16/UTF-32 in either byte order.
- Detects legacy encodings using chardet, including Big5, GBK and Western text.
	A guess needs at least 50% detector confidence and a lossless byte round trip.
	Confidence is heuristic, not a guarantee: short or ambiguous subtitles may
	require `--encoding`, especially Western single-byte encodings. The override
	applies to every input file in that run.
- Repairs up to two layers of common UTF-8-as-Windows-1252 mojibake, such as
	`cafÃ©`, only when the complete text can be reversed and decoded as valid UTF-8.
	Literal text intentionally containing such sequences is indistinguishable from
	corruption; preview with `--dry-run` and inspect the output against the backup.
- Converts Simplified Chinese to Traditional only with `--traditional`, using
	OpenCC's Taiwan conversion. Encoding conversion alone does not translate text.
- Preserves timestamps, subtitle formatting and line endings. Does not repair
	malformed SRT timing, rename files, or attempt to recover already-lost text.
	Replacement characters and binary control characters cause an error.

One file's error does not stop other files from being processed. Exit status is
0 on success (including an empty directory), or 1 for errors. Status output
identifies changed/unchanged files and the selected encoding. A dry run reports
what would change but does not check whether creating the backup will succeed.

## Samples And Tests

`samples/good-utf8.srt` is already correct and should be untouched.
`samples/broken-mojibake.srt` has reversible encoding damage and converts to the
good sample. Try `node srttrans.js --dry-run samples` before modifying samples.

```sh
npm test
```

The small suite uses Node's built-in test runner. It covers valid UTF-8, explicit
and automatic legacy decoding, Unicode BOMs, mojibake, optional Traditional
Chinese, rejected inputs, and CLI file/directory behavior. Legacy byte fixtures
are generated in memory; filesystem tests run in disposable temporary folders.
