<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id('id_site');
            $table->string('code_site', 20)->unique();
            $table->string('nom_site', 150);
            $table->string('ville', 100);
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('id_direction')->nullable()->constrained('directions', 'id_direction')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('batiments', function (Blueprint $table) {
            $table->id('id_batiment');
            $table->string('code_batiment', 20)->unique();
            $table->string('nom_batiment', 150);
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('id_site')->constrained('sites', 'id_site')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('localisations', function (Blueprint $table) {
            $table->id('id_localisation');
            $table->string('code_localisation', 20)->unique();
            $table->string('nom_localisation', 150);
            $table->string('etage', 30)->nullable();
            $table->string('bureau', 50)->nullable();
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('id_batiment')->constrained('batiments', 'id_batiment')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('localisations');
        Schema::dropIfExists('batiments');
        Schema::dropIfExists('sites');
    }
};
