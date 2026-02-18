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
        Schema::create('vocab_entry_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocab_entry_id')->constrained('vocab_entries')->cascadeOnDelete();
            $table->char('language_code', 2);
            $table->string('translated_text', 160);
            $table->timestamps();

            $table->unique(['vocab_entry_id', 'language_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocab_entry_translations');
    }
};
