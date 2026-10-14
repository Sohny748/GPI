<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {
            $table->id('id_affectation');
            $table->date('date_affectation');
            $table->date('date_fin')->nullable();
            $table->text('motif')->nullable();
            $table->text('commentaire')->nullable();
            $table->foreignId('id_equipement')->constrained('equipements', 'id_equipement')->cascadeOnDelete();
            $table->foreignId('id_agent')->constrained('agents', 'id_agent')->cascadeOnDelete();
            $table->timestamps();

            $table->index('date_fin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
