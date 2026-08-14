import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-6 justify-center">
      <div className="w-full text-center">
        <h1 className="font-serif-display italic text-3xl text-title">
          Reset your password
        </h1>
        <p className="font-serif-body italic text-sm text-subtitle mt-1">
          Choose a new password to restore access to your account.
        </p>
      </div>

      <div className="flex flex-col items-center w-full justify-center">
        <Card className="w-full max-w-md border border-foreground border-t-4 border-t-accent bg-card rounded-none shadow-none p-6 md:p-8">
          <CardContent className="p-0">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-24 rounded-none" />
                <Skeleton className="h-10 w-full rounded-none" />
              </div>
              <Skeleton className="h-11 w-full rounded-none mt-2" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
