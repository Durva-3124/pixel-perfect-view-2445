import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CopyCheck,
  Info,
  PackageCheck,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CAMP_NEEDS,
  DUPLICATE_CANDIDATES,
  METRICS,
  SUPPLY_MATCHES,
} from "@/lib/reliefchain-data";

const METRIC_ICONS = [Users, ShieldAlert, Truck, AlertTriangle];
const TONE_CLASS = {
  primary: "text-primary",
  warning: "text-warning",
  success: "text-success",
  destructive: "text-destructive",
} as const;

export function CoordinatorView({ pendingCount }: { pendingCount: number }) {
  const [selectedNeed, setSelectedNeed] = useState(CAMP_NEEDS[0]!.id);
  const [dupOpen, setDupOpen] = useState(false);
  const [resolved, setResolved] = useState<string[]>([]);
  const [allocated, setAllocated] = useState<string[]>([]);

  const need = CAMP_NEEDS.find((n) => n.id === selectedNeed)!;
  const match = SUPPLY_MATCHES.find((m) => m.needId === selectedNeed)!;
  const openDuplicates = DUPLICATE_CANDIDATES.filter((d) => !resolved.includes(d.pairId));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m, i) => {
          const Icon = METRIC_ICONS[i] ?? Users;
          const extra = i === 0 ? pendingCount : 0;
          return (
            <Card key={m.label} className="panel border-0">
              <CardContent className="p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="label-caps truncate">{m.label}</p>
                    <p className="mt-1 font-display text-3xl font-bold">
                      {m.value + extra}
                    </p>
                  </div>
                  <Icon className={cn("size-5 shrink-0", TONE_CLASS[m.tone])} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{m.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {openDuplicates.length > 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {openDuplicates.length} Probable Duplicate Request
                {openDuplicates.length === 1 ? "" : "s"} Flagged for Review
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Matched on camp, category, timing and GPS proximity.
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setDupOpen(true)}>
            Review Candidates
          </Button>
        </div>
      )}

      <Card className="panel border-0">
        <CardHeader>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <CardTitle className="truncate text-lg">Explainable stock allocation</CardTitle>
            <Badge variant="outline" className="shrink-0 border-border bg-secondary/40 font-mono text-[11px]">
              Match score {match.score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CAMP_NEEDS.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedNeed(n.id)}
                aria-pressed={n.id === selectedNeed}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                  n.id === selectedNeed
                    ? "border-primary bg-primary/15"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-accent",
                )}
              >
                {n.camp} · {n.need}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="rounded-xl border border-border bg-secondary/25 p-4">
              <p className="label-caps">Selected camp need</p>
              <p className="mt-1 font-display text-xl font-bold">
                {need.camp} — {need.need}
              </p>
              <Separator className="my-3" />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="label-caps">Priority</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      need.priority === "Critical" ? "text-destructive" : "text-warning",
                    )}
                  >
                    {need.priority}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps">People affected</dt>
                  <dd className="font-semibold">{need.people}</dd>
                </div>
                <div>
                  <dt className="label-caps">Unmet since</dt>
                  <dd className="font-semibold">{need.unmetSince}</dd>
                </div>
                <div>
                  <dt className="label-caps">Category</dt>
                  <dd className="font-semibold">{need.category}</dd>
                </div>
              </dl>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="grid size-10 place-items-center rounded-full border border-primary/40 bg-primary/15 text-primary">
                <ArrowRight className="size-5" />
              </div>
            </div>

            <div className="rounded-xl border border-success/35 bg-success/5 p-4">
              <p className="label-caps">Recommended supply match</p>
              <p className="mt-1 font-display text-xl font-bold">
                {match.supplier} — {match.available} {match.unitLabel}
              </p>
              <Separator className="my-3" />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="label-caps">Distance</dt>
                  <dd className="font-semibold">{match.distanceKm} km</dd>
                </div>
                <div>
                  <dt className="label-caps">ETA</dt>
                  <dd className="font-semibold">{match.etaMinutes} min</dd>
                </div>
                <div className="col-span-2">
                  <dt className="label-caps">Inventory note</dt>
                  <dd className="font-semibold text-warning">{match.expiryNote}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <Progress value={match.score} className="h-1.5" />
              </div>
            </div>
          </div>

          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Info className="size-3.5" /> Why this match?
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {match.reasons.join(" + ")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-wrap gap-2">
            {match.reasons.map((r) => (
              <Badge key={r} variant="outline" className="border-border bg-secondary/40 text-[11px]">
                {r}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              disabled={allocated.includes(need.id)}
              onClick={() => {
                setAllocated((prev) => [...prev, need.id]);
                toast.success("Allocation approved & dispatch logged", {
                  description: `${need.need} → ${need.camp} via ${match.supplier}`,
                });
              }}
            >
              {allocated.includes(need.id) ? (
                <>
                  <CheckCircle2 className="size-4" /> Allocation logged on ledger
                </>
              ) : (
                <>
                  <PackageCheck className="size-4" /> Approve Allocation &amp; Log Dispatch
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-border bg-secondary/40 sm:w-48"
              onClick={() =>
                toast("Manual override started", {
                  description: "Pick an alternate supplier and record a justification.",
                })
              }
            >
              Override Match
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Probable duplicate requests</DialogTitle>
            <DialogDescription>
              Merge duplicates before allocating so camps are not double-supplied.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {openDuplicates.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                All flagged candidates have been reviewed.
              </p>
            )}
            {openDuplicates.map((d) => (
              <div key={d.pairId} className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-semibold">{d.reason}</p>
                  <Badge variant="outline" className="shrink-0 border-destructive/40 bg-destructive/10 text-destructive">
                    {d.confidence}% match
                  </Badge>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[d.a, d.b].map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-background/40 p-3">
                      <p className="font-mono text-xs text-primary">{r.id}</p>
                      <p className="mt-1 text-sm font-semibold">{r.summary}</p>
                      <p className="text-xs text-muted-foreground">{r.camp}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.by} · {r.at}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setResolved((p) => [...p, d.pairId]);
                      toast.success(`Merged ${d.b.id} into ${d.a.id}`);
                    }}
                  >
                    <CopyCheck className="size-4" /> Merge as duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-border bg-secondary/40"
                    onClick={() => {
                      setResolved((p) => [...p, d.pairId]);
                      toast("Kept as separate requests");
                    }}
                  >
                    Keep both
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
