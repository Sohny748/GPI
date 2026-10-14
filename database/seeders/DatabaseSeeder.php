<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            OrganisationSeeder::class,
            LocalisationSeeder::class,
            AchatSeeder::class,       // fournisseurs d'abord (référencés par équipements)
            ParcSeeder::class,
            MaintenanceSeeder::class,
            OperationSeeder::class,
        ]);
    }
}
