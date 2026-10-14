<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id('id_categorie');
            $table->string('code_categorie', 20)->unique();
            $table->string('nom_categorie', 100);
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
        });

        Schema::create('marques', function (Blueprint $table) {
            $table->id('id_marque');
            $table->string('nom_marque', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('modeles', function (Blueprint $table) {
            $table->id('id_modele');
            $table->string('reference_modele', 50)->unique();
            $table->string('nom_modele', 150);
            $table->text('description')->nullable();
            $table->foreignId('id_categorie')->constrained('categories', 'id_categorie')->restrictOnDelete();
            $table->foreignId('id_marque')->constrained('marques', 'id_marque')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('etat_equipements', function (Blueprint $table) {
            $table->id('id_etat');
            $table->string('nom_etat', 50)->unique();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('equipements', function (Blueprint $table) {
            $table->id('id_equipement');
            $table->string('code_inventaire', 50)->unique();
            $table->string('numero_serie', 100)->nullable()->unique();
            $table->string('designation', 200);
            $table->text('description')->nullable();
            $table->date('date_acquisition')->nullable();
            $table->date('date_mise_service')->nullable();
            $table->decimal('prix_acquisition', 14, 2)->nullable();
            $table->date('garantie_debut')->nullable();
            $table->date('garantie_fin')->nullable();
            $table->enum('statut', ['en_service', 'en_stock', 'en_maintenance', 'reforme', 'perdu', 'reserve'])->default('en_stock');
            $table->foreignId('id_modele')->nullable()->constrained('modeles', 'id_modele')->nullOnDelete();
            $table->foreignId('id_categorie')->nullable()->constrained('categories', 'id_categorie')->nullOnDelete();
            $table->foreignId('id_marque')->nullable()->constrained('marques', 'id_marque')->nullOnDelete();
            $table->foreignId('id_direction')->nullable()->constrained('directions', 'id_direction')->nullOnDelete();
            $table->foreignId('id_service')->nullable()->constrained('services', 'id_service')->nullOnDelete();
            $table->unsignedBigInteger('id_fournisseur')->nullable();
            $table->foreignId('id_localisation')->nullable()->constrained('localisations', 'id_localisation')->nullOnDelete();
            $table->foreignId('id_etat')->nullable()->constrained('etat_equipements', 'id_etat')->nullOnDelete();
            $table->timestamps();

            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipements');
        Schema::dropIfExists('etat_equipements');
        Schema::dropIfExists('modeles');
        Schema::dropIfExists('marques');
        Schema::dropIfExists('categories');
    }
};
