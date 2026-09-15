<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sello extends Model
{
    use HasFactory;

    //Relacion 1 a 1 inversa
    public function user(){
        return $this->belongsTo('App\Models\User');
    }

    //Relacion N a M
    public function discos(){
        return $this->belongsToMany('App\Models\Disco','disco_UPC');
    }
}
