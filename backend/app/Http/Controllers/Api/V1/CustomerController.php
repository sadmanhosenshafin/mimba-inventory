<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use RecordsActivity;

    public function index(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('shop_name', 'like', "%{$search}%")
                        ->orWhere('owner_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('কাস্টমার তালিকা পাওয়া গেছে।', $customers);
    }

    public function store(Request $request): JsonResponse
    {
        $customer = Customer::create($this->validateCustomer($request));
        $this->recordActivity(
            'customer_created',
            'নতুন কাস্টমার যোগ হয়েছে',
            $customer->shop_name.' দোকানটি কাস্টমার তালিকায় যোগ হয়েছে।',
            'customer',
            $customer->id,
            $customer->shop_name
        );

        return $this->successResponse('কাস্টমার সফলভাবে তৈরি হয়েছে।', [
            'customer' => $customer,
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return $this->successResponse('কাস্টমারের তথ্য পাওয়া গেছে।', [
            'customer' => $customer->load([
                'sales' => fn ($query) => $query->latest()->limit(10),
                'payments' => fn ($query) => $query->latest()->limit(10),
            ]),
        ]);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $customer->update($this->validateCustomer($request, true));
        $this->recordActivity(
            'customer_updated',
            'কাস্টমারের তথ্য আপডেট হয়েছে',
            $customer->shop_name.' দোকানের তথ্য পরিবর্তন হয়েছে।',
            'customer',
            $customer->id,
            $customer->shop_name
        );

        return $this->successResponse('কাস্টমারের তথ্য আপডেট হয়েছে।', [
            'customer' => $customer->refresh(),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return $this->successResponse('কাস্টমার মুছে ফেলা হয়েছে।');
    }

    private function validateCustomer(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return $request->validate([
            'shop_name' => [$required, 'string', 'max:160'],
            'owner_name' => [$required, 'string', 'max:120'],
            'phone' => [$required, 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'total_due' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:green,yellow,red'],
        ]);
    }
}
