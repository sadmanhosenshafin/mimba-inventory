import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingCheckoutButton({
  disabled,
  onClick
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-4 laptop:hidden">
      <Button
        type="button"
        size="lg"
        className="mx-auto flex w-full max-w-md shadow-soft"
        disabled={disabled}
        onClick={onClick}
      >
        <CheckCircle2 className="size-5" />
        বিক্রি সম্পন্ন করুন
      </Button>
    </div>
  );
}
