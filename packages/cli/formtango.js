#!/usr/bin/env node
// FormTango CLI. Zero dependencies.
//
//   formtango init [name]             create a working form with no account
//   formtango forms                   list your forms
//   formtango create <name>           create a form
//   formtango snippet <formId> [kind] print ready-to-paste code
//   formtango submissions <formId>    show recent submissions
//   formtango tail <formId>           print new submissions as they arrive
//   formtango test <formId>           send a test submission
//
// Commands other than `init` and `test` need FORMTANGO_API_KEY (create one
// under Account at https://formtango.com).

const BASE = process.env.FORMTANGO_URL || 'https://formtango.com';
const [command, ...args] = process.argv.slice(2);

function fail(message) {
  console.error(`formtango: ${message}`);
  process.exit(1);
}

async function api(path, { method = 'GET', body, auth = true } = {}) {
  const key = process.env.FORMTANGO_API_KEY;
  if (auth && !key) fail('set FORMTANGO_API_KEY first. Create a key under Account at https://formtango.com/app/account');
  const response = await fetch(`${BASE}/api/v1${path}`, {
    method,
    headers: { ...(auth ? { Authorization: `Bearer ${key}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => fail(`could not reach ${BASE}`));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) fail(`${data.error?.message ?? `request failed (${response.status})`}${data.error?.hint ? `\n  ${data.error.hint}` : ''}`);
  return data;
}

function printSubmission(s) {
  console.log(`\n${s.createdAt}  ${s.id}${s.spam ? '  [spam]' : ''}`);
  for (const [key, value] of Object.entries(s.fields)) console.log(`  ${key}: ${String(value).replace(/\n/g, '\n    ')}`);
  for (const file of s.files ?? []) console.log(`  attachment: ${file.name} (${Math.ceil(file.size / 1024)} KB)`);
}

const commands = {
  async init() {
    const result = await api('/claims', { method: 'POST', body: { name: args.join(' ') || 'Contact form' }, auth: false });
    console.log(`Form created. It accepts submissions now.\n\n  Endpoint:   ${result.endpoint}\n  Claim link: ${result.claimUrl}\n\nOpen the claim link to see your submissions (free). Until then the form accepts 20 submissions and lasts 7 days.\n\n${result.snippet.code}`);
  },
  async forms() {
    const { forms } = await api('/forms');
    if (forms.length === 0) return console.log('No forms yet. Create one with: formtango create "Contact form"');
    for (const form of forms) console.log(`${form.id}  ${form.name}  (${form.submissionCount} submissions, ${form.unreadCount} unread)${form.active ? '' : '  [paused]'}`);
  },
  async create() {
    if (!args.length) fail('usage: formtango create <name>');
    const { form, snippet } = await api('/forms', { method: 'POST', body: { name: args.join(' ') } });
    console.log(`Created "${form.name}"\n\n  Endpoint: ${form.endpoint}\n\n${snippet.code}`);
  },
  async snippet() {
    if (!args[0]) fail('usage: formtango snippet <formId> [html|script|fetch|react|nextjs|astro|vue|svelte]');
    const result = await api(`/forms/${encodeURIComponent(args[0])}/snippet?kind=${encodeURIComponent(args[1] || 'html')}`);
    console.log(result.code);
  },
  async submissions() {
    if (!args[0]) fail('usage: formtango submissions <formId>');
    const { submissions } = await api(`/forms/${encodeURIComponent(args[0])}/submissions?limit=20`);
    if (submissions.length === 0) return console.log('No submissions yet.');
    for (const s of submissions.reverse()) printSubmission(s);
  },
  async tail() {
    if (!args[0]) fail('usage: formtango tail <formId>');
    const path = `/forms/${encodeURIComponent(args[0])}/submissions?limit=20`;
    const seen = new Set((await api(path)).submissions.map((s) => s.id));
    console.log('Waiting for new submissions. Press Ctrl+C to stop.');
    for (;;) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const { submissions } = await api(path);
      for (const s of submissions.reverse()) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          printSubmission(s);
        }
      }
    }
  },
  async test() {
    if (!args[0]) fail('usage: formtango test <formId>');
    const response = await fetch(`${BASE}/f/${encodeURIComponent(args[0])}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: 'Test Person', email: 'test@example.com', message: 'Sent by formtango test', _test: '1' }),
    }).catch(() => fail(`could not reach ${BASE}`));
    const result = await response.json().catch(() => ({}));
    if (!response.ok) fail(result.error ?? `the form refused it (${response.status})`);
    console.log('Test submission accepted. It shows in the inbox for 24 hours, is not counted, and nobody was emailed.');
  },
};

if (!command || command === 'help' || command === '--help' || !commands[command]) {
  console.log(`Usage: formtango <command>

  init [name]               create a working form with no account
  forms                     list your forms
  create <name>             create a form
  snippet <formId> [kind]   print ready-to-paste code
  submissions <formId>      show recent submissions
  tail <formId>             print new submissions as they arrive
  test <formId>             send a test submission

Set FORMTANGO_API_KEY for everything except init and test.`);
  process.exit(command && !commands[command] && command !== 'help' && command !== '--help' ? 1 : 0);
}
await commands[command]();
