import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type GoalProps = {
  title: string;
  description: string | null;
  actions?: ReactNode;
};

export function Goal({ title, description, actions }: GoalProps) {
  return (
    <Card className="flex items-start justify-between gap-4 p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </Card>
  );
}
