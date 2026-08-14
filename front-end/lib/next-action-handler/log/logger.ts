import { ERROR_LOG_LEVEL, logger } from "./logger-config";
import { ActionError } from "../error/errors";

type BaseLogOptions = {
  action: string;
};

type LogMeta = Record<string, unknown>;

type ActionLogMessageOptions = BaseLogOptions & {
  message: string;
  meta?: LogMeta;
};

type ActionExecutionLogOptions = BaseLogOptions & {
  durationMs?: number;
  message?: string;
  meta?: LogMeta;
};

type ActionErrorLogOptions = BaseLogOptions & {
  error: unknown;
};

function formatMessage({
  action,
  message,
  errorCode,
  durationMs,
}: {
  action: string;
  message: string;
  errorCode?: string;
  durationMs?: number;
}) {
  const actionLabel = action ? `[${action}] ` : "";
  const errorLabel = errorCode ? `${errorCode} ` : "";
  const durationLabel =
    typeof durationMs === "number" ? ` (${durationMs})ms` : "";

  return `${actionLabel}${errorLabel}${message}${durationLabel}`.trim();
}

export function logWarn({ action, message, meta }: ActionLogMessageOptions) {
  logger.warn(
    {
      action,
      ...meta,
    },
    formatMessage({ action, message }),
  );
}

export function logError({ action, message, meta }: ActionLogMessageOptions) {
  logger.error(
    {
      action,
      ...meta,
    },
    formatMessage({ action, message }),
  );
}

export function logInfo({
  action,
  message = "",
  durationMs,
  meta,
}: ActionExecutionLogOptions) {
  logger.info(
    {
      action,
      durationMs,
      ...meta,
    },
    formatMessage({ action, message, durationMs }),
  );
}

export function logActionExecution({
  action,
  durationMs,
  message = "Action executed successfully",
  meta,
}: ActionExecutionLogOptions) {
  logInfo({
    action,
    durationMs,
    message,
    meta,
  });
}

export function logActionError({ action, error }: ActionErrorLogOptions) {
  if (error instanceof ActionError) {
    const level = ERROR_LOG_LEVEL[error.code] ?? "error";
    const payload = {
      action,
      errorCode: error.code,
    };
    const message = formatMessage({
      action,
      message: error.message,
      errorCode: error.code,
    });

    if (level === "error") {
      logger.error(payload, message);
      return;
    }

    logger.warn(payload, message);
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      action,
      errorCode: "INTERNAL_SERVER_ERROR",
      stack: err.stack,
    },
    formatMessage({
      action,
      message: err.message,
      errorCode: "INTERNAL_SERVER_ERROR",
    }),
  );
}
