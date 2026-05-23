<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            if (! Schema::hasColumn('products', 'supplier')) {
                $table->string('supplier')->nullable()->index()->after('sell_price');
            }

            if (! Schema::hasColumn('products', 'note')) {
                $table->text('note')->nullable()->after('supplier');
            }
        });

        Schema::table('stock_entries', function (Blueprint $table): void {
            if (! Schema::hasColumn('stock_entries', 'date')) {
                $table->date('date')->nullable()->index()->after('note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('stock_entries', function (Blueprint $table): void {
            if (Schema::hasColumn('stock_entries', 'date')) {
                $table->dropColumn('date');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasColumn('products', 'supplier')) {
                $table->dropColumn('supplier');
            }

            if (Schema::hasColumn('products', 'note')) {
                $table->dropColumn('note');
            }
        });
    }
};
