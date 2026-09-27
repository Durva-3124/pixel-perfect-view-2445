import { CloudOff, RefreshCw, ShieldCheck, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DISASTER_EVENTS, ROLES, type RoleId } from "@/lib/reliefchain-data";

type Props = {
  role: RoleId;
  onRoleChange: (role: RoleId) => void;
  event: string;
  onEventChange: (event: string) => void;
  online: boolean;
  onToggleOnline: () => void;
  pendingCount: number;
  syncing: boolean;
};

export function TopNav({
  role,
  onRoleChange,
  event,
  onEventChange,
  online,
  onToggleOnline,
  pendingCount,
  syncing,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Waves className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold tracking-tight sm:text-lg">
                ReliefChain India
              </p>
              <p className="label-caps truncate">Coordinated relief ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "hidden gap-2 border-border px-3 py-1.5 font-mono text-[11px] sm:flex",
                online ? "text-success" : "text-warning",
              )}
            >
              <span className="relative flex size-2">
                <span
                  className={cn(
                    "pulse-dot inline-flex size-2 rounded-full",
                    online ? "bg-success text-success" : "bg-warning text-warning",
                  )}
                />
              </span>
              {syncing
                ? "SYNCING…"
                : online
                  ? "LIVE SYNC ACTIVE"
                  : `OFFLINE · ${pendingCount} QUEUED`}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleOnline}
              className="gap-2 border-border bg-secondary/40"
            >
              {online ? <RefreshCw className="size-4" /> : <CloudOff className="size-4" />}
              <span className="hidden sm:inline">{online ? "Go offline" : "Go online"}</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={event} onValueChange={onEventChange}>
            <SelectTrigger className="w-full border-border bg-secondary/40 sm:w-[320px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISASTER_EVENTS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-1 rounded-lg border border-border bg-secondary/30 p-1">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRoleChange(r.id)}
                  aria-pressed={role === r.id}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                    role === r.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="sm:hidden">{r.short}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Badge
            variant="outline"
            className="hidden shrink-0 gap-1.5 border-success/40 bg-success/10 py-1.5 text-success lg:flex"
          >
            <ShieldCheck className="size-3.5" />
            Ledger healthy
          </Badge>
        </div>
      </div>
    </header>
  );
}
