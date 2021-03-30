app.controller("main",['$scope','$rootScope','$http','$window','$location',function($scope,$rootScope,$http,$window,$location){
    $scope.usr="Si";
    $scope.gdpData = {
      "BD": 0,
      "BE": 0,
      "BF": 0,
      "BG": 0,
      "BA": 0,
      "BN": 0,
      "BO": 0,
      "JP": 0,
      "BI": 0,
      "BJ": 0,
      "BT": 0,
      "JM": 0,
      "BW": 0,
      "BR": 0,
      "BS": 0,
      "BY": 0,
      "BZ": 0,
      "RU": 0,
      "RW": 0,
      "RS": 0,
      "TL": 0,
      "TM": 0,
      "TJ": 0,
      "RO": 0,
      "GW": 0,
      "GT": 0,
      "GR": 0,
      "GQ": 0,
      "GY": 0,
      "GE": 0,
      "GB": 0,
      "GA": 0,
      "GN": 0,
      "GM": 0,
      "GL": 0,
      "GH": 0,
      "OM": 0,
      "TN": 0,
      "JO": 0,
      "HR": 0,
      "HT": 0,
      "HU": 0,
      "HN": 0,
      "PR": 0,
      "PS": 0,
      "PT": 0,
      "PY": 0,
      "PA": 0,
      "PG": 0,
      "PE": 0,
      "PK": 0,
      "PH": 0,
      "PL": 0,
      "ZM": 0,
      "EH": 0,
      "EE": 0,
      "EG": 0,
      "ZA": 0,
      "EC": 0,
      "IT": 0,
      "VN": 0,
      "SB": 0,
      "ET": 0,
      "SO": 0,
      "ZW": 0,
      "ES": 0,
      "ER": 0,
      "ME": 0,
      "MD": 0,
      "MG": 0,
      "MA": 0,
      "UZ": 0,
      "MM": 0,
      "ML": 0,
      "MN": 0,
      "MK": 0,
      "MW": 0,
      "MR": 0,
      "UG": 0,
      "MY": 0,
      "MX": 0,
      "IL": 0,
      "FR": 0,
      "XS": 0,
      "FI": 0,
      "FJ": 0,
      "FK": 0,
      "NI": 0,
      "NL": 0,
      "NO": 0,
      "NA": 0,
      "VU": 0,
      "NC": 0,
      "NE": 0,
      "NG": 0,
      "NZ": 0,
      "NP": 0,
      "XK": 0,
      "CI": 0,
      "CH": 0,
      "CO": 0,
      "CN": 0,
      "CM": 0,
      "CL": 0,
      "XC": 0,
      "CA": 0,
      "CG": 0,
      "CF": 0,
      "CD": 0,
      "CZ": 0,
      "CY": 0,
      "CR": 0,
      "CU": 0,
      "SZ": 0,
      "SY": 0,
      "KG": 0,
      "KE": 0,
      "SS": 0,
      "SR": 0,
      "KH": 0,
      "SV": 0,
      "SK": 0,
      "KR": 0,
      "SI": 0,
      "KP": 0,
      "KW": 0,
      "SN": 0,
      "SL": 0,
      "KZ": 0,
      "SA": 0,
      "SE": 0,
      "SD": 0,
      "DO": 0,
      "DJ": 0,
      "DK": 0,
      "DE": 0,
      "YE": 0,
      "DZ": 0,
      "US": 0,
      "UY": 0,
      "LB": 0,
      "LA": 0,
      "TW": 0,
      "TT": 0,
      "TR": 0,
      "LK": 0,
      "LV": 0,
      "LT": 0,
      "LU": 0,
      "LR": 0,
      "LS": 0,
      "TH": 0,
      "TF": 0,
      "TG": 0,
      "TD": 0,
      "LY": 0,
      "AE": 0,
      "VE": 0,
      "AF": 0,
      "IQ": 0,
      "IS": 0,
      "IR": 0,
      "AM": 0,
      "AL": 0,
      "AO": 0,
      "AR": 0,
      "AU": 0,
      "AT": 0,
      "IN": 0,
      "TZ": 0,
      "AZ": 0,
      "IE": 0,
      "ID": 0,
      "UA": 0,
      "QA": 0,
      "MZ": 0
    };
    $scope.gdpData1M = $scope.gdpData;
    $scope.gdpData3M = $scope.gdpData;
    $scope.gdpData6M = $scope.gdpData;
    var pa = ["BD","BE","BF","BG","BA","BN","BO","JP","BI","BJ","BT","JM","BW","BR","BS","BY","BZ","RU","RW","RS","TL","TM","TJ","RO","GW","GT","GR","GQ","GY","GE","GB","GA","GN","GM","GL","GH","OM","TN","JO","HR","HT","HU","HN","PR","PS","PT","PY","PA","PG","PE","PK","PH","PL","ZM","EH","EE","EG","ZA","EC","IT","VN","SB","ET","SO","ZW","ES","ER","ME","MD","MG","MA","UZ","MM","ML","MN","MK","MW","MR","UG","MY","MX","IL","FR","XS","FI","FJ","FK","NI","NL","NO","NA","VU","NC","NE","NG","NZ","NP","XK","CI","CH","CO","CN","CM","CL","XC","CA","CG","CF","CD","CZ","CY","CR","CU","SZ","SY","KG","KE","SS","SR","KH","SV","SK","KR","SI","KP","KW","SN","SL","KZ","SA","SE","SD","DO","DJ","DK","DE","YE","DZ","US","UY","LB","LA","TW","TT","TR","LK","LV","LT","LU","LR","LS","TH","TF","TG","TD","LY","AE","VE","AF","IQ","IS","IR","AM","AL","AO","AR","AU","AT","IN","TZ","AZ","IE","ID","UA","QA","MZ"];
    $scope.pais = $scope.gdpData;
    $scope.data=[];
    $scope.cancion1M = [];
    $scope.cancion3M = [];
    $scope.cancion6M = [];
    $scope.cancion = [];
    $scope.disco1M = [];
    $scope.disco3M = [];
    $scope.disco6M = [];
    $scope.disco = [];
    $scope.plataforma1M = [];
    $scope.plataforma3M = [];
    $scope.plataforma6M = [];
    $scope.plataforma = [];
    $scope.iTotal1M = 0;
    $scope.iTotal3M = 0;
    $scope.iTotal6M = 0;
    $scope.iTotal = 0;
    $scope.etiquetas1M = [];
    $scope.etiquetas3M = [];
    $scope.etiquetas6M = [];
    $scope.etiquetas = [];
    $scope.datos1M = [];
    $scope.datos3M = [];
    $scope.datos6M = [];
    $scope.datos = [];
    $scope.artista = '';
    var resta = 1000 * 60 * 60 * 24;
    var calculo = [];
    var now = new Date();
    
    var mapa = function(){
      
      pa.forEach(element => {
  
        $scope.gdpData[element] = $scope.pais[element];
       
      });
      $('#world-map').vectorMap({
            map: 'world_mill',
            series: {
                regions: [{
                    values: $scope.gdpData,
                    scale: ['#C8EEFF', '#0071A4'],
                    normalizeFunction: 'polynomial'
                }]
            },
            onRegionTipShow: function(e, el, code){
                
                el.html(el.html()+' '+$scope.gdpData[code]+' Escuchas');
            }
        });
    };

    var init = function() {
      

      
      let f = '';
      let a = -1;
      for (let index = 0; index < 12; index++) {
        let calc = now.getTime() - (resta * (29*(2 + index)));
        console.log(new Date(calc).getMonth());
        let fecha = new Date(calc);
        console.log('a:'+a);
        console.log('b:'+fecha.getMonth());
        
            if(a == fecha.getMonth()){
                f = (fecha.getFullYear()-1)+'-'+(fecha.getMonth()+12);
                a = fecha.getMonth()+12;
            }else if(a < fecha.getMonth()){
              f = fecha.getFullYear()+'-'+(fecha.getMonth()+1);
              a = fecha.getMonth();
            }else if(a > fecha.getMonth()){
              f = fecha.getFullYear()+'-'+(fecha.getMonth());
              a = fecha.getMonth();
            }else {
                f = fecha.getFullYear()+'-'+(fecha.getMonth());
                a = fecha.getMonth()-1;
            }
            calculo.push(f);
        };
        console.log(calculo);
         
        $scope.usr="No";
        if ($rootScope.usr == undefined||"") {
           
            $location.path('/');
           
         }else {
           
            $scope.usr = $rootScope.usr;
            var req = {
                method : "GET" ,
                url :  "http://localhost:8091/api/regalias/"+$scope.usr , 
                data: {}
              };
             //console.log(req);
              $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
              
                consultar(response.data);
    
              }, function (response) {
               //console.log('El usuario No se encuentra');
                $window.location.href = '#';
              });
         }        
        
    };
      

    init();

      
      
    var consultar = function(reg){
         
      //console.log(reg);
      
      if (reg.length > 0) {
        //console.log(response.data[0]);
        $scope.data=reg;
        reg.forEach(element => {
          pais(element.pais,element.clics);
          cancion(element);
          disco(element);
          plataforma(element);
          $scope.iTotal = $scope.iTotal + element.ingresos;
          
        });
        $scope.artista = reg[0].nombreArtista;
        mapa();
        pastel();
      }else {
       //console.log('El usuario No se encuentra');  
        $window.location.href = '#';
      }


    };

    var pastel = function() {
      //$scope.etiquetas = ['Gastos', 'Ventas', 'Compras'];
      //$scope.datos = [1244, 1500, 2053];
      //console.table($scope.plataforma);
      let aux = $scope.plataforma.sort(((a, b) => b.ingresos - a.ingresos));
      aux.forEach(element => {
        $scope.etiquetas.push(element.plataforma);
        $scope.datos.push(element.ingresos);
      });
      //console.log($scope.etiquetas);
      //console.log($scope.datos);
    }
      
      var cancion = function(e1) {
        //console.log(e1);
        let ax1 = $scope.cancion1M
        let ax3 = $scope.cancion3M
        let ax6 = $scope.cancion6M
        let ax = $scope.cancion
        let c = {
          "nombreCancion":e1.nombreCancion,
          "clics":e1.clics
        };
        
        let a1 = ax1.find(nombre => nombre.nombreCancion === c.nombreCancion);
        let a3 = ax3.find(nombre => nombre.nombreCancion === c.nombreCancion);
        let a6 = ax6.find(nombre => nombre.nombreCancion === c.nombreCancion);
        let a = ax.find(nombre => nombre.nombreCancion === c.nombreCancion);
        
        if (e1.anio == calculo[0]) {
          //console.log(calculo[0]);
          console.log("1M");
          if (a == undefined){
            //console.log("no se encontro");
            //console.log(c);
            $scope.cancion1M.push(c);
            $scope.cancion3M.push(c);
            $scope.cancion6M.push(c);
            
            //console.log(a);
          }
          else{
            //console.log(c);
            //console.log(a);
            a1.clics = a1.clics + c.clics;
            a3.clics = a3.clics + c.clics;
            a6.clics = a6.clics + c.clics;
            
            //console.log(a);
          }

        } else if (e1.anio == calculo[1] || e1.anio == calculo[2]) {
          //console.log(calculo[0]);
          console.log("3M");
          if (a == undefined){
            //console.log("no se encontro");
            //console.log(c);
            $scope.cancion3M.push(c);
            $scope.cancion6M.push(c);
            
            //console.log(a);
          }
          else{
            //console.log(c);
            //console.log(a);
            a3.clics = a3.clics + c.clics;
            a6.clics = a6.clics + c.clics;
            
            //console.log(a);
          }
        } else if (e1.anio == calculo[3] || e1.anio == calculo[4] || e1.anio == calculo[5]) {
          //console.log(calculo[0]);
          console.log("6M");
          if (a == undefined){
            $scope.cancion6M.push(c);
            
          }
          else{
            a6.clics = a6.clics + c.clics;
            
          }
        } 
        
        if (a == undefined){
            
          //$scope.cancion.push(c);
        }
        else{
          
          a.clics = a.clics + c.clics;
        }
       //console.log($scope.cancion);
      };

      var disco = function(e2) {
       //console.log(e2);
        let ax = $scope.disco
        let c = {
          "nombreDisco":e2.nombreDisco,
          "clics":e2.clics
        };
        
        let a = ax.find(nombre => nombre.nombreDisco === c.nombreDisco);
        
        
        if (a == undefined){
          //console.log("no se encontro");
          //console.log(c);
          $scope.disco.push(c);
          //console.log(a);
        }
        else{
          //console.log(c);
          //console.log(a);
          a.clics = a.clics + c.clics;
          //console.log(a);
        }
       //console.log($scope.disco);
      };

      var plataforma = function(e3) {
       //console.log(e3);
        let ax = $scope.plataforma
        let c = {
          "plataforma":e3.plataforma,
          "clics":e3.clics,
          "ingresos": e3.ingresos
        };
        
        let a = ax.find(nombre => nombre.plataforma === c.plataforma);
        
        
        if (a == undefined){
          //console.log("no se encontro");
          //console.log(c);
          $scope.plataforma.push(c);
          //console.log(a);
        }
        else{
          //console.log(c);
          //console.log(a);
          a.clics = a.clics + c.clics;
          a.ingresos = a.ingresos + c.ingresos;
          //console.log(a);
        }
       //console.log($scope.plataforma);
      };

      var pais = function(p,c){
        /*console.log(p);
       //console.log(c);*/
        
        if(p== 'Bangladesh'){$scope.pais["BD"]=$scope.pais["BD"]+c}
        else if(p=='Belgium'){$scope.pais["BE"]=$scope.pais["BE"]+c}
        else if(p=='Burkina Faso'){$scope.pais["BF"]=$scope.pais["BF"]+c}
        else if(p=='Bulgaria'){$scope.pais["BG"]=$scope.pais["BG"]+c}
        else if(p=='Bosnia and Herz.'){$scope.pais["BA"]=$scope.pais["BA"]+c}
        else if(p=='Brunei'){$scope.pais["BN"]=$scope.pais["BN"]+c}
        else if(p=='Bolivia'){$scope.pais["BO"]=$scope.pais["BO"]+c}
        else if(p=='Japan'){$scope.pais["JP"]=$scope.pais["JP"]+c}
        else if(p=='Burundi'){$scope.pais["BI"]=$scope.pais["BI"]+c}
        else if(p=='Benin'){$scope.pais["BJ"]=$scope.pais["BJ"]+c}
        else if(p=='Bhutan'){$scope.pais["BT"]=$scope.pais["BT"]+c}
        else if(p=='Jamaica'){$scope.pais["JM"]=$scope.pais["JM"]+c}
        else if(p=='Botswana'){$scope.pais["BW"]=$scope.pais["BW"]+c}
        else if(p=='Brazil'){$scope.pais["BR"]=$scope.pais["BR"]+c}
        else if(p=='Bahamas'){$scope.pais["BS"]=$scope.pais["BS"]+c}
        else if(p=='Belarus'){$scope.pais["BY"]=$scope.pais["BY"]+c}
        else if(p=='Belize'){$scope.pais["BZ"]=$scope.pais["BZ"]+c}
        else if(p=='Russia'){$scope.pais["RU"]=$scope.pais["RU"]+c}
        else if(p=='Rwanda'){$scope.pais["RW"]=$scope.pais["RW"]+c}
        else if(p=='Serbia'){$scope.pais["RS"]=$scope.pais["RS"]+c}
        else if(p=='Timor-Leste'){$scope.pais["TL"]=$scope.pais["TL"]+c}
        else if(p=='Turkmenistan'){$scope.pais["TM"]=$scope.pais["TM"]+c}
        else if(p=='Tajikistan'){$scope.pais["TJ"]=$scope.pais["TJ"]+c}
        else if(p=='Romania'){$scope.pais["RO"]=$scope.pais["RO"]+c}
        else if(p=='Guinea-Bissau'){$scope.pais["GW"]=$scope.pais["GW"]+c}
        else if(p=='Guatemala'){$scope.pais["GT"]=$scope.pais["GT"]+c}
        else if(p=='Greece'){$scope.pais["GR"]=$scope.pais["GR"]+c}
        else if(p=='Eq. Guinea'){$scope.pais["GQ"]=$scope.pais["GQ"]+c}
        else if(p=='Guyana'){$scope.pais["GY"]=$scope.pais["GY"]+c}
        else if(p=='Georgia'){$scope.pais["GE"]=$scope.pais["GE"]+c}
        else if(p=='United Kingdom'){$scope.pais["GB"]=$scope.pais["GB"]+c}
        else if(p=='Gabon'){$scope.pais["GA"]=$scope.pais["GA"]+c}
        else if(p=='Guinea'){$scope.pais["GN"]=$scope.pais["GN"]+c}
        else if(p=='Gambia'){$scope.pais["GM"]=$scope.pais["GM"]+c}
        else if(p=='Greenland'){$scope.pais["GL"]=$scope.pais["GL"]+c}
        else if(p=='Ghana'){$scope.pais["GH"]=$scope.pais["GH"]+c}
        else if(p=='Oman'){$scope.pais["OM"]=$scope.pais["OM"]+c}
        else if(p=='Tunisia'){$scope.pais["TN"]=$scope.pais["TN"]+c}
        else if(p=='Jordan'){$scope.pais["JO"]=$scope.pais["JO"]+c}
        else if(p=='Croatia'){$scope.pais["HR"]=$scope.pais["HR"]+c}
        else if(p=='Haiti'){$scope.pais["HT"]=$scope.pais["HT"]+c}
        else if(p=='Hungary'){$scope.pais["HU"]=$scope.pais["HU"]+c}
        else if(p=='Honduras'){$scope.pais["HN"]=$scope.pais["HN"]+c}
        else if(p=='Puerto Rico'){$scope.pais["PR"]=$scope.pais["PR"]+c}
        else if(p=='Palestine'){$scope.pais["PS"]=$scope.pais["PS"]+c}
        else if(p=='Portugal'){$scope.pais["PT"]=$scope.pais["PT"]+c}
        else if(p=='Paraguay'){$scope.pais["PY"]=$scope.pais["PY"]+c}
        else if(p=='Panama'){$scope.pais["PA"]=$scope.pais["PA"]+c}
        else if(p=='Papua New Guinea'){$scope.pais["PG"]=$scope.pais["PG"]+c}
        else if(p=='Peru'){$scope.pais["PE"]=$scope.pais["PE"]+c}
        else if(p=='Pakistan'){$scope.pais["PK"]=$scope.pais["PK"]+c}
        else if(p=='Philippines'){$scope.pais["PH"]=$scope.pais}
        else if(p=='Poland'){$scope.pais["PL"]=$scope.pais["PL"]+c}
        else if(p=='Zambia'){$scope.pais["ZM"]=$scope.pais["ZM"]+c}
        else if(p=='W. Sahara'){$scope.pais["EH"]=$scope.pais["EH"]+c}
        else if(p=='Estonia'){$scope.pais["EE"]=$scope.pais["EE"]+c}
        else if(p=='Egypt'){$scope.pais["EG"]=$scope.pais["EG"]+c}
        else if(p=='South Africa'){$scope.pais["ZA"]=$scope.pais["ZA"]+c}
        else if(p=='Ecuador'){$scope.pais["EC"]=$scope.pais["EC"]+c}
        else if(p=='Italy'){$scope.pais["IT"]=$scope.pais["IT"]+c}
        else if(p=='Vietnam'){$scope.pais["VN"]=$scope.pais["VN"]+c}
        else if(p=='Solomon Is.'){$scope.pais["SB"]=$scope.pais["SB"]+c}
        else if(p=='Ethiopia'){$scope.pais["ET"]=$scope.pais["ET"]+c}
        else if(p=='Somalia'){$scope.pais["SO"]=$scope.pais["SO"]+c}
        else if(p=='Zimbabwe'){$scope.pais["ZW"]=$scope.pais["ZW"]+c}
        else if(p=='Spain'){$scope.pais["ES"]=$scope.pais["ES"]+c}
        else if(p=='Eritrea'){$scope.pais["ER"]=$scope.pais["ER"]+c}
        else if(p=='Montenegro'){$scope.pais["ME"]=$scope.pais["ME"]+c}
        else if(p=='Moldova'){$scope.pais["MD"]=$scope.pais["MD"]+c}
        else if(p=='Madagascar'){$scope.pais["MG"]=$scope.pais["MG"]+c}
        else if(p=='Morocco'){$scope.pais["MA"]=$scope.pais["MA"]+c}
        else if(p=='Uzbekistan'){$scope.pais["UZ"]=$scope.pais["UZ"]+c}
        else if(p=='Myanmar'){$scope.pais["MM"]=$scope.pais["MM"]+c}
        else if(p=='Mali'){$scope.pais["ML"]=$scope.pais["ML"]+c}
        else if(p=='Mongolia'){$scope.pais["MN"]=$scope.pais["MN"]+c}
        else if(p=='Macedonia'){$scope.pais["MK"]=$scope.pais["MK"]+c}
        else if(p=='Malawi'){$scope.pais["MW"]=$scope.pais["MW"]+c}
        else if(p=='Mauritania'){$scope.pais["MR"]=$scope.pais["MR"]+c}
        else if(p=='Uganda'){$scope.pais["UG"]=$scope.pais["UG"]+c}
        else if(p=='Malaysia'){$scope.pais["MY"]=$scope.pais["MY"]+c}
        else if(p=='Mexico'){$scope.pais["MX"]=$scope.pais["MX"]+c}
        else if(p=='Israel'){$scope.pais["IL"]=$scope.pais["IL"]+c}
        else if(p=='France'){$scope.pais["FR"]=$scope.pais["FR"]+c}
        else if(p=='Somaliland'){$scope.pais["XS"]=$scope.pais["XS"]+c}
        else if(p=='Finland'){$scope.pais["FI"]=$scope.pais["FI"]+c}
        else if(p=='Fiji'){$scope.pais["FJ"]=$scope.pais["FJ"]+c}
        else if(p=='Falkland Is.'){$scope.pais["FK"]=$scope.pais["FK"]+c}
        else if(p=='Nicaragua'){$scope.pais["NI"]=$scope.pais["NI"]+c}
        else if(p=='Netherlands'){$scope.pais["NL"]=$scope.pais["NL"]+c}
        else if(p=='Norway'){$scope.pais["NO"]=$scope.pais["NO"]+c}
        else if(p=='Namibia'){$scope.pais["NA"]=$scope.pais["NA"]+c}
        else if(p=='Vanuatu'){$scope.pais["VU"]=$scope.pais["VU"]+c}
        else if(p=='New Caledonia'){$scope.pais["NC"]=$scope.pais["NC"]+c}
        else if(p=='Niger'){$scope.pais["NE"]=$scope.pais["NE"]+c}
        else if(p=='Nigeria'){$scope.pais["NG"]=$scope.pais["NG"]+c}
        else if(p=='New Zealand'){$scope.pais["NZ"]=$scope.pais["NZ"]+c}
        else if(p=='Nepal'){$scope.pais["NP"]=$scope.pais["NP"]+c}
        else if(p=='Kosovo'){$scope.pais["XK"]=$scope.pais["XK"]+c}
        else if(p=='Côte d\'Ivoire'){$scope.pais["CI"]=$scope.pais["CI"]+c}
        else if(p=='Switzerland'){$scope.pais["CH"]=$scope.pais["CH"]+c}
        else if(p=='Colombia'){$scope.pais["CO"]=$scope.pais["CO"]+c}
        else if(p=='China'){$scope.pais["CN"]=$scope.pais["CN"]+c}
        else if(p=='Cameroon'){$scope.pais["CM"]=$scope.pais["CM"]+c}
        else if(p=='Chile'){$scope.pais["CL"]=$scope.pais["CL"]+c}
        else if(p=='N. Cyprus'){$scope.pais["XC"]=$scope.pais["XC"]+c}
        else if(p=='Canada'){$scope.pais["CA"]=$scope.pais["CA"]+c}
        else if(p=='Congo'){$scope.pais["CG"]=$scope.pais["CG"]+c}
        else if(p=='Central African Rep.'){$scope.pais["CF"]=$scope.pais["CF"]+c}
        else if(p=='Dem. Rep. Congo'){$scope.pais["CD"]=$scope.pais["CD"]+c}
        else if(p=='Czech Rep.'){$scope.pais["CZ"]=$scope.pais["CZ"]+c}
        else if(p=='Cyprus'){$scope.pais["CY"]=$scope.pais["CY"]+c}
        else if(p=='Costa Rica'){$scope.pais["CR"]=$scope.pais["CR"]+c}
        else if(p=='Cuba'){$scope.pais["CU"]=$scope.pais["CU"]+c}
        else if(p=='Swaziland'){$scope.pais["SZ"]=$scope.pais["SZ"]+c}
        else if(p=='Syria'){$scope.pais["SY"]=$scope.pais["SY"]+c}
        else if(p=='Kyrgyzstan'){$scope.pais["KG"]=$scope.pais["KG"]+c}
        else if(p=='Kenya'){$scope.pais["KE"]=$scope.pais["KE"]+c}
        else if(p=='S. Sudan'){$scope.pais["SS"]=$scope.pais["SS"]+c}
        else if(p=='Suriname'){$scope.pais["SR"]=$scope.pais["SR"]+c}
        else if(p=='Cambodia'){$scope.pais["KH"]=$scope.pais["KH"]+c}
        else if(p=='El Salvador'){$scope.pais["SV"]=$scope.pais["SV"]+c}
        else if(p=='Slovakia'){$scope.pais["SK"]=$scope.pais["SK"]+c}
        else if(p=='Korea'){$scope.pais["KR"]=$scope.pais["KR"]+c}
        else if(p=='Slovenia'){$scope.pais["SI"]=$scope.pais["SI"]+c}
        else if(p=='Dem. Rep. Korea'){$scope.pais["KP"]=$scope.pais["KP"]+c}
        else if(p=='Kuwait'){$scope.pais["KW"]=$scope.pais["KW"]+c}
        else if(p=='Senegal'){$scope.pais["SN"]=$scope.pais["SN"]+c}
        else if(p=='Sierra Leone'){$scope.pais["SL"]=$scope.pais["SL"]+c}
        else if(p=='Kazakhstan'){$scope.pais["KZ"]=$scope.pais["KZ"]+c}
        else if(p=='Saudi Arabia'){$scope.pais["SA"]=$scope.pais["SA"]+c}
        else if(p=='Sweden'){$scope.pais["SE"]=$scope.pais["SE"]+c}
        else if(p=='Sudan'){$scope.pais["SD"]=$scope.pais["SD"]+c}
        else if(p=='Dominican Rep.'){$scope.pais["DO"]=$scope.pais["DO"]+c}
        else if(p=='Djibouti'){$scope.pais["DJ"]=$scope.pais["DJ"]+c}
        else if(p=='Denmark'){$scope.pais["DK"]=$scope.pais["DK"]+c}
        else if(p=='Germany'){$scope.pais["DE"]=$scope.pais["DE"]+c}
        else if(p=='Yemen'){$scope.pais["YE"]=$scope.pais["YE"]+c}
        else if(p=='Algeria'){$scope.pais["DZ"]=$scope.pais["DZ"]+c}
        else if(p=='USA'){$scope.pais["US"]=$scope.pais["US"]+c}
        else if(p=='Uruguay'){$scope.pais["UY"]=$scope.pais["UY"]+c}
        else if(p=='Lebanon'){$scope.pais["LB"]=$scope.pais["LB"]+c}
        else if(p=='Lao PDR'){$scope.pais["LA"]=$scope.pais["LA"]+c}
        else if(p=='Taiwan'){$scope.pais["TW"]=$scope.pais["TW"]+c}
        else if(p=='Trinidad and Tobago'){$scope.pais["TT"]=$scope.pais["TT"]+c}
        else if(p=='Turkey'){$scope.pais["TR"]=$scope.pais["TR"]+c}
        else if(p=='Sri Lanka'){$scope.pais["LK"]=$scope.pais["LK"]+c}
        else if(p=='Latvia'){$scope.pais["LV"]=$scope.pais["LV"]+c}
        else if(p=='Lithuania'){$scope.pais["LT"]=$scope.pais["LT"]+c}
        else if(p=='Luxembourg'){$scope.pais["LU"]=$scope.pais["LU"]+c}
        else if(p=='Liberia'){$scope.pais["LR"]=$scope.pais["LR"]+c}
        else if(p=='Lesotho'){$scope.pais["LS"]=$scope.pais["LS"]+c}
        else if(p=='Thailand'){$scope.pais["TH"]=$scope.pais["TH"]+c}
        else if(p=='Fr. S. Antarctic Lands'){$scope.pais["TF"]=$scope.pais["TF"]+c}
        else if(p=='Togo'){$scope.pais["TG"]=$scope.pais["TG"]+c}
        else if(p=='Chad'){$scope.pais["TD"]=$scope.pais["TD"]+c}
        else if(p=='Libya'){$scope.pais["LY"]=$scope.pais["LY"]+c}
        else if(p=='United Arab Emirates'){$scope.pais["AE"]=$scope.pais["AE"]+c}
        else if(p=='Venezuela'){$scope.pais["VE"]=$scope.pais["VE"]+c}
        else if(p=='Afghanistan'){$scope.pais["AF"]=$scope.pais["AF"]+c}
        else if(p=='Iraq'){$scope.pais["IQ"]=$scope.pais["IQ"]+c}
        else if(p=='Iceland'){$scope.pais["IS"]=$scope.pais["IS"]+c}
        else if(p=='Iran'){$scope.pais["IR"]=$scope.pais["IR"]+c}
        else if(p=='Armenia'){$scope.pais["AM"]=$scope.pais["AM"]+c}
        else if(p=='Albania'){$scope.pais["AL"]=$scope.pais["AL"]+c}
        else if(p=='Angola'){$scope.pais["AO"]=$scope.pais["AO"]+c}
        else if(p=='Argentina'){$scope.pais["AR"]=$scope.pais["AR"]+c}
        else if(p=='Australia'){$scope.pais["AU"]=$scope.pais["AU"]+c}
        else if(p=='Austria'){$scope.pais["AT"]=$scope.pais["AT"]+c}
        else if(p=='India'){$scope.pais["IN"]=$scope.pais["IN"]+c}
        else if(p=='Tanzania'){$scope.pais["TZ"]=$scope.pais["TZ"]+c}
        else if(p=='Azerbaijan'){$scope.pais["AZ"]=$scope.pais["AZ"]+c}
        else if(p=='Ireland'){$scope.pais["IE"]=$scope.pais["IE"]+c}
        else if(p=='Indonesia'){$scope.pais["ID"]=$scope.pais["ID"]+c}
        else if(p=='Ukraine'){$scope.pais["UA"]=$scope.pais["UA"]+c}
        else if(p=='Qatar'){$scope.pais["QA"]=$scope.pais["QA"]+c}
        else if(p=='Mozambique'){$scope.pais["MZ"]=$scope.pais["MZ"]+c}
        
      };
      
}]);