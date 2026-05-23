<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_entries', function (Blueprint $table): void {
            if (! Schema::hasColumn('stock_entries', 'buy_price')) {
                $table->decimal('buy_price', 12, 2)->nullable()->after('type');
            }

            if (! Schema::hasColumn('stock_entries', 'sell_price')) {
                $table->decimal('sell_price', 12, 2)->nullable()->after('buy_price');
            }

            if (! Schema::hasColumn('stock_entries', 'supplier')) {
                $table->string('supplier')->nullable()->after('sell_price');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_entries', function (Blueprint $table): void {
            $table->dropColumn(['buy_price', 'sell_price', 'supplier']);
        });
    }
};
