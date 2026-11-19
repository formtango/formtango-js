import { useCallback, useState } from 'react';
import { submit } from './index.js';

/**
 * const { status, error, handleSubmit } = useFormTango('FORM_ID');
 * <form onSubmit={handleSubmit}>…</form>
 *
 * `status` is 'idle' | 'sending' | 'sent' | 'error'.
 */
export function useFormTango(form, options = {}) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const send = useCallback(
    async (data) => {
      setStatus('sending');
      setError(null);
      try {
        const result = await submit(form, data, options);
        setStatus('sent');
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
        setStatus('error');
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, options.test],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const element = event.currentTarget;
      const result = await send(element);
      if (result && options.reset !== false) element.reset();
    },
    [send, options.reset],
  );

  return { status, error, submit: send, handleSubmit, reset: () => setStatus('idle') };
}
