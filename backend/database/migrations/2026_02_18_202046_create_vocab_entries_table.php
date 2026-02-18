<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vocab_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocab_list_id')->constrained('vocab_lists')->cascadeOnDelete();
            $table->string('source_text', 160);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['vocab_list_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocab_entries');
    }
};
