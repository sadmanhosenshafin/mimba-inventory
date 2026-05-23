<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockEntry;
use App\Services\CustomerStatusService;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    use RecordsActivity;

    public function index(Request $request): JsonResponse
    {
        $sales = Sale::query()
            ->with('customer:id,shop_name,owner_name,phone', 'items.product:id,name,category,weight')
            ->latest('date')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('বিক্রির তালিকা পাওয়া গেছে।', $sales);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateSalePayload($request);

        $sale = DB::transaction(function () use ($validated) {
            return $this->saveSaleFromPayload($validated);
        });

        return $this->successResponse('বিক্রি সফলভাবে তৈরি হয়েছে।', [
            'sale' => $sale,
        ], 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        return $this->successResponse('বিক্রির তথ্য পাওয়া গেছে।', [
            'sale' => $sale->load('customer', 'items.product'),
        ]);
    }

    public function update(Request $request, Sale $sale): JsonResponse
    {
        $validated = $this->validateSalePayload($request);

        $sale = DB::transaction(function () use ($sale, $validated) {
            $sale = Sale::query()->with('items')->lockForUpdate()->findOrFail($sale->id);
            $oldCustomer = Customer::query()->lockForUpdate()->findOrFail($sale->customer_id);
            $oldDue = (float) $sale->due_amount;

            foreach ($sale->items as $item) {
                Product::query()->whereKey($item->product_id)->lockForUpdate()->firstOrFail()
                    ->increment('stock', $item->quantity);
            }

            $sale->items()->delete();
            $updatedSale = $this->saveSaleFromPayload($validated, $sale, false);

            $oldCustomer->update([
                'total_due' => max((float) $oldCustomer->total_due - $oldDue, 0),
            ]);

            $newCustomer = Customer::query()->lockForUpdate()->findOrFail($updatedSale->customer_id);
            $newCustomer->increment('total_due', $updatedSale->due_amount);
            app(CustomerStatusService::class)->update($oldCustomer);
            app(CustomerStatusService::class)->update($newCustomer);

            $this->recordActivity(
                'sale_updated',
                'বিক্রি আপডেট হয়েছে',
                $newCustomer->shop_name.' দোকানের বিক্রি সংশোধন হয়েছে।',
                'sale',
                $updatedSale->id,
                $newCustomer->shop_name
            );

            return $updatedSale->load('customer', 'items.product');
        });

        return $this->successResponse('বিক্রি আপডেট হয়েছে।', [
            'sale' => $sale,
        ]);
    }

    public function destroy(Sale $sale): JsonResponse
    {
        DB::transaction(function () use ($sale): void {
            $sale = Sale::query()->with('items', 'customer')->lockForUpdate()->findOrFail($sale->id);
            $customer = Customer::query()->lockForUpdate()->findOrFail($sale->customer_id);

            foreach ($sale->items as $item) {
                Product::query()->whereKey($item->product_id)->lockForUpdate()->firstOrFail()
                    ->increment('stock', $item->quantity);
            }

            $customer->update([
                'total_due' => max((float) $customer->total_due - (float) $sale->due_amount, 0),
            ]);

            $this->recordActivity(
                'sale_deleted',
                'বিক্রি মুছে ফেলা হয়েছে',
                $customer->shop_name.' দোকানের একটি বিক্রি মুছে ফেলা হয়েছে।',
                'sale',
                $sale->id,
                $customer->shop_name
            );

            $sale->delete();
            app(CustomerStatusService::class)->update($customer);
        });

        return $this->successResponse('বিক্রি মুছে ফেলা হয়েছে।');
    }

    private function validateSalePayload(Request $request): array
    {
        return $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'date' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
        ]);
    }

    private function saveSaleFromPayload(array $validated, ?Sale $sale = null, bool $adjustCustomerDue = true): Sale
    {
            $customer = Customer::query()->lockForUpdate()->findOrFail($validated['customer_id']);
            $totalAmount = 0;
            $preparedItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];

                if ($product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => [$product->name.' পণ্যের পর্যাপ্ত স্টক নেই।'],
                    ]);
                }

                $price = $item['price'] ?? $item['unit_price'] ?? $product->sell_price;
                $buyPrice = (float) $product->buy_price;
                $subtotal = $price * $quantity;
                $profit = ($price - $buyPrice) * $quantity;
                $totalAmount += $subtotal;

                $preparedItems[] = compact('product', 'quantity', 'price', 'buyPrice', 'subtotal', 'profit');
            }

            $paidAmount = min($validated['paid_amount'] ?? 0, $totalAmount);
            $dueAmount = max($totalAmount - $paidAmount, 0);

            $sale
                ? $sale->update([
                    'customer_id' => $customer->id,
                    'total_amount' => $totalAmount,
                    'paid_amount' => $paidAmount,
                    'due_amount' => $dueAmount,
                    'date' => $validated['date'] ?? $sale->date ?? now()->toDateString(),
                ])
                : $sale = Sale::create([
                'customer_id' => $customer->id,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'due_amount' => $dueAmount,
                'date' => $validated['date'] ?? now()->toDateString(),
            ]);

            foreach ($preparedItems as $item) {
                $sale->items()->create([
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'buy_price' => $item['buyPrice'],
                    'subtotal' => $item['subtotal'],
                    'profit' => $item['profit'],
                ]);

                $item['product']->decrement('stock', $item['quantity']);

                StockEntry::create([
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'type' => 'out',
                    'note' => 'বিক্রি থেকে স্টক কমেছে',
                ]);

                $item['product']->refresh();
                if ($item['product']->stock <= $item['product']->min_stock) {
                    AppNotification::create([
                        'customer_id' => $customer->id,
                        'type' => 'low_stock',
                        'message' => $item['product']->name.' পণ্যের স্টক কমে গেছে।',
                    ]);
                }
            }

            if ($adjustCustomerDue && $dueAmount > 0) {
                $customer->increment('total_due', $dueAmount);
                AppNotification::create([
                    'customer_id' => $customer->id,
                    'type' => 'due_overdue',
                    'message' => $customer->shop_name.' এর কাছে '.$dueAmount.' টাকা বাকি হয়েছে।',
                ]);
            }

            app(CustomerStatusService::class)->update($customer);

            if (! $sale->wasRecentlyCreated) {
                return $sale->refresh()->load('customer', 'items.product');
            }

            $this->recordActivity(
                'sale',
                'নতুন বিক্রি সম্পন্ন হয়েছে',
                $customer->shop_name.' দোকানে '.number_format($totalAmount, 2).' টাকার বিক্রি হয়েছে।',
                'sale',
                $sale->id,
                $customer->shop_name
            );

            return $sale->load('customer', 'items.product');
    }
}
