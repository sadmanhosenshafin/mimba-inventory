import { Bell, Moon, Store } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settings = [
  {
    title: "দোকানের তথ্য",
    text: "নাম, ঠিকানা ও মোবাইল নম্বর",
    icon: Store
  },
  {
    title: "নোটিশ",
    text: "স্টক ও বাকি টাকার সতর্কতা",
    icon: Bell
  },
  {
    title: "থিম",
    text: "হালকা ও ডার্ক মোডের ভিত্তি",
    icon: Moon
  }
];

export default function SettingsPage() {
  return (
    <PageContainer
      title="সেটিংস"
      description="অ্যাপের সাধারণ সেটিংসের জন্য ভিত্তি UI।"
    >
      <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        <Link href="/settings/profile" className="block">
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-5 text-primary" />
                প্রোফাইল সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">নাম, ইমেইল ও পাসওয়ার্ড পরিবর্তন</p>
              <div className="mt-5 h-12 rounded-md border bg-muted/45" />
            </CardContent>
          </Card>
        </Link>
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.text}</p>
                <div className="mt-5 h-12 rounded-md border bg-muted/45" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
