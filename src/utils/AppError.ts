export class AppError extends Error {
  status: number;
  code?: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
