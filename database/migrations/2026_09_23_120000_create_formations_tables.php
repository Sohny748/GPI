<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Module Formations : sessions de formation liées aux équipements du parc
 * (prise en main, maintenance, sécurité…) avec les agents participants,
 * leur statut de validation et une attestation optionnelle.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id('id_formation');
            $table->string('titre', 200);
            $table->string('theme', 120)->nullable();
            $table->text('description')->nullable();
            $table->string('formateur', 150)->nullable();
            $table->string('organisme', 150)->nullable();
            $table->string('lieu', 150)->nullable();
            $table->enum('modalite', ['presentiel', 'distanciel', 'hybride'])->default('presentiel');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->unsignedTinyInteger('duree_heures')->nullable();
            $table->enum('statut', ['planifiee', 'en_cours', 'terminee', 'annulee'])->default('planifiee');
            $table->foreignId('id_equipement')->nullable()->constrained('equipements', 'id_equipement')->nullOnDelete();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();

            $table->index(['statut', 'date_debut']);
        });

        Schema::create('formation_participants', function (Blueprint $table) {
            $table->id('id_participant');
            $table->foreignId('id_formation')->constrained('formations', 'id_formation')->cascadeOnDelete();
            $table->foreignId('id_agent')->constrained('agents', 'id_agent')->cascadeOnDelete();
            $table->enum('statut', ['inscrit', 'present', 'absent', 'valide'])->default('inscrit');
            $table->decimal('note', 5, 2)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('date_validation')->nullable();
            $table->timestamps();

            $table->unique(['id_formation', 'id_agent']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formation_participants');
        Schema::dropIfExists('formations');
    }
};
