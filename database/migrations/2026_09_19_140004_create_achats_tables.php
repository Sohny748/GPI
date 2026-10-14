<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id('id_fournisseur');
            $table->string('raison_sociale', 200);
            $table->string('contact', 100)->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('adresse', 255)->nullable();
            $table->string('rcs', 50)->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
        });

        Schema::table('equipements', function (Blueprint $table) {
            $table->foreign('id_fournisseur')->references('id_fournisseur')->on('fournisseurs')->nullOnDelete();
        });

        Schema::create('achats', function (Blueprint $table) {
            $table->id('id_achat');
            $table->string('reference_achat', 50)->nullable()->unique();
            $table->date('date_achat')->nullable();
            $table->string('numero_facture', 50)->nullable();
            $table->string('bon_commande', 50)->nullable();
            $table->decimal('montant_total', 14, 2)->nullable();
            $table->text('description')->nullable();
            $table->enum('statut', ['commande', 'livre_partiel', 'livre', 'annule'])->default('commande');
            $table->foreignId('id_fournisseur')->nullable()->constrained('fournisseurs', 'id_fournisseur')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('detail_achats', function (Blueprint $table) {
            $table->id('id_detail_achat');
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 14, 2)->nullable();
            $table->decimal('montant', 14, 2)->nullable();
            $table->date('date_livraison');
            $table->text('description')->nullable();
            $table->foreignId('id_achat')->constrained('achats', 'id_achat')->cascadeOnDelete();
            $table->foreignId('id_equipement')->nullable()->constrained('equipements', 'id_equipement')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('equipements', function (Blueprint $table) {
            $table->dropForeign(['id_fournisseur']);
        });
        Schema::dropIfExists('detail_achats');
        Schema::dropIfExists('achats');
        Schema::dropIfExists('fournisseurs');
    }
};
