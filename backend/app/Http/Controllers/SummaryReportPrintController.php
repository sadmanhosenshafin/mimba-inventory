<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SummaryReportPrintController extends Controller
{
    public function __invoke(Request $request)
    {
        $fromDate = $request->date('from_date')?->toDateString()
            ?? now()->startOfMonth()->toDateString();
        $toDate = $request->date('to_date')?->toDateString()
            ?? today()->toDateString();

        if (Carbon::parse($fromDate)->gt(Carbon::parse($toDate))) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        $totalSaleAmount = (float) Sale::query()
            ->whereBetween('date', [$fromDate, $toDate])
            ->sum('total_amount');

        $totalExpenseAmount = (float) Expense::query()
            ->whereBetween('date', [$fromDate, $toDate])
            ->sum('amount');

        $totalPurchaseAmount = (float) StockEntry::query()
            ->join('products', 'stock_entries.product_id', '=', 'products.id')
            ->where('stock_entries.type', 'in')
            ->whereBetween('stock_entries.date', [$fromDate, $toDate])
            ->selectRaw('COALESCE(SUM(stock_entries.quantity * products.buy_price), 0) as total')
            ->value('total');

        $totalSalesProfit = (float) SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.date', [$fromDate, $toDate])
            ->sum('sale_items.profit');

        $purchasedProducts = StockEntry::query()
            ->with('product:id,name')
            ->join('products', 'stock_entries.product_id', '=', 'products.id')
            ->where('stock_entries.type', 'in')
            ->whereBetween('stock_entries.date', [$fromDate, $toDate])
            ->select([
                'stock_entries.product_id',
                DB::raw('SUM(stock_entries.quantity) as total_qty'),
                DB::raw('SUM(stock_entries.quantity * products.buy_price) as total_amount'),
            ])
            ->groupBy('stock_entries.product_id')
            ->orderByDesc('total_qty')
            ->get();

        $soldProducts = SaleItem::query()
            ->with('product:id,name')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.date', [$fromDate, $toDate])
            ->select([
                'sale_items.product_id',
                DB::raw('SUM(sale_items.quantity) as total_qty'),
                DB::raw('SUM(sale_items.subtotal) as total_amount'),
            ])
            ->groupBy('sale_items.product_id')
            ->orderByDesc('total_qty')
            ->get();

        return view('reports.summary', [
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'totalPurchaseAmount' => $totalPurchaseAmount,
            'totalSaleAmount' => $totalSaleAmount,
            'totalExpenseAmount' => $totalExpenseAmount,
            'totalProfit' => $totalSalesProfit - $totalExpenseAmount,
            'purchasedProducts' => $purchasedProducts,
            'soldProducts' => $soldProducts,
        ]);
    }
}
