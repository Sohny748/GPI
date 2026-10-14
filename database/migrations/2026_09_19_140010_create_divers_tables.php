<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id('id_document');
            $table->string('nom_document', 200);
            $table->string('type_document', 50)->nullable();
            $table->string('chemin_fichier', 255)->nullable();
            $table->unsignedBigInteger('taille_fichier')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('id_equipement')->nullable()->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id('id_qrcode');
            $table->text('contenu')->nullable();
            $table->string('image', 255)->nullable();
            $table->timestamp('date_generation')->useCurrent();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('id_equipement')->unique()->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('titre', 200);
            $table->text('message')->nullable();
            $table->enum('type', ['info', 'warning', 'alerte', 'succes'])->default('info');
            $table->boolean('lu')->default(false);
            $table->timestamp('date_creation')->useCurrent();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['id_utilisateur', 'lu']);
        });

        Schema::create('journal_activites', function (Blueprint $table) {
            $table->id('id_log');
            $table->string('action', 100);
            $table->string('table_concernee', 100)->nullable();
            $table->unsignedBigInteger('id_element')->nullable();
            $table->text('anciennes_valeurs')->nullable();
            $table->text('nouvelles_valeurs')->nullable();
            $table->string('adresse_ip', 45)->nullable();
            $table->timestamp('date_action')->useCurrent();
            $table->foreignId('id_utilisateur')->nullable()->constrained('utilisateurs', 'id_utilisateur')->nullOnDelete();
            $table->timestamps();

            $table->index(['table_concernee', 'id_element']);
        });
    }
};
