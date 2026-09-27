import { useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  CloudUpload,
  Fingerprint,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Timer,
  Trash2,
  Droplets,
  HeartPulse,
  Package,
  SprayCan,
  Tent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  PRIORITIES,
  simulatedHash,
  shortHash,
  type CategoryId,
  type Priority,
  type QueuedRequest,
} from "@/lib/reliefchain-data";

const ICONS: Record<CategoryId, typeof Package> = {
  food: Package,
  hygiene: SprayCan,
  water: Droplets,
  medical: HeartPulse,
  tarpaulin: Tent,
};

const PRIORITY_TONE: Record<Priority, string> = {
  Low: "text-muted-foreground",
  Medium: "text-primary",
  High: "text-warning",
  Critical: "text-destructive",
};

const DEVICE_SIGNATURE = simulatedHash("device-pwa-77", 64);
const GPS = "18.4529° N, 73.7695° E";

type Props = {
  queue: QueuedRequest[];
  pendingCount: number;
  online: boolean;
  syncing: boolean;
  onEnqueue: (r: QueuedRequest) => void;
  onRemove: (id: string) => void;
  onSync: () => void;
};

export function VolunteerView({
  queue,
  pendingCount,
  online,
  syncing,
  onEnqueue,
  onRemove,
  onSync,
}: Props) {
  const [category, setCategory] = useState<CategoryId>("hygiene");
  const [quantity, setQuantity] = useState(25);
  const [priority, setPriority] = useState<Priority>("Critical");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<{ name: string; url: string; hash: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCategory = CATEGORIES.find((c) => c.id === category)!;
  const timestamp = useMemo(
    () => new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" }),
    [],
  );

  function acceptFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Photo evidence must be an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    setPhoto({
      name: file.name,
      url,
      hash: simulatedHash(`${file.name}-${file.size}-${file.lastModified}`),
    });
  }

  function submit() {
    const id = `LOCAL-${Date.now().toString().slice(-6)}`;
    onEnqueue({
      id,
      categoryId: category,
      quantity,
      priority,
      note,
      photoName: photo?.name ?? null,
      evidenceHash: photo?.hash ?? null,
      gps: GPS,
      capturedAt: new Date().toISOString(),
      deviceSignature: simulatedHash(`${DEVICE_SIGNATURE}-${id}`),
      synced: false,
    });
    toast.success("Request saved on this device", {
      description: `${quantity} ${activeCategory.label} · ${priority} priority`,
    });
    setNote("");
    setPhoto(null);
    setQuantity(25);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3",
          online
            ? "border-success/35 bg-success/10"
            : "border-warning/35 bg-warning/10",
        )}
      >
        <span className="relative flex size-2.5">
          <span
            className={cn(
              "pulse-dot inline-flex size-2.5 rounded-full",
              online ? "bg-success text-success" : "bg-warning text-warning",
            )}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {online
              ? `Online — ${pendingCount} request${pendingCount === 1 ? "" : "s"} ready to sync`
              : `Offline Mode — ${pendingCount} Request${pendingCount === 1 ? "" : "s"} Queued Locally`}
          </p>
          <p className="label-caps truncate">Device PWA-77 · stored on this device</p>
        </div>
        <Button size="sm" onClick={onSync} disabled={!online || syncing || pendingCount === 0}>
          {syncing ? <Loader2 className="size-4 animate-spin" /> : <CloudUpload className="size-4" />}
          Sync
        </Button>
      </div>

      <Card className="panel border-0">
        <CardHeader>
          <CardTitle className="text-lg">New field request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="label-caps">Category</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => {
                const Icon = ICONS[c.id];
                const active = c.id === category;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className={cn("size-5", active && "text-primary")} />
                    <span className="text-sm font-semibold leading-tight text-foreground">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="label-caps">Quantity ({activeCategory.unit})</Label>
            <div className="mt-2 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-11 shrink-0 border-border bg-secondary/40"
                onClick={() => setQuantity((q) => Math.max(1, q - 5))}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <div className="flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-secondary/30 font-mono text-xl font-bold">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-11 shrink-0 border-border bg-secondary/40"
                onClick={() => setQuantity((q) => Math.min(9999, q + 5))}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="label-caps">Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {PRIORITIES.map((p) => (
                <Label
                  key={p}
                  htmlFor={`prio-${p}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors",
                    priority === p
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-accent",
                  )}
                >
                  <RadioGroupItem id={`prio-${p}`} value={p} />
                  <span className={cn("text-sm font-semibold", PRIORITY_TONE[p])}>{p}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="label-caps">Photo evidence</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "mt-2 rounded-xl border border-dashed p-4 transition-colors",
                dragging ? "border-primary bg-primary/10" : "border-border bg-secondary/20",
              )}
            >
              {photo ? (
                <div className="flex items-start gap-3">
                  <img
                    src={photo.url}
                    alt="Evidence preview"
                    className="size-20 shrink-0 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{photo.name}</p>
                    <p className="label-caps mt-1">SHA-256 evidence hash</p>
                    <p className="break-all font-mono text-[11px] text-success">{photo.hash}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => setPhoto(null)}
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 py-4 text-center"
                >
                  <Camera className="size-6 text-muted-foreground" />
                  <span className="text-sm font-semibold">Drag a photo here or tap to capture</span>
                  <span className="text-xs text-muted-foreground">
                    Hashed on device before it ever leaves the phone
                  </span>
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0] ?? undefined)}
              />
            </div>
          </div>

          <div>
            <Label className="label-caps" htmlFor="note">
              Field note (optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Water level receding, 480 people sheltered in school block."
              className="mt-2 border-border bg-secondary/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1.5 border-border bg-secondary/40 font-mono text-[11px]">
              <MapPin className="size-3.5 text-primary" /> {GPS}
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-border bg-secondary/40 font-mono text-[11px]">
              <Timer className="size-3.5 text-primary" /> {timestamp}
            </Badge>
          </div>

          <div className="space-y-2">
            <Button className="h-12 w-full text-base font-semibold" onClick={submit}>
              Queue Request (Saved Offline)
            </Button>
            <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <Fingerprint className="size-3.5" /> Device signature {shortHash(DEVICE_SIGNATURE)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="panel border-0">
        <CardHeader>
          <CardTitle className="text-base">Local queue ({queue.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nothing queued on this device yet.
            </p>
          ) : (
            queue.map((r) => {
              const cat = CATEGORIES.find((c) => c.id === r.categoryId);
              return (
                <div
                  key={r.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-secondary/25 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {r.quantity} {cat?.label} · {r.priority}
                    </p>
                    <p className="label-caps truncate">
                      {r.id} · {new Date(r.capturedAt).toLocaleTimeString("en-IN")} ·{" "}
                      {shortHash(r.deviceSignature)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 text-[11px]",
                        r.synced
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-warning/40 bg-warning/10 text-warning",
                      )}
                    >
                      {r.synced ? <Check className="size-3" /> : <CloudUpload className="size-3" />}
                      {r.synced ? "Synced" : "Queued"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(r.id)}
                      aria-label="Delete queued request"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
