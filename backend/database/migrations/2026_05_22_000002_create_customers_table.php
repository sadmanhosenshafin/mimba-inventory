<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('shop_name')->index();
            $table->string('owner_name')->index();
            $table->string('phone')->index();
            $table->text('address')->nullable();
            $table->decimal('total_due', 12, 2)->default(0);
            $table->string('status')->default('green')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
