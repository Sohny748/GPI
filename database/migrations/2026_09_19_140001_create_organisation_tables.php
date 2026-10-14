<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('directions', function (Blueprint $table) {
            $table->id('id_direction');
            $table->string('code_direction', 20)->unique();
            $table->string('nom_direction', 150);
            $table->text('description')->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id('id_service');
            $table->string('code_service', 20)->unique();
            $table->string('nom_service', 150);
            $table->text('description')->nullable();
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->foreignId('id_direction')->constrained('directions', 'id_direction')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('agents', function (Blueprint $table) {
            $table->id('id_agent');
            $table->string('matricule', 30)->unique();
            $table->string('nom_naiss', 100);
            $table->string('prenom', 100);
            $table->enum('sexe', ['M', 'F'])->default('M');
            $table->string('fonction', 100)->nullable();
            $table->string('telephone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->date('date_embauche')->nullable();
            $table->enum('statut', ['actif', 'inactif', 'conge', 'mutation'])->default('actif');
            $table->foreignId('id_direction')->constrained('directions', 'id_direction')->restrictOnDelete();
            $table->foreignId('id_service')->nullable()->constrained('services', 'id_service')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_role');
            $table->string('nom_role', 50)->unique();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('username', 50)->unique();
            $table->string('email', 150)->unique();
            $table->string('password');
            $table->boolean('actif')->default(true);
            $table->timestamp('dernier_connexion')->nullable();
            $table->rememberToken();
            $table->foreignId('id_agent')->nullable()->constrained('agents', 'id_agent')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('role_utilisateur', function (Blueprint $table) {
            $table->foreignId('id_utilisateur')->constrained('utilisateurs', 'id_utilisateur')->cascadeOnDelete();
            $table->foreignId('id_role')->constrained('roles', 'id_role')->cascadeOnDelete();
            $table->primary(['id_utilisateur', 'id_role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_utilisateur');
        Schema::dropIfExists('utilisateurs');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('agents');
        Schema::dropIfExists('services');
        Schema::dropIfExists('directions');
    }
};
