<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Unicité des libellés de référence : chaque nom (ou raison sociale) doit être
 * distinct dans sa table — deux directions, sites, catégories… portant
 * exactement le même nom rendraient les listes déroulantes et les rapports
 * ambigus. Les doublons éventuels sont renommés automatiquement
 * (« Provisioning » x2 -> « Provisioning - 2 ») avant la pose des indices.
 */
return new class extends Migration
{
    /** Cible : [table, colonne nom, clé primaire]. */
    private function cibles(): array
    {
        return [
            ['directions', 'nom_direction', 'id_direction'],
            ['services', 'nom_service', 'id_service'],
            ['sites', 'nom_site', 'id_site'],
            ['batiments', 'nom_batiment', 'id_batiment'],
            ['localisations', 'nom_localisation', 'id_localisation'],
            ['categories', 'nom_categorie', 'id_categorie'],
            ['marques', 'nom_marque', 'id_marque'],
            ['modeles', 'nom_modele', 'id_modele'],
            ['etat_equipements', 'nom_etat', 'id_etat'],
            ['fournisseurs', 'raison_sociale', 'id_fournisseur'],
        ];
    }

    public function up(): void
    {
        foreach ($this->cibles() as [$table, $colonne, $pk]) {
            // Un indice unique peut déjà exister (création initiale) : on saute
            $dejaUnique = collect(DB::select(
                "SHOW INDEX FROM `{$table}` WHERE Column_name = ? AND Non_unique = 0",
                [$colonne]
            ))->isNotEmpty();
            if ($dejaUnique) {
                continue;
            }

            // Renommage préventif des doublons existants (« Provisioning » x2 -> « Provisioning - 2 »)
            $dupliques = DB::table($table)
                ->select($colonne, DB::raw('COUNT(*) as n'))
                ->whereNotNull($colonne)
                ->groupBy($colonne)
                ->havingRaw('COUNT(*) > 1')
                ->get();

            foreach ($dupliques as $d) {
                $lignes = DB::table($table)
                    ->where($colonne, $d->{$colonne})
                    ->orderBy($pk)
                    ->get();

                foreach ($lignes->skip(1) as $i => $ligne) {
                    $nouveau = $d->{$colonne} . ' - ' . ($i + 2); // le premier garde le nom d'origine
                    DB::table($table)
                        ->where($pk, $ligne->{$pk})
                        ->update([$colonne => $nouveau]);
                }
            }

            Schema::table($table, function (Blueprint $t) use ($table, $colonne) {
                $t->unique($colonne, "uq_{$table}_{$colonne}");
            });
        }
    }

    public function down(): void
    {
        foreach ($this->cibles() as [$table, $colonne]) {
            $existe = collect(DB::select(
                "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
                ["uq_{$table}_{$colonne}"]
            ))->isNotEmpty();
            if ($existe) {
                Schema::table($table, fn (Blueprint $t) => $t->dropUnique("uq_{$table}_{$colonne}"));
            }
        }
    }
};
