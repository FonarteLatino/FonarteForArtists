<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function __invoke()
    {
        $sql = 'SELECT TOP (1000) [Year_Month]
        ,[Service]
        ,[Retailer]
        ,[Product_Type]
        ,[UPC]
        ,[ISRC]
        ,[UPC_ISRC]
        ,[Country_Sale]
        ,[Quantity]
        ,[Net_Royalty]
        ,[Net_Royalty_Total]
        ,[Currency]
        ,[Currency_ID]
        ,[Tipo_de_cambio]
    FROM [dbo].[000_Client_Dashboard_Total]';
        $products = DB::select($sql);
        return $products;
        return view('welcome');
    }
}
