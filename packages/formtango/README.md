# formtango

Send website forms to [FormTango](https://formtango.com), a form backend: it stores submissions, filters spam and emails you. No server code.

```bash
npm install formtango
```

## Plain JavaScript

```js
import { submit } from 'formtango';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await submit('YOUR_FORM_ID', form);
    form.reset();
  } catch (error) {
    alert(error.message);
  }
});
```

`submit(formId, data)` takes a `<form>` element, a `FormData`, or a plain object.

## React

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

## Testing

Pass `{ test: true }` to send a test submission: it shows in your inbox for 24 hours, is not counted against your plan, and emails nobody.

Get a form id at https://formtango.com, or let an AI coding tool create one: https://formtango.com/ai
