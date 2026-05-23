<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_returns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('buy_price', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('profit_amount', 12, 2)->default(0);
            $table->string('reason')->index();
            $table->text('note')->nullable();
            $table->date('return_date')->index();
            $table->timestamps();

            $table->index(['sale_id', 'product_id']);
            $table->index(['customer_id', 'return_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_returns');
    }
};
