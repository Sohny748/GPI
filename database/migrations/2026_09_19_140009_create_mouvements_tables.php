<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id('id_mouvement');
            $table->enum('type_mouvement', ['affectation', 'restitution', 'transfert', 'maintenance', 'reforme', 'stock'])->default('stock');
            $table->text('motif')->nullable();
            $table->foreignId('ancienne_localisation')->nullable()->constrained('localisations', 'id_localisation')->nullOnDelete();
            $table->foreignId('nouvelle_localisation')->nullable()->constrained('localisations', 'id_localisation')->nullOnDelete();
            $table->date('date_mouvement');
            $table->text('commentaire')->nullable();
            $table->foreignId('id_equipement')->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();

            $table->index(['id_equipement', 'date_mouvement']);
        });

        Schema::create('mouvement_historiques', function (Blueprint $table) {
            $table->id('id_historique');
            $table->string('table_concernee', 100);
            $table->unsignedBigInteger('id_enregistrement');
            $table->string('champ', 100)->nullable();
            $table->string('ancienne_valeur', 255)->nullable();
            $table->string('nouvelle_valeur', 255)->nullable();
            $table->text('commentaire')->nullable();
            $table->foreignId('id_mouvement')->nullable()->constrained('mouvements', 'id_mouvement')->cascadeOnDelete();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();

            $table->index(['table_concernee', 'id_enregistrement']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvement_historiques');
        Schema::dropIfExists('mouvements');
    }
};
