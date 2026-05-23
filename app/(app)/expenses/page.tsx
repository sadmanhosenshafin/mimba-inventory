"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Loader2, Plus, Search, Trash2, WalletCards } from "lucide-react";
import { AuthInput } from "@/components/auth/auth-input";
import { StatCard } from "@/components/reports/stat-card";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { notifyBusinessDataChanged, subscribeBusinessDataChanged } from "@/lib/live-data/events";
import { expensesApi, type ExpensePayload } from "@/services/api/expenses";

const takaFormatter = new Intl.NumberFormat("bn-BD");
const numberFormatter = new Intl.NumberFormat("bn-BD");

const expenseCategories = ["গাড়ি ভাড়া", "শ্রমিক খরচ", "বিদ্যুৎ", "দোকান ভাড়া", "অন্যান্য"];

type Expense = {
  id: number;
  title: string;
  amount: number | string;
  category: string;
  date: string;
  note?: string | null;
};

type ExpenseSummary = {
  today_expense: number;
  monthly_expense: number;
  total_expense: number;
  monthly_net_profit: number;
};

const emptyForm = {
  title: "",
  amount: "",
  category: expenseCategories[0],
  customCategory: "",
  date: new Date().toISOString().slice(0, 10),
  note: ""
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    today_expense: 0,
    monthly_expense: 0,
    total_expense: 0,
    monthly_net_profit: 0
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = form.category === "custom" ? form.customCategory : form.category;
  const canSubmit = form.title.trim() && form.amount.trim() && selectedCategory.trim() && form.date;

  const loadExpenses = useCallback(async () => {
    const [summaryResponse, listResponse] = await Promise.all([
      expensesApi.summary(),
      expensesApi.list({
        search: search || undefined,
        category: category || undefined,
        page,
        per_page: 8
      })
    ]);

    setSummary(summaryResponse.data.data.summary);
    setExpenses(listResponse.data.data.data || []);
    setLastPage(listResponse.data.data.last_page || 1);
  }, [category, page, search]);

  useEffect(() => {
    void loadExpenses();
    return subscribeBusinessDataChanged(() => void loadExpenses());
  }, [loadExpenses]);

  const payload = useMemo<ExpensePayload>(() => ({
    title: form.title.trim(),
    amount: Number(form.amount) || 0,
    category: selectedCategory.trim(),
    date: form.date,
    note: form.note.trim() || undefined
  }), [form, selectedCategory]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await expensesApi.update(editingId, payload);
      } else {
        await expensesApi.create(payload);
      }
      resetForm();
      await loadExpenses();
      notifyBusinessDataChanged();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    const knownCategory = expenseCategories.includes(expense.category);
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: knownCategory ? expense.category : "custom",
      customCategory: knownCategory ? "" : expense.category,
      date: expense.date,
      note: expense.note || ""
    });
  };

  const handleDelete = async (id: number) => {
    await expensesApi.delete(id);
    await loadExpenses();
    notifyBusinessDataChanged();
  };

  return (
    <PageContainer
      title="খরচ ব্যবস্থাপনা"
      description="ব্যবসার খরচ লিখুন, তালিকা দেখুন এবং নিট লাভের হিসাব আপডেট রাখুন।"
    >
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard title="আজকের খরচ" value={`৳ ${takaFormatter.format(summary.today_expense)}`} hint="আজকের হিসাব" icon={WalletCards} />
        <StatCard title="মাসিক খরচ" value={`৳ ${takaFormatter.format(summary.monthly_expense)}`} hint="এই মাস" icon={WalletCards} />
        <StatCard title="মোট খরচ" value={`৳ ${takaFormatter.format(summary.total_expense)}`} hint="সব সময়" icon={WalletCards} />
        <StatCard title="এই মাসের নিট লাভ" value={`৳ ${takaFormatter.format(summary.monthly_net_profit)}`} hint="লাভ থেকে খরচ বাদ" icon={WalletCards} />
      </div>

      <form className="grid gap-4 rounded-lg border bg-card p-4 shadow-soft sm:p-5 tablet:grid-cols-2" onSubmit={handleSubmit}>
        <AuthInput label="খরচের নাম" name="title" value={form.title} placeholder="যেমন: গাড়ি ভাড়া" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        <AuthInput label="টাকার পরিমাণ" name="amount" value={form.amount} inputMode="numeric" placeholder="১৫০০" onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
        <label className="block space-y-2">
          <span className="text-sm font-semibold">ক্যাটাগরি</span>
          <select
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="h-12 w-full rounded-md border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          >
            {expenseCategories.map((item) => <option key={item} value={item}>{item}</option>)}
            <option value="custom">নিজস্ব ক্যাটাগরি</option>
          </select>
        </label>
        {form.category === "custom" ? (
          <AuthInput label="নতুন ক্যাটাগরি" name="customCategory" value={form.customCategory} placeholder="ক্যাটাগরির নাম" onChange={(event) => setForm((current) => ({ ...current, customCategory: event.target.value }))} />
        ) : null}
        <AuthInput label="তারিখ" name="date" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
        <label className="block space-y-2 tablet:col-span-2">
          <span className="text-sm font-semibold">নোট</span>
          <textarea
            value={form.note}
            rows={3}
            placeholder="খরচ সম্পর্কে নোট"
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            className="w-full resize-none rounded-md border bg-background px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <div className="flex flex-col gap-2 tablet:col-span-2 tablet:flex-row">
          <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
            {editingId ? "খরচ আপডেট করুন" : "খরচ যোগ করুন"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" size="lg" onClick={resetForm}>
              বাতিল
            </Button>
          ) : null}
        </div>
      </form>

      <div className="grid gap-3 tablet:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="খরচ খুঁজুন"
            className="h-12 w-full rounded-md border bg-card pl-10 pr-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <select
          value={category}
          onChange={(event) => {
            setPage(1);
            setCategory(event.target.value);
          }}
          className="h-12 w-full rounded-md border bg-card px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
        >
          <option value="">সব ক্যাটাগরি</option>
          {expenseCategories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="grid gap-3 rounded-lg border bg-card p-4 shadow-soft tablet:grid-cols-[1fr_auto] tablet:items-center">
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold">{expense.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{expense.category} · {expense.date}</p>
              {expense.note ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{expense.note}</p> : null}
            </div>
            <div className="flex items-center justify-between gap-3 tablet:justify-end">
              <p className="font-heading text-2xl font-semibold">৳ {takaFormatter.format(Number(expense.amount || 0))}</p>
              <Button type="button" variant="outline" size="icon" onClick={() => handleEdit(expense)}>
                <Edit className="size-5" />
              </Button>
              <Button type="button" variant="destructive" size="icon" onClick={() => handleDelete(expense.id)}>
                <Trash2 className="size-5" />
              </Button>
            </div>
          </div>
        ))}
        {expenses.length === 0 ? (
          <p className="rounded-lg border bg-card p-5 text-center text-sm text-muted-foreground">খরচ পাওয়া যায়নি</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>আগের</Button>
        <span className="text-sm text-muted-foreground">পেজ {numberFormatter.format(page)} / {numberFormatter.format(lastPage)}</span>
        <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((current) => current + 1)}>পরের</Button>
      </div>
    </PageContainer>
  );
}
