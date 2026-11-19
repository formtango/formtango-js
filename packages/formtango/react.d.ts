import type { FormEvent } from 'react';
import type { SubmitOptions, SubmitResult } from './index.js';

export interface UseFormTangoOptions extends SubmitOptions {
  /** Clear the form after a successful send. Default true. */
  reset?: boolean;
}
export declare function useFormTango(
  form: string,
  options?: UseFormTangoOptions,
): {
  status: 'idle' | 'sending' | 'sent' | 'error';
  error: string | null;
  submit: (data: HTMLFormElement | FormData | Record<string, unknown>) => Promise<SubmitResult | null>;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
};
