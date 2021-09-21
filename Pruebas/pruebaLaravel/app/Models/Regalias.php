<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Regalias extends Model
{
    use HasFactory;

    //Relacion 1 a M inversa
    public function cancion(){
        return $this->belongsTo('App\Models\Cancion');
    }

    public function disco(){
        return $this->belongsTo('App\Models\Disco','disco_UPC');
    }
}
