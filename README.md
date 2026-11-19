# FormTango for JavaScript

[FormTango](https://formtango.com) is a form backend: your form posts to one address, and every submission is stored in an inbox, checked for spam and emailed to you. No server code, no API key.

This repo holds the two npm packages.

| Package | What it is | Install |
| --- | --- | --- |
| [`formtango`](./packages/formtango) | A tiny submit helper and a React hook | `npm install formtango` |
| [`formtango-cli`](./packages/cli) | FormTango from the terminal | `npx formtango-cli init` |

## Quick start

```jsx
import { useFormTango } from 'formtango/react';

export function ContactForm() {
  const { status, error, handleSubmit } = useFormTango('YOUR_FORM_ID');
  if (status === 'sent') return <p>Thanks! We got your message.</p>;
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button disabled={status === 'sending'}>Send</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

No package needed for plain HTML: set your form's `action` to `https://formtango.com/f/YOUR_FORM_ID`.

## Get a form id

Either sign up free at https://formtango.com (100 submissions a month), or create a form with no account:

```bash
curl -X POST https://formtango.com/api/v1/claims \
  -H "Content-Type: application/json" -d '{"name":"Contact form"}'
```

The response has the `endpoint` to use and a `claimUrl`. Open the claim link to see your submissions.

Docs: https://formtango.com/docs · Templates: [HTML](https://github.com/formtango/html-contact-form), [React](https://github.com/formtango/react-contact-form), [Next.js](https://github.com/formtango/nextjs-contact-form), [Astro](https://github.com/formtango/astro-contact-form)
