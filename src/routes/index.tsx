import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { TopNav } from "@/components/relief/TopNav";
import { VolunteerView } from "@/components/relief/VolunteerView";
import { CoordinatorView } from "@/components/relief/CoordinatorView";
import { SupplierView } from "@/components/relief/SupplierView";
import { AuditView } from "@/components/relief/AuditView";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { DISASTER_EVENTS, type RoleId } from "@/lib/reliefchain-data";

const TITLE = "ReliefChain India — Flood Relief Coordination";
const DESCRIPTION =
  "Offline-first, multi-organisation disaster relief coordination: field requests, explainable stock allocation, and a signed handoff ledger.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [role, setRole] = useState<RoleId>("volunteer");
  const [event, setEvent] = useState(DISASTER_EVENTS[0]!);
  const [online, setOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { queue, pending, enqueue, remove, markAllSynced } = useOfflineQueue();

  function sync() {
    if (pending.length === 0) return;
    setSyncing(true);
    window.setTimeout(() => {
      markAllSynced();
      setSyncing(false);
      toast.success(`${pending.length} request(s) synced to the ledger`, {
        description: "Each entry signed with its device key and evidence hash.",
      });
    }, 1400);
  }

  return (
    <div className="min-h-screen">
      <TopNav
        role={role}
        onRoleChange={setRole}
        event={event}
        onEventChange={setEvent}
        online={online}
        onToggleOnline={() => setOnline((o) => !o)}
        pendingCount={pending.length}
        syncing={syncing}
      />

      <main className="px-4 py-6">
        <div className="mx-auto mb-5 max-w-7xl">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            {role === "volunteer" && "Field request entry"}
            {role === "coordinator" && "District operations dashboard"}
            {role === "supplier" && "NGO supplier console"}
            {role === "auditor" && "Multi-party handoff & ledger audit log"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{event}</p>
        </div>

        {role === "volunteer" && (
          <VolunteerView
            queue={queue}
            pendingCount={pending.length}
            online={online}
            syncing={syncing}
            onEnqueue={enqueue}
            onRemove={remove}
            onSync={sync}
          />
        )}
        {role === "coordinator" && <CoordinatorView pendingCount={pending.length} />}
        {role === "supplier" && <SupplierView />}
        {role === "auditor" && <AuditView />}
      </main>
    </div>
  );
}
