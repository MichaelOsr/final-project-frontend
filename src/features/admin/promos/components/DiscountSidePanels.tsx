import type { ReactNode } from "react";
import { PercentIcon, PackageIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Discount } from "../types/promo.types";
import { formatDiscountType, formatDiscountValue, formatQuota } from "../utils/promoFormat";

export function CreateDiscountGuide() {
  return (
    <aside className="grid content-start gap-3">
      <GuideCard
        icon={<PercentIcon className="mb-3 size-5 text-primary" />}
        title="Discount type"
        text="Percentage accepts 1–100. Nominal is a fixed IDR amount. Buy X Get Y rewards free units per purchase."
      />
      <GuideCard
        icon={<PackageIcon className="mb-3 size-5 text-primary" />}
        title="Product & quota"
        text="Discounts are scoped to a single product in this store. Leave quota empty for unlimited usage."
      />
    </aside>
  );
}

export function EditDiscountSummary({ discount, onDelete }: { discount: Discount | null; onDelete: () => void }) {
  return (
    <aside className="grid content-start gap-3">
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">{discount?.name ?? "Discount"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{discount?.product?.name ?? "Loading..."}</p>
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Details</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {discount ? `${formatDiscountType(discount.type)} · ${formatDiscountValue(discount)}` : "—"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {discount ? `Used / Quota: ${formatQuota(discount)}` : "—"}
        </p>
      </div>
      <Button type="button" variant="destructive" onClick={onDelete} disabled={!discount}>
        <Trash2Icon className="size-4" />
        Delete Discount
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
