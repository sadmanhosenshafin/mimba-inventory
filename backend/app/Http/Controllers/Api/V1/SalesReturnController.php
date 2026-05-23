<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SalesReturn;
use App\Models\StockEntry;
use App\Services\CustomerStatusService;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SalesReturnController extends Controller
{
    use RecordsActivity;

    public function index(Request $request): JsonResponse
    {
        $returns = SalesReturn::query()
            ->with([
                'sale:id,date,total_amount',
                'customer:id,shop_name,owner_name,phone',
                'product:id,name,category,weight',
            ])
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('reason', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery
                            ->where('shop_name', 'like', "%{$search}%")
                            ->orWhere('owner_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%"))
                        ->orWhereHas('product', fn ($productQuery) => $productQuery
                            ->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->string('reason')->toString(), fn ($query, string $reason) => $query->where('reason', $reason))
            ->latest('return_date')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('পণ্য ফেরতের তালিকা পাওয়া গেছে।', $returns);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sale_id' => ['required', 'integer', 'exists:sales,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:120'],
            'note' => ['nullable', 'string'],
            'return_date' => ['nullable', 'date'],
        ]);

        $return = DB::transaction(function () use ($request, $validated) {
            $sale = Sale::query()
                ->with('customer')
                ->lockForUpdate()
                ->findOrFail($validated['sale_id']);
            $customer = Customer::query()->lockForUpdate()->findOrFail($sale->customer_id);
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $saleItem = $sale->items()
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            if (! $saleItem) {
                throw ValidationException::withMessages([
                    'product_id' => ['এই বিক্রিতে নির্বাচিত পণ্য নেই।'],
                ]);
            }

            $returnQuantity = (int) $validated['quantity'];

            if ($returnQuantity > $saleItem->quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['ফেরত পরিমাণ বিক্রি হওয়া পরিমাণের বেশি হতে পারবে না।'],
                ]);
            }

            $unitPrice = (float) $saleItem->price;
            $buyPrice = (float) $saleItem->buy_price;
            $subtotal = $unitPrice * $returnQuantity;
            $profitAmount = ($unitPrice - $buyPrice) * $returnQuantity;
            $oldDue = (float) $sale->due_amount;

            $return = SalesReturn::create([
                'sale_id' => $sale->id,
                'customer_id' => $customer->id,
                'product_id' => $product->id,
                'created_by' => $request->user()?->id,
                'quantity' => $returnQuantity,
                'unit_price' => $unitPrice,
                'buy_price' => $buyPrice,
                'subtotal' => $subtotal,
                'profit_amount' => $profitAmount,
                'reason' => $validated['reason'],
                'note' => $validated['note'] ?? null,
                'return_date' => $validated['return_date'] ?? now()->toDateString(),
            ]);

            if ($returnQuantity === (int) $saleItem->quantity) {
                $saleItem->delete();
            } else {
                $remainingQuantity = (int) $saleItem->quantity - $returnQuantity;
                $saleItem->update([
                    'quantity' => $remainingQuantity,
                    'subtotal' => $remainingQuantity * $unitPrice,
                    'profit' => ($unitPrice - $buyPrice) * $remainingQuantity,
                ]);
            }

            $product->increment('stock', $returnQuantity);

            StockEntry::create([
                'product_id' => $product->id,
                'quantity' => $returnQuantity,
                'type' => 'in',
                'note' => 'পণ্য ফেরত থেকে স্টক যোগ হয়েছে',
                'date' => $validated['return_date'] ?? now()->toDateString(),
            ]);

            $this->recalculateSaleAndCustomerDue($sale, $customer, $oldDue);

            AppNotification::create([
                'customer_id' => $customer->id,
                'type' => 'sales_return',
                'message' => $customer->shop_name.' থেকে '.$product->name.' '.$returnQuantity.' বস্তা ফেরত এসেছে।',
            ]);

            app(CustomerStatusService::class)->update($customer);

            $this->recordActivity(
                'sales_return',
                'পণ্য ফেরত হয়েছে',
                $customer->shop_name.' থেকে '.$product->name.' '.$returnQuantity.' বস্তা ফেরত এসেছে।',
                'sales_return',
                $return->id,
                $customer->shop_name
            );

            return $return->load('sale', 'customer', 'product');
        });

        return $this->successResponse('পণ্য ফেরত সফলভাবে সেভ হয়েছে।', [
            'return' => $return,
        ], 201);
    }

    public function destroy(SalesReturn $return): JsonResponse
    {
        DB::transaction(function () use ($return): void {
            $return->load('sale', 'customer', 'product');
            $sale = Sale::query()->lockForUpdate()->findOrFail($return->sale_id);
            $customer = Customer::query()->lockForUpdate()->findOrFail($return->customer_id);
            $product = Product::query()->lockForUpdate()->findOrFail($return->product_id);

            if ($product->stock < $return->quantity) {
                throw ValidationException::withMessages([
                    'return' => ['এই রিটার্ন মুছতে পর্যাপ্ত স্টক নেই।'],
                ]);
            }

            $oldDue = (float) $sale->due_amount;
            $saleItem = $sale->items()->where('product_id', $product->id)->lockForUpdate()->first();

            if ($saleItem) {
                $quantity = (int) $saleItem->quantity + (int) $return->quantity;
                $saleItem->update([
                    'quantity' => $quantity,
                    'price' => $return->unit_price,
                    'buy_price' => $return->buy_price,
                    'subtotal' => $quantity * (float) $return->unit_price,
                    'profit' => ((float) $return->unit_price - (float) $return->buy_price) * $quantity,
                ]);
            } else {
                $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $return->quantity,
                    'price' => $return->unit_price,
                    'buy_price' => $return->buy_price,
                    'subtotal' => $return->subtotal,
                    'profit' => $return->profit_amount,
                ]);
            }

            $product->decrement('stock', $return->quantity);

            StockEntry::create([
                'product_id' => $product->id,
                'quantity' => $return->quantity,
                'type' => 'out',
                'note' => 'পণ্য ফেরত মুছে স্টক সমন্বয় হয়েছে',
                'date' => now()->toDateString(),
            ]);

            $return->delete();
            $this->recalculateSaleAndCustomerDue($sale, $customer, $oldDue);
            app(CustomerStatusService::class)->update($customer);
        });

        return $this->successResponse('পণ্য ফেরতের রেকর্ড মুছে ফেলা হয়েছে।');
    }

    private function recalculateSaleAndCustomerDue(Sale $sale, Customer $customer, float $oldDue): void
    {
        $sale->refresh();
        $totals = $sale->items()
            ->selectRaw('COALESCE(SUM(subtotal), 0) as total_amount, COALESCE(SUM(profit), 0) as total_profit')
            ->first();
        $totalAmount = (float) $totals->total_amount;
        $paidAmount = min((float) $sale->paid_amount, $totalAmount);
        $newDue = max($totalAmount - $paidAmount, 0);

        $sale->update([
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'due_amount' => $newDue,
        ]);

        $dueDifference = $newDue - $oldDue;
        $customer->update([
            'total_due' => max((float) $customer->total_due + $dueDifference, 0),
        ]);
    }
}
