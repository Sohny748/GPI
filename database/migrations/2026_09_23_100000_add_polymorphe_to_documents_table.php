<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('documentable_type', 100)->nullable()->after('id_equipement');
            $table->unsignedBigInteger('documentable_id')->nullable()->after('documentable_type');
            $table->index(['documentable_type', 'documentable_id']);
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['documentable_type', 'documentable_id']);
            $table->dropColumn(['documentable_type', 'documentable_id']);
        });
    }
};
