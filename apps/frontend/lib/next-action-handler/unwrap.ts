export type SafeActionResult<T> = {
  data?: T;
  serverError?: { message?: string; code?: string };
  validationErrors?: unknown;
};


export async function unwrapAction<T>(
  actionPromise: Promise<SafeActionResult<T>>
): Promise<T> {
  const result = await actionPromise;

  if (result?.serverError) {
    const rawMsg = result.serverError.message || "A server error occurred.";
    if (
      rawMsg.includes("SERVER ACTION") ||
      rawMsg.includes("WAS NOT FOUND ON THE SERVER") ||
      rawMsg.includes("FAILED-TO-FIND-SERVER-ACTION")
    ) {
      throw new Error("The application was updated. Please refresh the page and try again.");
    }
    throw new Error(rawMsg);
  }

  if (result?.validationErrors) {
    throw new Error("Invalid input provided.");
  }

  return result?.data as T;
}
