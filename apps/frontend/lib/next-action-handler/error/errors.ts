export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

const STATUS_CODE_MAP: Record<number, ErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
};

export class ActionError extends Error {
  public readonly code: ErrorCode;
  public readonly expose: boolean;
  public readonly suppressActionLog: boolean;
  public readonly cause?: unknown;

  constructor({
    message,
    code,
    expose = true,
    suppressActionLog = false,
    cause,
  }: {
    message: string;
    code: ErrorCode;
    expose?: boolean;
    suppressActionLog?: boolean;
    cause?: unknown;
  }) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.expose = expose;
    this.suppressActionLog = suppressActionLog;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ApiError extends ActionError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string, cause?: unknown) {
    const code = STATUS_CODE_MAP[statusCode];

    super({
      message,
      code: code ?? "INTERNAL_SERVER_ERROR",
      expose: Boolean(code),
      cause,
    });
    this.statusCode = statusCode;
  }
}
