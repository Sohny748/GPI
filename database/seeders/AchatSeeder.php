<?php

namespace Database\Seeders;

use App\Models\Achat;
use App\Models\DetailAchat;
use App\Models\Fournisseur;
use Illuminate\Database\Seeder;

class AchatSeeder extends Seeder
{
    public function run(): void
    {
        $fournisseurs = [
            ['ANTANANARIVO INFORMATIQUE SARL', 'M. Rakotobe', '+261 20 22 345 67', 'contact@antanainfo.mg', 'Lot II M 45, Ankorondrano, Antananarivo', '2014B01234'],
            ['TECHNOLOGIES PLUS', 'Mme Razanamalala', '+261 20 22 654 32', 'ventes@techplus.mg', 'Immeuble Sky, Ankorondrano, Antananarivo', '2018B04567'],
            ['MADATECH DISTRIBUTION', 'M. Rajaonarivelo', '+261 32 40 123 45', 'info@madatech.mg', 'Route des Hydrocarbures, Toamasina', '2016B07890'],
            ['GLOBAL PRINT MALAGASY', 'Mme Ranaivoson', '+261 20 22 987 65', 'contact@globalprint.mg', 'Analakely, Antananarivo', '2020B03211'],
        ];

        $fournisseursById = [];
        foreach ($fournisseurs as [$rs, $contact, $tel, $email, $adresse, $rcs]) {
            $fournisseursById[$rs] = Fournisseur::create([
                'raison_sociale' => $rs,
                'contact' => $contact,
                'telephone' => $tel,
                'email' => $email,
                'adresse' => $adresse,
                'rcs' => $rcs,
                'statut' => 'actif',
            ]);
        }

        $achats = [
            ['ACH-2025-001', '2025-02-14', 'FAC-2025-0142', 'BC-2025-0031', 24750000, 'livre'],
            ['ACH-2025-002', '2025-05-03', 'FAC-2025-0311', 'BC-2025-0074', 8900000, 'livre'],
            ['ACH-2026-001', '2026-01-20', 'FAC-2026-0102', 'BC-2026-0012', 14300000, 'livre'],
            ['ACH-2026-002', '2026-08-11', 'FAC-2026-0488', 'BC-2026-0144', 5600000, 'commande'],
        ];

        foreach ($achats as $i => [$ref, $date, $facture, $bc, $montant, $statut]) {
            $achat = Achat::create([
                'reference_achat' => $ref,
                'date_achat' => $date,
                'numero_facture' => $facture,
                'bon_commande' => $bc,
                'montant_total' => $montant,
                'description' => 'Acquisition d\'équipements informatiques',
                'statut' => $statut,
                'id_fournisseur' => array_values($fournisseursById)[$i]->id_fournisseur,
            ]);

            DetailAchat::create([
                'quantite' => rand(2, 10),
                'prix_unitaire' => round($montant / rand(3, 8), 2),
                'montant' => $montant,
                'date_livraison' => $statut === 'livre' ? date('Y-m-d', strtotime($date . ' +21 days')) : date('Y-m-d'),
                'description' => 'Lot d\'équipements',
                'id_achat' => $achat->id_achat,
            ]);
        }
    }
}
