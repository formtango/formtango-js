const BASE = 'https://formtango.com/f/';

/** The endpoint for a form id (a full endpoint URL is passed through). */
export function endpoint(form) {
  return /^https?:\/\//.test(form) ? form : BASE + encodeURIComponent(form);
}

/**
 * Sends a submission. `data` can be a <form> element, a FormData, or a plain
 * object. Resolves with `{ ok: true, id }`; rejects with a FormTangoError whose
 * message says what went wrong.
 */
export async function submit(form, data, options = {}) {
  let body;
  const headers = { Accept: 'application/json' };
  if (typeof HTMLFormElement !== 'undefined' && data instanceof HTMLFormElement) body = new FormData(data);
  else if (typeof FormData !== 'undefined' && data instanceof FormData) body = data;
  else {
    body = JSON.stringify(options.test ? { ...data, _test: '1' } : data);
    headers['Content-Type'] = 'application/json';
  }
  if (options.test && body instanceof FormData) body.set('_test', '1');

  let response;
  try {
    response = await fetch(endpoint(form), { method: 'POST', headers, body, signal: options.signal });
  } catch (cause) {
    throw new FormTangoError('Could not reach FormTango. Check the connection and try again.', 0, { cause });
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new FormTangoError(result.error || `The submission was not accepted (${response.status}).`, response.status);
  return result;
}

export class FormTangoError extends Error {
  constructor(message, status, options) {
    super(message, options);
    this.name = 'FormTangoError';
    this.status = status;
  }
}
