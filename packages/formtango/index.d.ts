export interface SubmitResult {
  ok: true;
  id: string | null;
  test?: boolean;
}
export interface SubmitOptions {
  /** Send as a test: stored for 24 hours, not counted, nobody is emailed. */
  test?: boolean;
  signal?: AbortSignal;
}
export declare function endpoint(form: string): string;
export declare function submit(form: string, data: HTMLFormElement | FormData | Record<string, unknown>, options?: SubmitOptions): Promise<SubmitResult>;
export declare class FormTangoError extends Error {
  status: number;
}
