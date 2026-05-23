import { AnimatedPage } from "@/components/shared/animated-page";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({
  title,
  description,
  action,
  children,
  className
}: PageContainerProps) {
  return (
    <AnimatedPage>
      <section className={cn("space-y-5 tablet:space-y-6", className)}>
        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight tablet:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground tablet:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </section>
    </AnimatedPage>
  );
}
