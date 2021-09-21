<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disco extends Model
{
    use HasFactory;

    //Relacion N a M
    public function sellos(){
        return $this->belongsToMany('App\Models\Sello');
    }

    //Relacion 1 a M inversa
    public function artista(){
        return $this->belongsTo('App\Models\Artista');
    }

     //Relacion 1 a M
     public function cancions(){
        return $this->hasMany('App\Models\Cancion');
    }

    public function regalias(){
        return $this->hasMany('App\Models\Regalias');
    }
}
