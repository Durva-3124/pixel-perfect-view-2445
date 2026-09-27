import { useState } from "react";
import { Boxes, Clock, PackageCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SUPPLIER_STOCK, SUPPLIER_TASKS } from "@/lib/reliefchain-data";

export function SupplierView() {
  const [accepted, setAccepted] = useState<string[]>([]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Boxes className="size-5 text-primary" /> Warehouse stock — NGO Hope Foundation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUPPLIER_STOCK.map((s) => {
              const pct = Math.round((s.committed / Math.max(s.available, 1)) * 100);
              return (
                <div key={s.item}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="truncate text-sm font-semibold">{s.item}</p>
                    <p className="shrink-0 font-mono text-xs text-muted-foreground">
                      {s.committed} / {s.available} committed
                    </p>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                  {s.expiringDays !== null && (
                    <p className="mt-1 text-xs text-warning">
                      Batch expiring in {s.expiringDays} days — prioritised by allocation engine
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="panel border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="size-5 text-primary" /> Assigned dispatch tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SUPPLIER_TASKS.map((t) => {
              const isAccepted = accepted.includes(t.id);
              return (
                <div key={t.id} className="rounded-xl border border-border bg-secondary/25 p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-primary">{t.id}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold">{t.ask}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.destination}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[11px]",
                        t.state === "Shortage reported"
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : t.state === "In transit"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-warning/40 bg-warning/10 text-warning",
                      )}
                    >
                      {t.state}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" /> Due {t.due}
                    </p>
                    <Button
                      size="sm"
                      variant={isAccepted ? "outline" : "default"}
                      className={cn(isAccepted && "border-success/40 bg-success/10 text-success")}
                      onClick={() => {
                        setAccepted((p) => [...p, t.id]);
                        toast.success(`Dispatch signed for ${t.id}`, {
                          description: "Consignment manifest co-signed on the ledger.",
                        });
                      }}
                      disabled={isAccepted}
                    >
                      <PackageCheck className="size-4" />
                      {isAccepted ? "Signed" : "Accept & sign manifest"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
