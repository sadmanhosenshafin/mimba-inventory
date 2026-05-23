<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockEntry;
use Carbon\Carbon;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        [$from, $to, $periodLabel] = $this->periodRange($request);
        $todaySales = $this->salesBetween(today()->toDateString(), today()->toDateString())->sum('total_amount');
        $todayDue = $this->salesBetween(today()->toDateString(), today()->toDateString())->sum('due_amount');
        $todayProfit = $this->profitBetween(today()->toDateString(), today()->toDateString());
        $filteredSales = $this->filteredSales($request, $from, $to);
        $salesProfit = $this->filteredProfit($request, $from, $to);
        $expenses = $this->expensesBetween($from, $to)->sum('amount');
        $buyingCost = $this->buyingCost($request, $from, $to);
        $collected = Payment::query()->whereBetween('date', [$from, $to])->sum('amount');
        $periodDue = (clone $filteredSales)->sum('due_amount');
        $newCustomers = Customer::query()->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])->count();
        $expenseCards = $this->expenseCards();

        return $this->successResponse('রিপোর্ট সারাংশ পাওয়া গেছে।', [
            'summary' => [
                'period_label' => $periodLabel,
                'date_from' => $from,
                'date_to' => $to,
                'today_sales' => (float) $todaySales,
                'today_profit' => (float) $todayProfit,
                'today_due' => (float) $todayDue,
                'month_sales' => (float) (clone $filteredSales)->sum('total_amount'),
                'month_profit' => (float) $salesProfit,
                'month_expenses' => (float) $expenses,
                'net_profit' => (float) ($salesProfit - $expenses),
                'period_due' => (float) $periodDue,
                'new_customers' => $newCustomers,
                'buying_cost' => (float) $buyingCost,
                'collected_amount' => (float) $collected,
                'filtered_sales' => (float) (clone $filteredSales)->sum('total_amount'),
                'filtered_profit' => (float) $salesProfit,
                'total_due' => (float) Customer::query()->sum('total_due'),
                'stock_value' => (float) (Product::query()->selectRaw('SUM(stock * buy_price) as value')->value('value') ?? 0),
                'total_customers' => Customer::query()->count(),
                'total_stock' => Product::query()->sum('stock'),
            ],
            'charts' => [
                'sales_trend' => $this->trend($request, 'sales', $from, $to),
                'due_trend' => $this->trend($request, 'due', $from, $to),
                'profit_trend' => $this->profitTrend($request, $from, $to),
                'expense_trend' => $this->expenseTrend($from, $to),
                'monthly_comparison' => $this->monthlyComparison(),
                'product_performance' => $this->productBars($request, $from, $to),
            ],
            'top_products' => $this->topProducts($request, $from, $to, 5),
            'low_profit_products' => $this->lowProfitProducts($request, $from, $to, 5),
            'top_customers' => $this->topCustomers($request, $from, $to, 5),
            'breakdown' => [
                ...$expenseCards,
            ],
        ]);
    }

    public function dueCustomers(Request $request): JsonResponse
    {
        $latestSaleSubquery = Sale::query()
            ->select('customer_id', DB::raw('MAX(date) as last_sale_date'))
            ->groupBy('customer_id');

        $customers = Customer::query()
            ->leftJoinSub($latestSaleSubquery, 'latest_sales', function ($join): void {
                $join->on('customers.id', '=', 'latest_sales.customer_id');
            })
            ->select([
                'customers.id',
                'customers.shop_name',
                'customers.owner_name',
                'customers.phone',
                'customers.total_due',
                'customers.status',
                'latest_sales.last_sale_date',
            ])
            ->where('customers.total_due', '>', 0)
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('customers.shop_name', 'like', "%{$search}%")
                        ->orWhere('customers.owner_name', 'like', "%{$search}%")
                        ->orWhere('customers.phone', 'like', "%{$search}%");
                });
            })
            ->when(
                $request->input('sort') === 'latest',
                fn ($query) => $query->orderByDesc('latest_sales.last_sale_date'),
                fn ($query) => $query->orderByDesc('customers.total_due')
            )
            ->paginate($request->integer('per_page', 10));

        return $this->successResponse('বাকি কাস্টমারের তালিকা পাওয়া গেছে।', $customers);
    }

    public function exportPdf(Request $request): Response
    {
        [$from, $to, $periodLabel] = $this->periodRange($request);
        $sales = (float) $this->filteredSales($request, $from, $to)->sum('total_amount');
        $profit = (float) $this->filteredProfit($request, $from, $to);
        $expenses = (float) $this->expensesBetween($from, $to)->sum('amount');
        $totalDue = (float) $this->filteredSales($request, $from, $to)->sum('due_amount');
        $buyingCost = (float) $this->buyingCost($request, $from, $to);
        $collected = (float) Payment::query()->whereBetween('date', [$from, $to])->sum('amount');
        $newCustomers = Customer::query()->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])->count();
        $categoryExpenses = $this->expenseCards();
        $generatedAt = now()->format('Y-m-d H:i');

        $html = $this->pdfHtml([
            'periodLabel' => $periodLabel,
            'from' => $from,
            'to' => $to,
            'sales' => $sales,
            'profit' => $profit,
            'expenses' => $expenses,
            'netProfit' => $profit - $expenses,
            'totalDue' => $totalDue,
            'buyingCost' => $buyingCost,
            'collected' => $collected,
            'newCustomers' => $newCustomers,
            'bestProducts' => $this->topProducts($request, $from, $to, 5),
            'lowProfitProducts' => $this->lowProfitProducts($request, $from, $to, 5),
            'categoryExpenses' => $categoryExpenses,
            'generatedAt' => $generatedAt,
        ]);

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);

        $pdf = new Dompdf($options);
        $pdf->loadHtml($html, 'UTF-8');
        $pdf->setPaper('A4');
        $pdf->render();

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="mimba-report.pdf"',
        ]);
    }

    public function daily(Request $request): JsonResponse
    {
        $date = $request->date('date')?->toDateString()
            ?? $request->date('date_from')?->toDateString()
            ?? today()->toDateString();
        $sales = $this->filteredSales($request, $date, $date);
        $payments = Payment::query()->with('customer:id,shop_name,phone')->whereDate('date', $date);
        $expense = Expense::query()->whereDate('date', $date)->sum('amount');

        return $this->successResponse('দৈনিক রিপোর্ট পাওয়া গেছে।', [
            'summary' => [
                'sales' => (float) (clone $sales)->sum('total_amount'),
                'collected' => (float) (clone $payments)->sum('amount'),
                'due' => (float) (clone $sales)->sum('due_amount'),
                'transactions' => (clone $sales)->count(),
                'profit' => (float) $this->filteredProfit($request, $date, $date),
                'expense' => (float) $expense,
            ],
            'activities' => $this->dailyActivities($date),
        ]);
    }

    public function monthly(Request $request): JsonResponse
    {
        $month = $request->input('month', $request->date('date_from')?->format('Y-m') ?? now()->format('Y-m'));
        $start = Carbon::parse($month.'-01')->startOfMonth()->toDateString();
        $endOfMonth = Carbon::parse($month.'-01')->endOfMonth();
        $end = $endOfMonth->isCurrentMonth() ? today()->toDateString() : $endOfMonth->toDateString();
        $daily = Sale::query()
            ->selectRaw('DATE(date) as day, SUM(total_amount) as total')
            ->whereBetween('date', [$start, $end])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('customer_id', $id))
            ->when($request->integer('product_id'), function ($query, int $id): void {
                $query->whereHas('items', fn ($itemQuery) => $itemQuery->where('product_id', $id));
            })
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $best = $daily->sortByDesc('total')->first();
        $worst = $daily->where('total', '>', 0)->sortBy('total')->first();

        return $this->successResponse('মাসিক রিপোর্ট পাওয়া গেছে।', [
            'summary' => [
                'sales' => (float) $this->filteredSales($request, $start, $end)->sum('total_amount'),
                'profit' => (float) $this->filteredProfit($request, $start, $end),
                'due' => (float) $this->filteredSales($request, $start, $end)->sum('due_amount'),
                'expense' => (float) $this->expensesBetween($start, $end)->sum('amount'),
                'best_day' => $best ? Carbon::parse($best->day)->translatedFormat('l') : '-',
                'worst_day' => $worst ? Carbon::parse($worst->day)->translatedFormat('l') : '-',
            ],
            'trend' => $daily->map(fn ($item) => [
                'label' => Carbon::parse($item->day)->format('d'),
                'value' => (float) $item->total,
            ])->values(),
            'products' => $this->topProducts($request, $start, $end, 50),
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request, now()->subDays(29), today());

        $performance = $this->topProducts($request, $from, $to, 100);

        return $this->successResponse('পণ্য রিপোর্ট পাওয়া গেছে।', [
            'summary' => [
                'top_product' => $performance->first()['name'] ?? '-',
                'low_product' => $performance->last()['name'] ?? '-',
                'total_stock' => Product::query()->sum('stock'),
            ],
            'items' => $performance->take($request->integer('per_page', 20))->values(),
            'stock_movements' => StockEntry::query()
                ->with('product:id,name,category')
                ->latest('date')
                ->latest()
                ->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request, now()->subDays(29), today());
        $customers = $this->topCustomers($request, $from, $to, $request->integer('per_page', 20));

        return $this->successResponse('কাস্টমার রিপোর্ট পাওয়া গেছে।', [
            'summary' => [
                'top_customer' => $customers->first()['shop_name'] ?? '-',
                'regular_customers' => $customers->where('sale_count', '>', 0)->count(),
                'high_due_customers' => Customer::query()->where('total_due', '>', 20000)->count(),
            ],
            'items' => $customers,
            'high_due' => Customer::query()
                ->where('total_due', '>', 0)
                ->orderByDesc('total_due')
                ->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function profit(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request, now()->subDays(29), today());
        $expenses = (float) $request->input('expenses', 0);
        $grossProfit = $this->filteredProfit($request, $from, $to);
        $storedExpenses = (float) $this->expensesBetween($from, $to)->sum('amount');
        $totalExpenses = $storedExpenses + $expenses;

        return $this->successResponse('লাভ রিপোর্ট পাওয়া গেছে।', [
            'summary' => [
                'gross_profit' => (float) $grossProfit,
                'expenses' => $totalExpenses,
                'net_profit' => (float) $grossProfit - $totalExpenses,
            ],
        ]);
    }

    private function filteredSales(Request $request, string $from, string $to): Builder
    {
        return Sale::query()
            ->with('customer:id,shop_name,phone')
            ->whereBetween('date', [$from, $to])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('customer_id', $id))
            ->when($request->integer('product_id'), function ($query, int $id): void {
                $query->whereHas('items', fn ($itemQuery) => $itemQuery->where('product_id', $id));
            });
    }

    private function salesBetween(string $from, string $to): Builder
    {
        return Sale::query()->whereBetween('date', [$from, $to]);
    }

    private function filteredProfit(Request $request, string $from, string $to): float
    {
        return (float) SaleItem::query()
            ->whereHas('sale', function ($query) use ($request, $from, $to): void {
                $query->whereBetween('date', [$from, $to])
                    ->when($request->integer('customer_id'), fn ($saleQuery, int $id) => $saleQuery->where('customer_id', $id));
            })
            ->when($request->integer('product_id'), fn ($query, int $id) => $query->where('product_id', $id))
            ->sum('profit');
    }

    private function profitBetween(string $from, string $to): float
    {
        return (float) SaleItem::query()
            ->whereHas('sale', fn ($query) => $query->whereBetween('date', [$from, $to]))
            ->sum('profit');
    }

    private function buyingCost(Request $request, string $from, string $to): float
    {
        return (float) SaleItem::query()
            ->whereHas('sale', function ($query) use ($request, $from, $to): void {
                $query->whereBetween('date', [$from, $to])
                    ->when($request->integer('customer_id'), fn ($saleQuery, int $id) => $saleQuery->where('customer_id', $id));
            })
            ->when($request->integer('product_id'), fn ($query, int $id) => $query->where('product_id', $id))
            ->selectRaw('SUM(buy_price * quantity) as total')
            ->value('total') ?? 0;
    }

    private function expensesBetween(string $from, string $to): Builder
    {
        return Expense::query()->whereBetween('date', [$from, $to]);
    }

    private function expenseCards(): array
    {
        $today = today()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = today()->toDateString();
        $knownCategories = ['গাড়ি ভাড়া', 'শ্রমিক খরচ', 'বিদ্যুৎ', 'দোকান ভাড়া'];

        return [
            'today_expense' => (float) Expense::query()->whereDate('date', $today)->sum('amount'),
            'monthly_expense' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->sum('amount'),
            'vehicle_rent' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->where('category', 'গাড়ি ভাড়া')->sum('amount'),
            'labor_cost' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->where('category', 'শ্রমিক খরচ')->sum('amount'),
            'electricity_bill' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->where('category', 'বিদ্যুৎ')->sum('amount'),
            'shop_rent' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->where('category', 'দোকান ভাড়া')->sum('amount'),
            'other_expense' => (float) Expense::query()->whereBetween('date', [$monthStart, $monthEnd])
                ->where(function ($query) use ($knownCategories): void {
                    $query->where('category', 'অন্যান্য')->orWhereNotIn('category', $knownCategories);
                })
                ->sum('amount'),
        ];
    }

    private function dateRange(Request $request, Carbon|string $defaultFrom, Carbon|string $defaultTo): array
    {
        $from = $request->date('date_from')?->toDateString() ?? Carbon::parse($defaultFrom)->toDateString();
        $to = $request->date('date_to')?->toDateString() ?? Carbon::parse($defaultTo)->toDateString();

        return [$from, $to];
    }

    private function periodRange(Request $request): array
    {
        $period = $request->input('period', 'month');

        if ($period === 'custom') {
            [$from, $to] = $this->dateRange($request, now()->startOfMonth(), today());

            return [$from, $to, 'কাস্টম'];
        }

        return match ($period) {
            'today' => [today()->toDateString(), today()->toDateString(), 'আজকের'],
            'week' => [now()->subDays(6)->toDateString(), today()->toDateString(), 'সাপ্তাহিক'],
            'year' => [now()->startOfYear()->toDateString(), today()->toDateString(), 'বার্ষিক'],
            default => [now()->startOfMonth()->toDateString(), today()->toDateString(), 'মাসিক'],
        };
    }

    private function trend(Request $request, string $type, string $from, string $to)
    {
        return Sale::query()
            ->selectRaw('DATE(date) as day, SUM('.($type === 'due' ? 'due_amount' : 'total_amount').') as total')
            ->whereBetween('date', [$from, $to])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('customer_id', $id))
            ->when($request->integer('product_id'), function ($query, int $id): void {
                $query->whereHas('items', fn ($itemQuery) => $itemQuery->where('product_id', $id));
            })
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($item) => [
                'label' => Carbon::parse($item->day)->format('d/m'),
                'value' => (float) $item->total,
            ]);
    }

    private function profitTrend(Request $request, string $from, string $to)
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->selectRaw('DATE(sales.date) as day, SUM(sale_items.profit) as total')
            ->whereBetween('sales.date', [$from, $to])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('sales.customer_id', $id))
            ->when($request->integer('product_id'), fn ($query, int $id) => $query->where('sale_items.product_id', $id))
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($item) => [
                'label' => Carbon::parse($item->day)->format('d/m'),
                'value' => (float) $item->total,
            ]);
    }

    private function expenseTrend(string $from, string $to)
    {
        return Expense::query()
            ->selectRaw('DATE(date) as day, SUM(amount) as total')
            ->whereBetween('date', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($item) => [
                'label' => Carbon::parse($item->day)->format('d/m'),
                'value' => (float) $item->total,
            ]);
    }

    private function monthlyComparison()
    {
        $start = now()->subMonths(5)->startOfMonth();

        return collect(range(0, 5))->map(function (int $offset) use ($start) {
            $month = $start->copy()->addMonths($offset);
            $from = $month->copy()->startOfMonth()->toDateString();
            $to = $month->copy()->endOfMonth()->toDateString();
            $sales = (float) Sale::query()->whereBetween('date', [$from, $to])->sum('total_amount');
            $profit = (float) $this->profitBetween($from, $to);
            $expenses = (float) $this->expensesBetween($from, $to)->sum('amount');

            return [
                'label' => $month->format('M'),
                'sales' => $sales,
                'profit' => $profit,
                'expenses' => $expenses,
                'net_profit' => $profit - $expenses,
                'value' => $sales,
            ];
        });
    }

    private function productBars(Request $request, string $from, string $to)
    {
        return $this->topProducts($request, $from, $to, 6)
            ->map(fn ($item) => [
                'label' => mb_substr($item['name'], 0, 5),
                'value' => (float) $item['quantity'],
            ]);
    }

    private function topProducts(Request $request, string $from, string $to, int $limit)
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select([
                'products.id',
                'products.name',
                'products.category',
                'products.weight',
                'products.stock',
                DB::raw('SUM(sale_items.quantity) as quantity'),
                DB::raw('SUM(sale_items.subtotal) as revenue'),
                DB::raw('SUM(sale_items.profit) as profit'),
            ])
            ->whereBetween('sales.date', [$from, $to])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('sales.customer_id', $id))
            ->when($request->integer('product_id'), fn ($query, int $id) => $query->where('sale_items.product_id', $id))
            ->groupBy('products.id', 'products.name', 'products.category', 'products.weight', 'products.stock')
            ->orderByDesc('quantity')
            ->limit($limit)
            ->get();
    }

    private function lowProfitProducts(Request $request, string $from, string $to, int $limit)
    {
        return SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select([
                'products.id',
                'products.name',
                'products.category',
                DB::raw('SUM(sale_items.quantity) as quantity'),
                DB::raw('SUM(sale_items.subtotal) as revenue'),
                DB::raw('SUM(sale_items.profit) as profit'),
            ])
            ->whereBetween('sales.date', [$from, $to])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('sales.customer_id', $id))
            ->when($request->integer('product_id'), fn ($query, int $id) => $query->where('sale_items.product_id', $id))
            ->groupBy('products.id', 'products.name', 'products.category')
            ->orderBy('profit')
            ->limit($limit)
            ->get();
    }

    private function topCustomers(Request $request, string $from, string $to, int $limit)
    {
        return Customer::query()
            ->leftJoin('sales', function ($join) use ($from, $to): void {
                $join->on('customers.id', '=', 'sales.customer_id')
                    ->whereBetween('sales.date', [$from, $to]);
            })
            ->select([
                'customers.id',
                'customers.shop_name',
                'customers.owner_name',
                'customers.phone',
                'customers.total_due',
                DB::raw('COUNT(sales.id) as sale_count'),
                DB::raw('COALESCE(SUM(sales.total_amount), 0) as total_purchase'),
                DB::raw('MAX(sales.date) as last_purchase_date'),
            ])
            ->when($request->integer('customer_id'), fn ($query, int $id) => $query->where('customers.id', $id))
            ->groupBy('customers.id', 'customers.shop_name', 'customers.owner_name', 'customers.phone', 'customers.total_due')
            ->orderByDesc('total_purchase')
            ->limit($limit)
            ->get();
    }

    private function dailyActivities(string $date)
    {
        $sales = Sale::query()
            ->with('customer:id,shop_name')
            ->whereDate('date', $date)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($sale) => $sale->customer?->shop_name.' দোকানে বিক্রি ৳'.$sale->total_amount);

        $payments = Payment::query()
            ->with('customer:id,shop_name')
            ->whereDate('date', $date)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($payment) => $payment->customer?->shop_name.' থেকে পেমেন্ট ৳'.$payment->amount);

        return $sales->merge($payments)->filter()->take(10)->values();
    }

    private function pdfHtml(array $data): string
    {
        $money = fn (float $amount): string => number_format($amount, 2);
        $isDaily = $data['periodLabel'] === 'আজকের';
        $isMonthly = $data['periodLabel'] === 'মাসিক';
        $salesLabel = $isDaily ? 'আজকের বিক্রি' : ($isMonthly ? 'মাসিক বিক্রি' : $data['periodLabel'].' বিক্রি');
        $profitLabel = $isDaily ? 'আজকের লাভ' : ($isMonthly ? 'মাসিক লাভ' : $data['periodLabel'].' লাভ');
        $dueLabel = $isDaily ? 'আজকের বাকি' : ($isMonthly ? 'মাসিক বাকি' : $data['periodLabel'].' বাকি');
        $expenseLabel = $isDaily ? 'আজকের খরচ' : ($isMonthly ? 'মাসিক খরচ' : $data['periodLabel'].' খরচ');

        return '<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8">
<style>
body { font-family: "Kohinoor Bangla", "Bangla MN", "Bangla Sangam MN", "Noto Sans Bengali", DejaVu Sans, sans-serif; color: #111827; font-size: 14px; background: #ffffff; }
.header { border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 20px; }
h1 { font-size: 24px; margin: 0 0 6px; }
.muted { color: #6b7280; }
.card { box-shadow: none; }
.grid { display: table; width: 100%; border-collapse: separate; border-spacing: 0 10px; }
.row { display: table-row; }
.cell { display: table-cell; border: 1px solid #e5e7eb; padding: 14px; width: 50%; }
.label { color: #6b7280; font-size: 12px; margin-bottom: 6px; }
.value { font-size: 22px; font-weight: bold; }
.section-title { font-size: 18px; margin: 24px 0 10px; }
.product-list { margin: 0; padding-left: 18px; line-height: 1.8; }
.footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
@media print {
    .no-print {
        display: none !important;
    }

    body {
        background: white !important;
    }

    .card {
        box-shadow: none !important;
        border: none !important;
    }
}
</style>
</head>
<body>
<div class="header">
<h1>MIMBA সারাংশ রিপোর্ট</h1>
<div class="muted">'.$data['periodLabel'].' রিপোর্ট · '.$data['from'].' থেকে '.$data['to'].'</div>
</div>
<div class="grid">
<div class="row">
<div class="cell"><div class="label">'.$salesLabel.'</div><div class="value">৳ '.$money($data['sales']).'</div></div>
<div class="cell"><div class="label">'.$profitLabel.'</div><div class="value">৳ '.$money($data['profit']).'</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">'.$expenseLabel.'</div><div class="value">৳ '.$money($data['expenses']).'</div></div>
<div class="cell"><div class="label">নিট লাভ</div><div class="value">৳ '.$money($data['netProfit']).'</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">'.$dueLabel.'</div><div class="value">৳ '.$money($data['totalDue']).'</div></div>
<div class="cell"><div class="label">নতুন কাস্টমার</div><div class="value">'.$data['newCustomers'].' জন</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">আজকের খরচ</div><div class="value">৳ '.$money($data['categoryExpenses']['today_expense']).'</div></div>
<div class="cell"><div class="label">মাসিক খরচ</div><div class="value">৳ '.$money($data['categoryExpenses']['monthly_expense']).'</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">গাড়ি ভাড়া</div><div class="value">৳ '.$money($data['categoryExpenses']['vehicle_rent']).'</div></div>
<div class="cell"><div class="label">শ্রমিক খরচ</div><div class="value">৳ '.$money($data['categoryExpenses']['labor_cost']).'</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">বিদ্যুৎ bill</div><div class="value">৳ '.$money($data['categoryExpenses']['electricity_bill']).'</div></div>
<div class="cell"><div class="label">দোকান ভাড়া</div><div class="value">৳ '.$money($data['categoryExpenses']['shop_rent']).'</div></div>
</div>
<div class="row">
<div class="cell"><div class="label">অন্যান্য</div><div class="value">৳ '.$money($data['categoryExpenses']['other_expense']).'</div></div>
<div class="cell"><div class="label">রিপোর্ট তৈরি</div><div class="value">'.$data['generatedAt'].'</div></div>
</div>
</div>
<h2 class="section-title">সেরা পণ্য</h2>
<ul class="product-list">'.$data['bestProducts']->map(fn ($item) => '<li>'.$item->name.' — '.$item->quantity.' বস্তা, লাভ ৳'.$money((float) $item->profit).'</li>')->implode('').'</ul>
<h2 class="section-title">কম লাভ পণ্য</h2>
<ul class="product-list">'.$data['lowProfitProducts']->map(fn ($item) => '<li>'.$item->name.' — '.$item->quantity.' বস্তা, লাভ ৳'.$money((float) $item->profit).'</li>')->implode('').'</ul>
<div class="footer">MIMBA · রিপোর্ট তৈরি: '.$data['generatedAt'].'</div>
</body>
</html>';
    }
}
