<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('app'))->name('accueil');

Route::get('/{any}', fn () => view('app'))
    ->where('any', '^(?!api).*$')
    ->name('spa');
