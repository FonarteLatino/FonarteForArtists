<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cancion extends Model
{
    use HasFactory;

    //Relacion 1 a M inversa
    public function disco(){
        return $this->belongsTo('App\Models\Disco','disco_UPC');
    }

    //Relacion 1 a M
    public function regalias(){
        return $this->hasMany('App\Models\Regalias');
    }
}
