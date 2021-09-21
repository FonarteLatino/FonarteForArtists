<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiscoSelloTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('disco_sello', function (Blueprint $table) {
            $table->unsignedBigInteger('sello_id');
            $table->unsignedBigInteger('disco_UPC');

            $table->foreign('sello_id')->references('id')->on('sellos');
            $table->foreign('disco_UPC')->references('UPC')->on('discos');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('disco_sello');
    }
}