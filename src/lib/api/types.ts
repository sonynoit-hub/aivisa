export type AskResponse = {
  code: number;     // 0=ok, 1=error
  message: string;  // "ok" or error msg
  answer: string | null;
};
