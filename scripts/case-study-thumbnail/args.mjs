/**
 * Strict argv parsing for the thumbnail scripts.
 *
 * Written after a review caught that `publish.mjs --drry` silently fell through
 * to a real Sanity upload: unknown flags were ignored, so a typo in --dry
 * published. It also caught that `args.find(a => !a.startsWith('--'))` reads a
 * flag's VALUE as the positional argument, so `--variant b` could be taken as
 * the slug.
 *
 * Rules: every flag must be declared, unknown flags are fatal, value flags must
 * carry a value, and flag values are never mistaken for positionals.
 */
export function parseArgs(argv, { booleans = [], values = [], positional = 1, usage = '' }) {
  const fail = (msg) => {
    console.error(`error: ${msg}`);
    if (usage) console.error(`usage: ${usage}`);
    process.exit(1);
  };

  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { out._.push(arg); continue; }

    const name = arg.slice(2);
    if (booleans.includes(name)) { out[name] = true; continue; }
    if (values.includes(name)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) fail(`--${name} needs a value`);
      out[name] = v;
      i++; // consume the value so it never lands in positionals
      continue;
    }
    const known = [...booleans, ...values].map((n) => `--${n}`).join(' ');
    fail(`unknown flag "${arg}". known flags: ${known || '(none)'}`);
  }

  if (out._.length > positional) fail(`unexpected argument "${out._[positional]}"`);
  return out;
}
