<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Sale;

class CustomerStatusService
{
    public function update(Customer $customer): Customer
    {
        $customer->refresh();

        if ((float) $customer->total_due <= 0) {
            $customer->update(['status' => 'green']);

            return $customer->refresh();
        }

        $oldestDueSale = Sale::query()
            ->where('customer_id', $customer->id)
            ->where('due_amount', '>', 0)
            ->oldest('date')
            ->first();

        $dueDays = $oldestDueSale ? now()->startOfDay()->diffInDays($oldestDueSale->date, true) : 0;

        $status = match (true) {
            $dueDays >= 7 || (float) $customer->total_due >= 50000 => 'red',
            $dueDays >= 3 => 'yellow',
            default => 'green',
        };

        $customer->update(['status' => $status]);

        return $customer->refresh();
    }
}
