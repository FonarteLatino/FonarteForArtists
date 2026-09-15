<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCancionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cancions', function (Blueprint $table) {
            $table->id();
            $table->string('ISRC');
            $table->unsignedBigInteger('disco_UPC')->unique();
            $table->string('nombre');

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
        Schema::dropIfExists('cancions');
    }
}
