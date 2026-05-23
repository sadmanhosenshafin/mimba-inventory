<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use RecordsActivity;

    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('weight', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString(), fn ($query, string $category) => $query->where('category', $category))
            ->when($request->boolean('low_stock'), fn ($query) => $query->whereColumn('stock', '<=', 'min_stock'))
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('পণ্য তালিকা পাওয়া গেছে।', $products);
    }

    public function store(Request $request): JsonResponse
    {
        $product = Product::create($this->normalizeProductPayload($this->validateProduct($request)));
        $this->recordActivity(
            'product_created',
            'নতুন পণ্য যোগ হয়েছে',
            $product->name.' পণ্যটি তালিকায় যোগ হয়েছে।',
            'product',
            $product->id,
            $product->name
        );

        return $this->successResponse('পণ্য সফলভাবে তৈরি হয়েছে।', [
            'product' => $product,
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->successResponse('পণ্যের তথ্য পাওয়া গেছে।', [
            'product' => $product->load(['stockEntries' => fn ($query) => $query->latest()->limit(15)]),
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($this->normalizeProductPayload($this->validateProduct($request, true)));
        $this->recordActivity(
            'product_updated',
            'পণ্যের তথ্য আপডেট হয়েছে',
            $product->name.' পণ্যের তথ্য পরিবর্তন হয়েছে।',
            'product',
            $product->id,
            $product->name
        );

        return $this->successResponse('পণ্যের তথ্য আপডেট হয়েছে।', [
            'product' => $product->refresh(),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return $this->successResponse('পণ্য মুছে ফেলা হয়েছে।');
    }

    private function validateProduct(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:160'],
            'category' => [$required, 'string', 'max:120'],
            'weight' => ['nullable', 'string', 'max:80'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'min_stock' => ['nullable', 'integer', 'min:0'],
            'buy_price' => ['nullable', 'numeric', 'min:0'],
            'sell_price' => ['nullable', 'numeric', 'min:0'],
            'supplier' => ['nullable', 'string', 'max:160'],
            'note' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function normalizeProductPayload(array $validated): array
    {
        if (array_key_exists('notes', $validated) && ! array_key_exists('note', $validated)) {
            $validated['note'] = $validated['notes'];
        }

        unset($validated['notes']);

        return $validated;
    }
}
