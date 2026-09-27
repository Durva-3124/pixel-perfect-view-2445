import { useMemo, useState } from "react";
import {
  Download,
  FileSearch,
  Search,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CONSIGNMENTS, type Consignment, type DeliveryStatus } from "@/lib/reliefchain-data";

const STATUS_CLASS: Record<DeliveryStatus, string> = {
  Pending: "border-border bg-secondary/50 text-muted-foreground",
  Dispatched: "border-primary/40 bg-primary/10 text-primary",
  "Partial Delivery": "border-warning/40 bg-warning/10 text-warning",
  Verified: "border-success/40 bg-success/10 text-success",
};

const STEP_CLASS = {
  neutral: "border-primary/50 bg-primary/15 text-primary",
  success: "border-success/50 bg-success/15 text-success",
  warning: "border-warning/50 bg-warning/15 text-warning",
  destructive: "border-destructive/50 bg-destructive/15 text-destructive",
} as const;

export function AuditView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [ledger, setLedger] = useState<string>("all");
  const [open, setOpen] = useState<Consignment | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONSIGNMENTS.filter((c) => {
      const matchesQuery =
        !q ||
        [c.id, c.origin, c.destination, c.summary].some((f) => f.toLowerCase().includes(q));
      const matchesStatus = status === "all" || c.status === status;
      const matchesLedger = ledger === "all" || c.ledger === ledger;
      return matchesQuery && matchesStatus && matchesLedger;
    });
  }, [query, status, ledger]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Card className="panel border-0">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search request ID, camp or NGO"
                className="border-border bg-secondary/30 pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="border-border bg-secondary/30 lg:w-48">
                <SelectValue placeholder="Delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All delivery states</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Dispatched">Dispatched</SelectItem>
                <SelectItem value="Partial Delivery">Partial Delivery</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ledger} onValueChange={setLedger}>
              <SelectTrigger className="border-border bg-secondary/30 lg:w-48">
                <SelectValue placeholder="Ledger status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ledger states</SelectItem>
                <SelectItem value="Signed on Ledger">Signed on Ledger</SelectItem>
                <SelectItem value="Pending Signature">Pending Signature</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="border-border bg-secondary/40"
              onClick={() =>
                toast.success("Signed audit trail exported", {
                  description: `${rows.length} consignment records with signatures`,
                })
              }
            >
              <Download className="size-4" /> Export Signed Audit Trail
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="whitespace-nowrap">Request ID</TableHead>
                  <TableHead className="min-w-[220px]">Origin → Destination</TableHead>
                  <TableHead className="min-w-[180px]">Consignment</TableHead>
                  <TableHead className="min-w-[200px]">Delivery status</TableHead>
                  <TableHead className="min-w-[170px]">Ledger</TableHead>
                  <TableHead className="text-right">Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No consignments match these filters.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((c) => (
                  <TableRow key={c.id} className="align-top">
                    <TableCell className="font-mono text-primary">{c.id}</TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold">{c.origin}</p>
                      <p className="text-xs text-muted-foreground">→ {c.destination}</p>
                    </TableCell>
                    <TableCell className="text-sm">{c.summary}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px]", STATUS_CLASS[c.status])}>
                        {c.statusDetail}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 text-[11px]",
                          c.ledger === "Signed on Ledger"
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-secondary/50 text-muted-foreground",
                        )}
                      >
                        {c.ledger === "Signed on Ledger" ? (
                          <ShieldCheck className="size-3.5" />
                        ) : (
                          <ShieldQuestion className="size-3.5" />
                        )}
                        {c.ledger}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5"
                        onClick={() => setOpen(c)}
                      >
                        <FileSearch className="size-4" /> View Audit Trail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-primary">{open.id}</SheetTitle>
                <SheetDescription>
                  {open.origin} → {open.destination} · {open.summary}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-8">
                <ol className="relative space-y-6 border-l border-border pl-6">
                  {open.steps.map((s, i) => (
                    <li key={s.signature} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[31px] grid size-6 place-items-center rounded-full border font-mono text-[11px] font-bold",
                          STEP_CLASS[s.tone],
                        )}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.actor}</p>
                      <p className="label-caps mt-1">{s.at}</p>
                      {s.detail && (
                        <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                      )}
                      <p className="mt-2 break-all rounded-md border border-border bg-secondary/30 p-2 font-mono text-[10px] text-success">
                        {s.signature}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
