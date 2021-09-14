<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRegaliasesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('regaliases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cancion_id')->nullable();
            $table->unsignedBigInteger('disco_UPC')->nullable();
            $table->string('plataforma');
            $table->integer('clics');
            $table->double('ingresos');
            $table->string('anio');
            $table->string('mes');
            $table->string('pais');

            $table->foreign('cancion_id')->references('id')->on('cancions')->onDelete('cascade');
            $table->foreign('disco_UPC')->references('UPC')->on('discos')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('regaliases');
    }
}
