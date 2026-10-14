<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id('id_inventaire');
            $table->string('reference', 50)->unique();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->text('description')->nullable();
            $table->enum('statut', ['planifie', 'en_cours', 'cloture', 'annule'])->default('planifie');
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('inventaire_details', function (Blueprint $table) {
            $table->id('id_detail');
            $table->boolean('presence')->default(true);
            $table->date('date_constat')->nullable();
            $table->text('observation')->nullable();
            $table->date('date_verification')->nullable();
            $table->enum('statut', ['a_verifier', 'verifie', 'ecart'])->default('a_verifier');
            $table->foreignId('id_inventaire')->constrained('inventaires', 'id_inventaire')->cascadeOnDelete();
            $table->foreignId('id_equipement')->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['id_inventaire', 'id_equipement']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaire_details');
        Schema::dropIfExists('inventaires');
    }
};
