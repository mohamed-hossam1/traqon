import "server-only";

import z from "zod";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

import { logActionError, logActionExecution } from "./log/logger";
import { ActionError } from "./error/errors";

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      actionName: z.string(),
      suppressSuccessLog: z.boolean().optional(),
    }),

  handleServerError(error, ctx) {
    if (error instanceof ActionError) {
      if (!error.suppressActionLog) {
        logActionError({
          action: ctx.metadata.actionName,
          error,
        });
      }

      return {
        code: error.code,
        message: error.expose
          ? error.message
          : DEFAULT_SERVER_ERROR_MESSAGE,
      };
    }

    logActionError({
      action: ctx.metadata.actionName,
      error,
    });

    return {
      code: "INTERNAL_SERVER_ERROR",
      message: DEFAULT_SERVER_ERROR_MESSAGE,
    };
  },
}).use(async ({ next, metadata }) => {
  const startedAt = Date.now();

  const result = await next();

  if (!result.serverError && !metadata.suppressSuccessLog) {
    logActionExecution({
      action: metadata.actionName,
      durationMs: Date.now() - startedAt,
    });
  }

  return result;
});
