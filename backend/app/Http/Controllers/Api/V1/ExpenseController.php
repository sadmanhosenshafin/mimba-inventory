<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\SaleItem;
use App\Support\RecordsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use RecordsActivity;

    public function summary(): JsonResponse
    {
        $today = today()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();
        $monthlyExpense = Expense::query()->whereBetween('date', [$monthStart, $monthEnd])->sum('amount');
        $monthlyProfit = SaleItem::query()
            ->whereHas('sale', fn ($query) => $query->whereBetween('date', [$monthStart, $monthEnd]))
            ->sum('profit');

        return $this->successResponse('খরচের সারাংশ পাওয়া গেছে।', [
            'summary' => [
                'today_expense' => (float) Expense::query()->whereDate('date', $today)->sum('amount'),
                'monthly_expense' => (float) $monthlyExpense,
                'total_expense' => (float) Expense::query()->sum('amount'),
                'monthly_net_profit' => (float) $monthlyProfit - (float) $monthlyExpense,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $expenses = Expense::query()
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('note', 'like', "%{$search}%");
                });
            })
            ->when($request->string('category')->toString(), fn ($query, string $category) => $query->where('category', $category))
            ->when($request->date('date_from'), fn ($query, $date) => $query->whereDate('date', '>=', $date))
            ->when($request->date('date_to'), fn ($query, $date) => $query->whereDate('date', '<=', $date))
            ->latest('date')
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return $this->successResponse('খরচের তালিকা পাওয়া গেছে।', $expenses);
    }

    public function store(Request $request): JsonResponse
    {
        $expense = Expense::create($this->validateExpense($request));
        $this->recordActivity(
            'expense',
            'খরচ যোগ করা হয়েছে',
            $expense->title.' খাতে '.number_format((float) $expense->amount, 2).' টাকা খরচ যোগ হয়েছে।',
            'expense',
            $expense->id,
            $expense->title
        );

        return $this->successResponse('খরচ সফলভাবে সংরক্ষণ হয়েছে।', [
            'expense' => $expense,
        ], 201);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $expense->update($this->validateExpense($request, true));
        $this->recordActivity(
            'expense_updated',
            'খরচ আপডেট হয়েছে',
            $expense->title.' খরচের তথ্য পরিবর্তন হয়েছে।',
            'expense',
            $expense->id,
            $expense->title
        );

        return $this->successResponse('খরচ আপডেট হয়েছে।', [
            'expense' => $expense->refresh(),
        ]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return $this->successResponse('খরচ মুছে ফেলা হয়েছে।');
    }

    private function validateExpense(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:160'],
            'amount' => [$required, 'numeric', 'min:0'],
            'category' => [$required, 'string', 'max:120'],
            'date' => [$required, 'date'],
            'note' => ['nullable', 'string'],
        ]);
    }
}
