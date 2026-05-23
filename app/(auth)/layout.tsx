import { AuthRedirect } from "@/components/auth/auth-redirect";
import { MimbaLogo } from "@/components/brand/mimba-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthRedirect>
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 tablet:flex tablet:items-center tablet:justify-center tablet:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 tablet:grid tablet:grid-cols-[0.9fr_1.1fr] tablet:items-center laptop:gap-12">
          <section className="space-y-5 pt-6 tablet:pt-0">
            <div className="flex items-center gap-3">
              <MimbaLogo className="size-12" />
              <div>
                <p className="font-heading text-2xl font-semibold leading-none">
                  MIMBA
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ফিড ডিলারের সহজ ব্যবসা সহকারী
                </p>
              </div>
            </div>
            <div className="max-w-md space-y-3">
              <h1 className="text-3xl font-semibold leading-tight tablet:text-4xl">
                ব্যবসার হিসাব এখন আরও সহজ
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                বিক্রি, স্টক, দোকান ও রিপোর্টের জন্য পরিষ্কার বাংলা ড্যাশবোর্ড।
              </p>
            </div>
          </section>

          {children}
        </div>
      </main>
    </AuthRedirect>
  );
}
