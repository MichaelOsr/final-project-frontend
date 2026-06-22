import type { ReactNode } from "react";
import { TicketPercentIcon, TruckIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Voucher } from "../types/voucher.types";
import { formatVoucherScope } from "../utils/promoFormat";

export function CreateVoucherGuide({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <aside className="grid content-start gap-3">
      <GuideCard
        icon={<TicketPercentIcon className="mb-3 size-5 text-primary" />}
        title="Discount type"
        text="Percentage accepts 1–100 and supports a max discount cap. Nominal is a fixed IDR amount."
      />
      <GuideCard
        icon={<TruckIcon className="mb-3 size-5 text-primary" />}
        title="Voucher purpose"
        text={
          isSuperAdmin
            ? "Transaction applies to subtotal, delivery to shipping. Use Apply globally for all stores."
            : "Transaction applies to subtotal, delivery to shipping. Vouchers are scoped to your store."
        }
      />
    </aside>
  );
}

export function EditVoucherSummary({ voucher, onDelete }: { voucher: Voucher | null; onDelete: () => void }) {
  return (
    <aside className="grid content-start gap-3">
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">{voucher?.name ?? "Voucher"}</p>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{voucher?.code ?? "Loading..."}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Scope</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {voucher ? formatVoucherScope(voucher) : "—"}
        </p>
      </div>
      <Button type="button" variant="destructive" onClick={onDelete} disabled={!voucher}>
        <Trash2Icon className="size-4" />
        Delete Voucher
      </Button>
    </aside>
  );
}

function GuideCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      {icon}
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
