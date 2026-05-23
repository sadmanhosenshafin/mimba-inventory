<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Sale;
use App\Services\CustomerStatusService;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    use RecordsActivity;

    public function index(Request $request): JsonResponse
    {
        $payments = Payment::query()
            ->with('customer:id,shop_name,owner_name,phone', 'sale:id,customer_id,total_amount,paid_amount,due_amount,date')
            ->latest('date')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->successResponse('পেমেন্ট তালিকা পাওয়া গেছে।', $payments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'sale_id' => ['nullable', 'integer', 'exists:sales,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['nullable', 'string', 'max:60'],
            'type' => ['nullable', 'string', 'max:60'],
            'note' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
        ]);

        $payment = DB::transaction(function () use ($validated) {
            $customer = Customer::query()->lockForUpdate()->findOrFail($validated['customer_id']);
            $amount = (float) $validated['amount'];

            $payment = Payment::create([
                'customer_id' => $customer->id,
                'sale_id' => $validated['sale_id'] ?? null,
                'amount' => $amount,
                'method' => $validated['method'] ?? $validated['type'] ?? 'cash',
                'note' => $validated['note'] ?? $validated['notes'] ?? null,
                'date' => $validated['date'] ?? now()->toDateString(),
            ]);

            $remaining = $amount;

            $salesQuery = Sale::query()
                ->where('customer_id', $customer->id)
                ->where('due_amount', '>', 0)
                ->lockForUpdate();

            if (! empty($validated['sale_id'])) {
                $salesQuery->where('id', $validated['sale_id']);
            }

            $sales = $salesQuery->oldest('date')->oldest()->get();

            foreach ($sales as $sale) {
                if ($remaining <= 0) {
                    break;
                }

                $applied = min($remaining, (float) $sale->due_amount);
                $sale->update([
                    'paid_amount' => (float) $sale->paid_amount + $applied,
                    'due_amount' => max((float) $sale->due_amount - $applied, 0),
                ]);
                $remaining -= $applied;
            }

            $customer->update([
                'total_due' => max((float) $customer->total_due - $amount, 0),
            ]);

            app(CustomerStatusService::class)->update($customer);

            AppNotification::create([
                'customer_id' => $customer->id,
                'type' => 'payment_received',
                'message' => $customer->shop_name.' থেকে '.$amount.' টাকা পেমেন্ট পাওয়া গেছে।',
            ]);

            $this->recordActivity(
                'payment',
                'বাকি টাকা জমা হয়েছে',
                $customer->shop_name.' থেকে '.number_format($amount, 2).' টাকা পেমেন্ট পাওয়া গেছে।',
                'customer',
                $customer->id,
                $customer->shop_name
            );

            return $payment->load('customer', 'sale');
        });

        return $this->successResponse('পেমেন্ট সফলভাবে সংরক্ষণ হয়েছে।', [
            'payment' => $payment,
        ], 201);
    }
}
