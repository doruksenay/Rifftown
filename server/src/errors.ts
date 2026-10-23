/** Oyuncuya gösterilecek, beklenen hata. `code` uygulamada çevrilir. */
export class GameError extends Error {
  constructor(
    public code: string,
    public status = 400,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export const fail = (code: string, status = 400): never => {
  throw new GameError(code, status);
};
