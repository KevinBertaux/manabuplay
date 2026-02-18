<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'label' => 'Administrateur'],
            ['name' => 'adult', 'label' => 'Adulte'],
            ['name' => 'child', 'label' => 'Enfant'],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(
                ['name' => $role['name']],
                ['label' => $role['label']]
            );
        }
    }
}
