import Link from "next/link";
import { AnimatedPage } from "@/components/shared/animated-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  footerText?: string;
  footerHref?: string;
  footerLink?: string;
  children: React.ReactNode;
};

export function AuthCard({
  title,
  description,
  footerText,
  footerHref,
  footerLink,
  children
}: AuthCardProps) {
  return (
    <AnimatedPage>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          {footerText && footerHref && footerLink ? (
            <p className="text-center text-sm text-muted-foreground">
              {footerText}{" "}
              <Link href={footerHref} className="font-semibold text-primary">
                {footerLink}
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
