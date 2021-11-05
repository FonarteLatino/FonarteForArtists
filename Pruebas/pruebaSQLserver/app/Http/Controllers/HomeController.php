<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use SebastianBergmann\Environment\Console;

class HomeController extends Controller
{
    public function __invoke()
    {
        $sql = 'SELECT [Year_Month]
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
        //sqlsrv_connect();
        //$products = DB::connection("sqlsrv")->select($sql);
        
        //$products = DB::connection("sqlsrv")->table('dbo.000_Client_Dashboard_Total')->where('UPC', '7509841216319');
        //dd($products);
        //return $products;
        return view('welcome');
    }
}
