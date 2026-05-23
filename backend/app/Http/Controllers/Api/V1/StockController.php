<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Product;
use App\Models\StockEntry;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockController extends Controller
{
    use RecordsActivity;

    public function stockIn(Request $request): JsonResponse
    {
        return $this->moveStock($request, 'in');
    }

    public function stockOut(Request $request): JsonResponse
    {
        return $this->moveStock($request, 'out');
    }

    public function history(Request $request): JsonResponse
    {
        $history = StockEntry::query()
            ->with('product:id,name,category,weight,stock,min_stock')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('স্টক হিস্টোরি পাওয়া গেছে।', $history);
    }

    public function show(StockEntry $stockEntry): JsonResponse
    {
        return $this->successResponse('স্টক এন্ট্রির তথ্য পাওয়া গেছে।', [
            'stock_entry' => $stockEntry->load('product:id,name,category,weight,stock,min_stock,buy_price,sell_price,supplier'),
        ]);
    }

    public function update(Request $request, StockEntry $stockEntry): JsonResponse
    {
        $validated = $this->validateStockPayload($request);

        $entry = DB::transaction(function () use ($stockEntry, $validated) {
            $stockEntry = StockEntry::query()->lockForUpdate()->findOrFail($stockEntry->id);
            $oldProduct = Product::query()->lockForUpdate()->findOrFail($stockEntry->product_id);

            $stockEntry->type === 'in'
                ? $oldProduct->decrement('stock', $stockEntry->quantity)
                : $oldProduct->increment('stock', $stockEntry->quantity);

            $newProduct = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $quantity = (int) $validated['quantity'];
            $type = $validated['type'] ?? $stockEntry->type;

            if ($type === 'out' && $newProduct->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['পর্যাপ্ত স্টক নেই।'],
                ]);
            }

            $type === 'in'
                ? $newProduct->increment('stock', $quantity)
                : $newProduct->decrement('stock', $quantity);

            $buyPrice = $validated['buy_price'] ?? $validated['buying_price'] ?? $stockEntry->buy_price;
            $sellPrice = $validated['sell_price'] ?? $validated['selling_price'] ?? $stockEntry->sell_price;

            if ($type === 'in') {
                $newProduct->update([
                    'buy_price' => $buyPrice ?? $newProduct->buy_price,
                    'sell_price' => $sellPrice ?? $newProduct->sell_price,
                    'supplier' => $validated['supplier'] ?? $newProduct->supplier,
                ]);
            }

            $stockEntry->update([
                'product_id' => $newProduct->id,
                'quantity' => $quantity,
                'type' => $type,
                'buy_price' => $buyPrice,
                'sell_price' => $sellPrice,
                'supplier' => $validated['supplier'] ?? $stockEntry->supplier,
                'note' => $validated['note'] ?? $validated['notes'] ?? null,
                'date' => $validated['date'] ?? now()->toDateString(),
            ]);

            $this->recordActivity(
                'stock_updated',
                'স্টক এন্ট্রি আপডেট হয়েছে',
                $newProduct->name.' পণ্যের স্টক এন্ট্রি সংশোধন হয়েছে।',
                'stock_entry',
                $stockEntry->id,
                $newProduct->name
            );

            return $stockEntry->load('product');
        });

        return $this->successResponse('স্টক এন্ট্রি আপডেট হয়েছে।', [
            'stock_entry' => $entry,
        ]);
    }

    public function destroy(StockEntry $stockEntry): JsonResponse
    {
        DB::transaction(function () use ($stockEntry): void {
            $stockEntry = StockEntry::query()->lockForUpdate()->findOrFail($stockEntry->id);
            $product = Product::query()->lockForUpdate()->findOrFail($stockEntry->product_id);

            if ($stockEntry->type === 'in') {
                if ($product->stock < $stockEntry->quantity) {
                    throw ValidationException::withMessages([
                        'stock_entry' => ['এই এন্ট্রি মুছতে পর্যাপ্ত স্টক নেই।'],
                    ]);
                }

                $product->decrement('stock', $stockEntry->quantity);
            } else {
                $product->increment('stock', $stockEntry->quantity);
            }

            $this->recordActivity(
                'stock_deleted',
                'স্টক এন্ট্রি মুছে ফেলা হয়েছে',
                $product->name.' পণ্যের একটি স্টক এন্ট্রি মুছে ফেলা হয়েছে।',
                'stock_entry',
                $stockEntry->id,
                $product->name
            );

            $stockEntry->delete();
        });

        return $this->successResponse('স্টক এন্ট্রি মুছে ফেলা হয়েছে।');
    }

    private function moveStock(Request $request, string $type): JsonResponse
    {
        $validated = $this->validateStockPayload($request);

        $entry = DB::transaction(function () use ($validated, $type) {
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $quantity = (int) $validated['quantity'];

            if ($type === 'out' && $product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => ['পর্যাপ্ত স্টক নেই।'],
                ]);
            }

            $type === 'in'
                ? $product->increment('stock', $quantity)
                : $product->decrement('stock', $quantity);

            $buyPrice = $validated['buy_price'] ?? $validated['buying_price'] ?? $product->buy_price;
            $sellPrice = $validated['sell_price'] ?? $validated['selling_price'] ?? $product->sell_price;

            if ($type === 'in') {
                $product->update([
                    'buy_price' => $buyPrice,
                    'sell_price' => $sellPrice,
                    'supplier' => $validated['supplier'] ?? $product->supplier,
                ]);
            }

            $entry = StockEntry::create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'type' => $type,
                'buy_price' => $buyPrice,
                'sell_price' => $sellPrice,
                'supplier' => $validated['supplier'] ?? null,
                'note' => $validated['note'] ?? $validated['notes'] ?? null,
                'date' => $validated['date'] ?? now()->toDateString(),
            ]);

            $product->refresh();
            if ($product->stock <= $product->min_stock) {
                AppNotification::create([
                    'customer_id' => null,
                    'type' => 'low_stock',
                    'message' => $product->name.' পণ্যের স্টক কমে গেছে।',
                ]);
            }

            $this->recordActivity(
                $type === 'in' ? 'stock_in' : 'stock_out',
                $type === 'in' ? 'নতুন স্টক যোগ হয়েছে' : 'স্টক কমানো হয়েছে',
                $product->name.' পণ্যে '.$quantity.' বস্তা '.($type === 'in' ? 'যোগ হয়েছে।' : 'কমেছে।'),
                'product',
                $product->id,
                $product->name
            );

            return $entry->load('product');
        });

        return $this->successResponse($type === 'in' ? 'স্টক যোগ হয়েছে।' : 'স্টক কমানো হয়েছে।', [
            'stock_entry' => $entry,
        ], 201);
    }

    private function validateStockPayload(Request $request): array
    {
        return $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'type' => ['nullable', 'in:in,out'],
            'buy_price' => ['nullable', 'numeric', 'min:0'],
            'sell_price' => ['nullable', 'numeric', 'min:0'],
            'buying_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'supplier' => ['nullable', 'string', 'max:160'],
            'date' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
