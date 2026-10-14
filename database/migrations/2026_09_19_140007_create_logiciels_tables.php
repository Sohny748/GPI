<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logiciels', function (Blueprint $table) {
            $table->id('id_logiciel');
            $table->string('nom', 150);
            $table->string('version', 50)->nullable();
            $table->string('editeur', 150)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('licences', function (Blueprint $table) {
            $table->id('id_licence');
            $table->string('reference_licence', 50)->unique();
            $table->string('type_licence', 50)->nullable();
            $table->integer('nb_licences')->default(1);
            $table->date('date_acquisition')->nullable();
            $table->date('date_expiration')->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->enum('statut', ['active', 'expiree', 'revoke'])->default('active');
            $table->foreignId('id_logiciel')->constrained('logiciels', 'id_logiciel')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('installation_logiciels', function (Blueprint $table) {
            $table->id('id_installation');
            $table->date('date_installation')->nullable();
            $table->string('version_installee', 50)->nullable();
            $table->string('licence', 100)->nullable();
            $table->enum('statut', ['installe', 'desinstalle', 'erreur'])->default('installe');
            $table->foreignId('id_logiciel')->constrained('logiciels', 'id_logiciel')->cascadeOnDelete();
            $table->foreignId('id_equipement')->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_logiciel', 'id_equipement']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installation_logiciels');
        Schema::dropIfExists('licences');
        Schema::dropIfExists('logiciels');
    }
};
