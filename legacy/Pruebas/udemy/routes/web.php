<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth:sanctum', 'verified'])->get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

Route::get('cursos',function(){
    return "Aqui va la lista de lo que sea que quieras poner en esta pagina en blanco Yo no quiero ya teclear estoy arto de la compu hoy prefiero jaranear espero suceda pronto";
})->name('cursos.index');

Route::get('cursos/{course}',function($course){
    return "Aqui va la info con los datos que yo llamo que se sacan de la base con las manos lo reclamo son los cursos y una clase";
})->name('course.show');