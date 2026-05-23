import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  isLoading?: boolean;
  loadingText?: string;
};

export function SubmitButton({
  children,
  isLoading = false,
  loadingText = "অপেক্ষা করুন",
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-5 animate-spin" /> : null}
      {isLoading ? loadingText : children}
    </Button>
  );
}
