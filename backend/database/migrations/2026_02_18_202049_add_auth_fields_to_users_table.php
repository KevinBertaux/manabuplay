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
        Schema::table('users', function (Blueprint $table) {
            $table->string('auth_provider', 30)->default('local');
            $table->string('google_sub')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->foreignId('guardian_user_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['guardian_user_id']);
            $table->dropColumn(['auth_provider', 'google_sub', 'is_active', 'guardian_user_id']);
        });
    }
};
