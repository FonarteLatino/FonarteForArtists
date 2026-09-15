<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artista extends Model
{
    use HasFactory;

    //Relacion 1 a M
    public function discos(){
        return $this->hasMany('App\Models\Disco');
    }
}
