<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('type_maintenances', function (Blueprint $table) {
            $table->id('id_type_maintenance');
            $table->string('nom_type', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('maintenances', function (Blueprint $table) {
            $table->id('id_maintenance');
            $table->date('date_demande')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->text('description_probleme')->nullable();
            $table->text('diagnostic')->nullable();
            $table->string('technicien', 150)->nullable();
            $table->enum('statut', ['demandee', 'planifiee', 'en_cours', 'terminee', 'annulee'])->default('demandee');
            $table->foreignId('id_equipement')->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->foreignId('id_type_maintenance')->constrained('type_maintenances', 'id_type_maintenance')->restrictOnDelete();
            $table->foreignId('id_agent')->nullable()->constrained('agents', 'id_agent')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->id('id_ticket');
            $table->string('reference_ticket', 30)->unique();
            $table->string('titre', 200);
            $table->text('description')->nullable();
            $table->enum('priorite', ['basse', 'moyenne', 'haute', 'critique'])->default('moyenne');
            $table->date('date_creation')->nullable();
            $table->date('date_cloture')->nullable();
            $table->enum('statut', ['ouvert', 'en_cours', 'resolu', 'ferme'])->default('ouvert');
            $table->foreignId('id_equipement')->nullable()->constrained('equipements', 'id_equipement')->nullOnDelete();
            $table->foreignId('id_agent')->nullable()->constrained('agents', 'id_agent')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ticket_commentaires', function (Blueprint $table) {
            $table->id('id_commentaire');
            $table->text('contenu');
            $table->timestamp('date_commentaire')->useCurrent();
            $table->foreignId('id_ticket')->constrained('tickets', 'id_ticket')->cascadeOnDelete();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_commentaires');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('maintenances');
        Schema::dropIfExists('type_maintenances');
    }
};
