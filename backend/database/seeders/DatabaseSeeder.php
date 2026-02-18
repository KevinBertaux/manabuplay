<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $bootstrapAdminEmail = env('ADMIN_BOOTSTRAP_EMAIL');

        if (! $bootstrapAdminEmail) {
            return;
        }

        $admin = User::query()->firstOrCreate(
            ['email' => Str::lower($bootstrapAdminEmail)],
            [
                'name' => 'Bootstrap Admin',
                'password' => Hash::make(Str::random(40)),
                'auth_provider' => 'local',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        $admin->syncRoles(['admin']);
    }
}
