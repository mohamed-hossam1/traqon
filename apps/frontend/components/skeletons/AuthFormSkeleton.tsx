import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function AuthFormSkeleton() {
  return (
    <div className="flex flex-col items-center w-full justify-center">
      <Card className="w-full max-w-md border border-foreground border-t-4 border-t-accent bg-card rounded-none shadow-none p-6 md:p-8">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20 rounded-none bg-foreground/10" />
              <Skeleton className="h-10 w-full rounded-none bg-foreground/10" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-28 rounded-none bg-foreground/10" />
              <Skeleton className="h-10 w-full rounded-none bg-foreground/10" />
            </div>
            <Skeleton className="h-11 w-full rounded-none bg-foreground/10 mt-2" />
            <Skeleton className="h-11 w-full rounded-none bg-foreground/10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
