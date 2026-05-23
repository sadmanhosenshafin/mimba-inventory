<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table): void {
            $table->decimal('buy_price', 12, 2)->default(0)->after('price');
            $table->decimal('profit', 12, 2)->default(0)->after('subtotal');
        });

        DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->update([
                'sale_items.buy_price' => DB::raw('products.buy_price'),
                'sale_items.profit' => DB::raw('(sale_items.price - products.buy_price) * sale_items.quantity'),
            ]);
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table): void {
            $table->dropColumn(['buy_price', 'profit']);
        });
    }
};
