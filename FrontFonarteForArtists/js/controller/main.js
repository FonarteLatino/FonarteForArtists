app.controller("main",['$scope','$rootScope','$http','$window','$location',function($scope,$rootScope,$http,$window,$location){
  $scope.usr="Si";
  var token='';
  $scope.gdpData = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
  $scope.gdpData1M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
  $scope.gdpData3M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
  $scope.gdpData6M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
  var pa = ["BD","BE","BF","BG","BA","BN","BO","JP","BI","BJ","BT","JM","BW","BR","BS","BY","BZ","RU","RW","RS","TL","TM","TJ","RO","GW","GT","GR","GQ","GY","GE","GB","GA","GN","GM","GL","GH","OM","TN","JO","HR","HT","HU","HN","PR","PS","PT","PY","PA","PG","PE","PK","PH","PL","ZM","EH","EE","EG","ZA","EC","IT","VN","SB","ET","SO","ZW","ES","ER","ME","MD","MG","MA","UZ","MM","ML","MN","MK","MW","MR","UG","MY","MX","IL","FR","XS","FI","FJ","FK","NI","NL","NO","NA","VU","NC","NE","NG","NZ","NP","XK","CI","CH","CO","CN","CM","CL","XC","CA","CG","CF","CD","CZ","CY","CR","CU","SZ","SY","KG","KE","SS","SR","KH","SV","SK","KR","SI","KP","KW","SN","SL","KZ","SA","SE","SD","DO","DJ","DK","DE","YE","DZ","US","UY","LB","LA","TW","TT","TR","LK","LV","LT","LU","LR","LS","TH","TF","TG","TD","LY","AE","VE","AF","IQ","IS","IR","AM","AL","AO","AR","AU","AT","IN","TZ","AZ","IE","ID","UA","QA","MZ"];
  $scope.pais1M = $scope.gdpData1M;
  $scope.pais3M = $scope.gdpData3M;
  $scope.pais6M = $scope.gdpData6M;
  $scope.pais = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
  $scope.dato = {
    selectedOption: {valor:'3',texto:'Todo el año'},
    model: null,
    availableOptions: [
      {valor:'0',texto:'Este més'},{valor:'1',texto:'3 meses'},{valor:'2',texto:'6 meses'},{valor:'3',texto:'Todo el año'}
    ]
  };
  $scope.dd1M = [];
  $scope.dd3M = [];
  $scope.dd6M = [];
  $scope.dd = [];
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
  $scope.periodo = [0,0,0,1];
  $scope.fee = "";
  
  $scope.imp = function(){
    $scope.periodo[0] = 0;
    $scope.periodo[1] = 0;
    $scope.periodo[2] = 0;
    $scope.periodo[3] = 0;
    //console.log($scope.dato.selectedOption.valor);
    $scope.periodo[$scope.dato.selectedOption.valor] = 1;
    //console.log($scope.periodo);
    datos();
  };

  var resta = 1000 * 60 * 60 * 24;
  var calculo;
  var fechas = [];
  var fe1 = '';
  var fe3 = '';
  var fe6 = '';
  var fe = '';
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

  var mapa1 = function(){
    pa.forEach(element => {
      $scope.gdpData1M[element] = $scope.pais1M[element];       
    });
    $('#world-map1M').vectorMap({
      map: 'world_mill',
      series: {
        regions: [{
          values: $scope.gdpData1M,
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionTipShow: function(e, el, code){
        el.html(el.html()+' '+$scope.gdpData1M[code]+' Escuchas');
      }
    });
  };

  var mapa3 = function(){
    pa.forEach(element => {
      $scope.gdpData3M[element] = $scope.pais3M[element];
    });
    $('#world-map3M').vectorMap({
      map: 'world_mill',
      series: {
        regions: [{
          values: $scope.gdpData3M,
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionTipShow: function(e, el, code){
        el.html(el.html()+' '+$scope.gdpData3M[code]+' Escuchas');
      }
    });    
  };

  var mapa6 = function(){
    pa.forEach(element => {
      $scope.gdpData6M[element] = $scope.pais6M[element];
    });
    $('#world-map6M').vectorMap({
      map: 'world_mill',
      series: {
        regions: [{
          values: $scope.gdpData6M,
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionTipShow: function(e, el, code){
        el.html(el.html()+' '+$scope.gdpData6M[code]+' Escuchas');
      }
    });
  };

  var init = function() {
    let m = -1;
    let a = 0;
    let f = '';
    //console.log(now);
    calculo = now.getTime() - (resta * (29*2));
    let fecha = new Date(calculo);
    $scope.fee = now.getFullYear;
    //console.log(fecha);
    let am;
    let ay;
    for (let index = 0; index < 12; index++) {
      //console.log('-----------------------------------------');
      am = fecha.getMonth()-(index+m);
      ay = fecha.getFullYear()-a;
      //console.log(am);
      //console.log(ay);
      if (index == 0) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          fe1 = fe1 + 'f=' + ay +'-'+ am;
          fe3 = fe3 + 'f=' + ay +'-'+ am + '&';
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
          f = ay +'-'+ am ;
        }
        else {
          fe1 = fe1 + 'f=' + ay +'-'+ am;
          fe3 = fe3 + 'f=' + ay +'-'+ am + '&';
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
          f = ay +'-'+ am ;
        }
      }else if (index<2) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          f = ay +'-'+ am ;
          fe3 = fe3 + 'f=' + ay +'-'+ am + '&';
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
        else {
          f = ay +'-'+ am ;
          fe3 = fe3 + 'f=' + ay +'-'+ am + '&';
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
      }else if (index == 2) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          f = ay +'-'+ am ;
          fe3 = fe3 + 'f=' + ay +'-'+ am;
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
        else {
          f = ay +'-'+ am ;
          fe3 = fe3 + 'f=' + ay +'-'+ am;
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
      }else if (index<5) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          f = ay +'-'+ am ;
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
        else {
          f = ay +'-'+ am ;
          fe6 = fe6 + 'f=' + ay +'-'+ am + '&';
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
      }else if (index == 5) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          f = ay +'-'+ am ;
          fe6 = fe6 + 'f=' + ay +'-'+ am;
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
        else {
          f = ay +'-'+ am ;
          fe6 = fe6 + 'f=' + ay +'-'+ am;
          fe = fe + 'f=' + ay +'-'+ am + '&';
        }
      }else if(index<11) {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          fe = fe + 'f=' + ay +'-'+ am + '&';
          f = ay +'-'+ am ;
        }
        else {
          fe = fe + 'f=' + ay +'-'+ am + '&';
          f = ay +'-'+ am ;
        }
      } else {
        if (am == 0) {
          //console.log('es 12');
          m = -13;
          a = 1;
          am = fecha.getMonth()-(index+m);
          ay = fecha.getFullYear()-a;
          fe = fe + 'f=' + ay +'-'+ am;
          f = ay +'-'+ am ;
        }
        else {
          fe = fe + 'f=' + ay +'-'+ am;
          f = ay +'-'+ am ;
        }
      }
      fechas.push(f);
    }
    datos();
    /*console.log(fechas);
    console.log(fe1);
    console.log(fe3);
    console.log(fe6);
    console.log(fe);*/
  };    

  var datos = function() {
    $scope.usr=sessionStorage.getItem('usr');
    token = sessionStorage.getItem('token');
    console.log($scope.usr);
    if ($scope.periodo[0]) {
      //console.log($scope.dd1M);
      //console.log($scope.dd1M.length);
      if ($scope.dd1M.length>0) {
        $scope.pais1M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
        $scope.cancion1M = [];
        $scope.disco1M = [];
        $scope.plataforma1M = [];
        $scope.iTotal1M = 0;
        $scope.etiquetas1M = [];
        $scope.datos1M = [];
        $scope.artista = '';
        let t =1;
        consultar($scope.dd1M,$scope.cancion1M,$scope.disco1M,$scope.plataforma1M,t,$scope.pais1M,$scope.etiquetas1M,$scope.datos1M);
      } else {
        if ($scope.usr == undefined||"") {
          console.log("de regreso");
          $location.path('/');
        }else {
          var req = {
            method : "GET" ,
            url :  "http://localhost:8091/api/regalias/"+$scope.usr+"/fecha/?"+fe1 , 
            headers: {
              'Authorization': "Bearer "+token
            },
            data: {}
          };
          console.log(req);
          $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
            let t = 1;
            $scope.dd1M=response.data;
            consultar(response.data,$scope.cancion1M,$scope.disco1M,$scope.plataforma1M,t,$scope.pais1M,$scope.etiquetas1M,$scope.datos1M);
            mapa1();
          }, function (response) {
            //console.log('El usuario No se encuentra');
            $window.location.href = '#';
          });
        } 
      }
    } else if ($scope.periodo[1]) {
      //console.log($scope.dd3M);
      //console.log($scope.dd3M.length);
      if ($scope.dd3M.length>0) {
        $scope.pais3M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
        $scope.cancion3M = [];
        $scope.disco3M = [];
        $scope.plataforma3M = [];
        $scope.iTotal3M = 0;
        $scope.etiquetas3M = [];
        $scope.datos3M = [];
        $scope.artista = '';
        let t =3;
        consultar($scope.dd3M,$scope.cancion3M,$scope.disco3M,$scope.plataforma3M,t,$scope.pais3M,$scope.etiquetas3M,$scope.datos3M);
      } else {
        if ($scope.usr == undefined||"") {
          console.log("de regreso");
          $location.path('/');
        }else {
          var req = {
            method : "GET" ,
            url :  "http://localhost:8091/api/regalias/"+$scope.usr+"/fecha/?"+fe3 , 
            headers: {
              'Authorization': "Bearer "+token
            },
            data: {}
          };
          console.log(req);
          $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
            let t = 3;
            $scope.dd3M=response.data;
            consultar(response.data,$scope.cancion3M,$scope.disco3M,$scope.plataforma3M,t,$scope.pais3M,$scope.etiquetas3M,$scope.datos3M);
            mapa3();
          }, function (response) {
            //console.log('El usuario No se encuentra');
            $window.location.href = '#';
          });
        } 
      }
    } else if ($scope.periodo[2]) {
      //console.log($scope.dd6M);
      //console.log($scope.dd6M.length);
      if ($scope.dd6M.length>0) {
        $scope.pais6M = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
        $scope.cancion6M = [];
        $scope.disco6M = [];
        $scope.plataforma6M = [];
        $scope.iTotal6M = 0;
        $scope.etiquetas6M = [];
        $scope.datos6M = [];
        $scope.artista = '';
        let t =6;
        consultar($scope.dd6M,$scope.cancion6M,$scope.disco6M,$scope.plataforma6M,t,$scope.pais6M,$scope.etiquetas6M,$scope.datos6M);
      } else {
        if ($scope.usr == undefined||"") {
          console.log("de regreso");
          $location.path('/');
        }else {
          var req = {
            method : "GET" ,
            url :  "http://localhost:8091/api/regalias/"+$scope.usr+"/fecha/?"+fe6 , 
            headers: {
              'Authorization': "Bearer "+token
            },
            data: {}
          };
          console.log(req);
          $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
            let t = 6;
            $scope.dd6M=response.data;
            consultar(response.data,$scope.cancion6M,$scope.disco6M,$scope.plataforma6M,t,$scope.pais6M,$scope.etiquetas6M,$scope.datos6M);
            mapa6();
          }, function (response) {
            //console.log('El usuario No se encuentra');
            $window.location.href = '#';
          });
        } 
      }
    } else if ($scope.periodo[3]) {
      //console.log($scope.dd);
      //console.log($scope.dd.length);
      if ($scope.dd.length>0) {
        $scope.pais = {"BD": 0,"BE": 0,"BF": 0,"BG": 0,"BA": 0,"BN": 0,"BO": 0,"JP": 0,"BI": 0,"BJ": 0,"BT": 0,"JM": 0,"BW": 0,"BR": 0,"BS": 0,"BY": 0,"BZ": 0,"RU": 0,"RW": 0,"RS": 0,"TL": 0,"TM": 0,"TJ": 0,"RO": 0,"GW": 0,"GT": 0,"GR": 0,"GQ": 0,"GY": 0,"GE": 0,"GB": 0,"GA": 0,"GN": 0,"GM": 0,"GL": 0,"GH": 0,"OM": 0,"TN": 0,"JO": 0,"HR": 0,"HT": 0,"HU": 0,"HN": 0,"PR": 0,"PS": 0,"PT": 0,"PY": 0,"PA": 0,"PG": 0,"PE": 0,"PK": 0,"PH": 0,"PL": 0,"ZM": 0,"EH": 0,"EE": 0,"EG": 0,"ZA": 0,"EC": 0,"IT": 0,"VN": 0,"SB": 0,"ET": 0,"SO": 0,"ZW": 0,"ES": 0,"ER": 0,"ME": 0,"MD": 0,"MG": 0,"MA": 0,"UZ": 0,"MM": 0,"ML": 0,"MN": 0,"MK": 0,"MW": 0,"MR": 0,"UG": 0,"MY": 0,"MX": 0,"IL": 0,"FR": 0,"XS": 0,"FI": 0,"FJ": 0,"FK": 0,"NI": 0,"NL": 0,"NO": 0,"NA": 0,"VU": 0,"NC": 0,"NE": 0,"NG": 0,"NZ": 0,"NP": 0,"XK": 0,"CI": 0,"CH": 0,"CO": 0,"CN": 0,"CM": 0,"CL": 0,"XC": 0,"CA": 0,"CG": 0,"CF": 0,"CD": 0,"CZ": 0,"CY": 0,"CR": 0,"CU": 0,"SZ": 0,"SY": 0,"KG": 0,"KE": 0,"SS": 0,"SR": 0,"KH": 0,"SV": 0,"SK": 0,"KR": 0,"SI": 0,"KP": 0,"KW": 0,"SN": 0,"SL": 0,"KZ": 0,"SA": 0,"SE": 0,"SD": 0,"DO": 0,"DJ": 0,"DK": 0,"DE": 0,"YE": 0,"DZ": 0,"US": 0,"UY": 0,"LB": 0,"LA": 0,"TW": 0,"TT": 0,"TR": 0,"LK": 0,"LV": 0,"LT": 0,"LU": 0,"LR": 0,"LS": 0,"TH": 0,"TF": 0,"TG": 0,"TD": 0,"LY": 0,"AE": 0,"VE": 0,"AF": 0,"IQ": 0,"IS": 0,"IR": 0,"AM": 0,"AL": 0,"AO": 0,"AR": 0,"AU": 0,"AT": 0,"IN": 0,"TZ": 0,"AZ": 0,"IE": 0,"ID": 0,"UA": 0,"QA": 0,"MZ": 0};
        $scope.cancion = [];
        $scope.disco = [];
        $scope.plataforma = [];
        $scope.iTotal = 0;
        $scope.etiquetas = [];
        $scope.datos = [];
        $scope.artista = '';
        let t =9;
        consultar($scope.dd,$scope.cancion,$scope.disco,$scope.plataforma,t,$scope.pais,$scope.etiquetas,$scope.datos);
      } else {
        if ($scope.usr == undefined||"") {
          console.log("de regreso");
          $location.path('/');
        }else {
          var req = {
            method : "GET" ,
            url :  "http://localhost:8091/api/regalias/"+$scope.usr , 
            headers: {
              'Authorization': "Bearer "+token
            },
            data: {}
          };
          console.log(req);
          $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
            let t = 9;
            $scope.dd=response.data;
            consultar(response.data,$scope.cancion,$scope.disco,$scope.plataforma,t,$scope.pais,$scope.etiquetas,$scope.datos);
            mapa();
          }, function (response) {
            //console.log('El usuario No se encuentra');
            $window.location.href = '#';
          });
        }        
      }
    }
  };

  init();
      
  var consultar = function(reg,c,d,p,ti,pa,e,da){
    let t = 0; 
    console.log(reg);
    if (reg.length > 0) {
      //console.log(reg);
      reg.forEach(element => {
        listas(element,c,d,p);
        t = t + (element.ingresos * 0.65);
        pais(element,pa);
      });
      $scope.artista = reg[0].nombreArtista;
      //console.log(t);
      if (ti == 1) {
        //console.log("si 1");
        $scope.iTotal1M = t;
      }else if(ti == 3) {
        //console.log("si 3");
        $scope.iTotal3M = t;
      }else if (ti == 6) {
        //console.log("si 6");
        $scope.iTotal6M = t;
      }else {
        //console.log("si");
        $scope.iTotal = t;
      }
      pastel(p,e,da);
      p = p.sort(((a, b) => b.clics - a.clics));
      //console.table(p);
    }else {
      //console.log('El usuario No se encuentra');  
      $window.location.href = '#';
    }
  };

  var pastel = function(p,e,d) {
    let aux = p.sort(((a, b) => b.ingresos - a.ingresos));
    //console.table(p);
    aux.forEach(element => {
      e.push(element.plataforma);
      d.push(Number.parseFloat(element.ingresos).toFixed(2));
    });
  }
      
  var listas = function(e1,cancion,disco,plataforma) {
    //console.log(e1);
    let ax1 = cancion
    let ax2 = disco
    let ax3 = plataforma
    let c1 = {
      "nombreCancion":e1.nombreCancion,
      "clics":e1.clics
    };
    let c2 = {
      "nombreDisco":e1.nombreDisco,
      "clics":e1.clics
    };
    let c3 = {
      "plataforma":e1.plataforma,
      "clics":e1.clics,
      "ingresos": (e1.ingresos * 0.65)
    };
    let a1 = ax1.find(nombre => nombre.nombreCancion === c1.nombreCancion);
    let a2 = ax2.find(nombre => nombre.nombreDisco === c2.nombreDisco);
    let a3 = ax3.find(nombre => nombre.plataforma === c3.plataforma);
    if (a1 == undefined){
      cancion.push(c1);
    } else{
      a1.clics = a1.clics + c1.clics;
    }

    if (a2 == undefined){
      disco.push(c2);
    } else{
      a2.clics = a2.clics + c2.clics;
    }

    if (a3 == undefined){
      plataforma.push(c3);
    } else{
      a3.clics = a3.clics + c3.clics;
      a3.ingresos = a3.ingresos + c3.ingresos;
    }
    //console.log($scope.plataforma);
  };

  var m_pais = function(p,c,s){
    /*console.log(p);
    console.log(s);
    console.log(c);
    console.log(s[p]);*/
    if (!s[p]) {
      //console.log("No existe")
      s[p] = c;
    } else {
      s[p] = s[p] + c
    }
  };

  var pais = function(e,s){
    /*console.log(e);
    //console.log(s);*/
    let p = e.pais;
    let c = e.clics;
        
    if(p== 'Bangladesh'){m_pais("BD",e.clics,s)}
    else if(p=='Belgium'){m_pais("BE",e.clics,s)}
    else if(p=='Burkina Faso'){m_pais("BF",e.clics,s)}
    else if(p=='Bulgaria'){m_pais("BG",e.clics,s)}
    else if(p=='Bosnia and Herz.'){m_pais("BA",e.clics,s)}
    else if(p=='Brunei'){m_pais("BN",e.clics,s)}
    else if(p=='Bolivia'){m_pais("BO",e.clics,s)}
    else if(p=='Japan'){m_pais("JP",e.clics,s)}
    else if(p=='Burundi'){m_pais("BI",e.clics,s)}
    else if(p=='Benin'){m_pais("BJ",e.clics,s)}
    else if(p=='Bhutan'){m_pais("BT",e.clics,s)}
    else if(p=='Jamaica'){m_pais("JM",e.clics,s)}
    else if(p=='Botswana'){m_pais("BW",e.clics,s)}
    else if(p=='Brazil'){m_pais("BR",e.clics,s)}
    else if(p=='Bahamas'){m_pais("BS",e.clics,s)}
    else if(p=='Belarus'){m_pais("BY",e.clics,s)}
    else if(p=='Belize'){m_pais("BZ",e.clics,s)}
    else if(p=='Russia'){m_pais("RU",e.clics,s)}
    else if(p=='Rwanda'){m_pais("RW",e.clics,s)}
    else if(p=='Serbia'){m_pais("RS",e.clics,s)}
    else if(p=='Timor-Leste'){m_pais("TL",e.clics,s)}
    else if(p=='Turkmenistan'){m_pais("TM",e.clics,s)}
    else if(p=='Tajikistan'){m_pais("TJ",e.clics,s)}
    else if(p=='Romania'){m_pais("RO",e.clics,s)}
    else if(p=='Guinea-Bissau'){m_pais("GW",e.clics,s)}
    else if(p=='Guatemala'){m_pais("GT",e.clics,s)}
    else if(p=='Greece'){m_pais("GR",e.clics,s)}
    else if(p=='Eq. Guinea'){m_pais("GQ",e.clics,s)}
    else if(p=='Guyana'){m_pais("GY",e.clics,s)}
    else if(p=='Georgia'){m_pais("GE",e.clics,s)}
    else if(p=='United Kingdom'){m_pais("GB",e.clics,s)}
    else if(p=='Gabon'){m_pais("GA",e.clics,s)}
    else if(p=='Guinea'){m_pais("GN",e.clics,s)}
    else if(p=='Gambia'){m_pais("GM",e.clics,s)}
    else if(p=='Greenland'){m_pais("GL",e.clics,s)}
    else if(p=='Ghana'){m_pais("GH",e.clics,s)}
    else if(p=='Oman'){m_pais("OM",e.clics,s)}
    else if(p=='Tunisia'){m_pais("TN",e.clics,s)}
    else if(p=='Jordan'){m_pais("JO",e.clics,s)}
    else if(p=='Croatia'){m_pais("HR",e.clics,s)}
    else if(p=='Haiti'){m_pais("HT",e.clics,s)}
    else if(p=='Hungary'){m_pais("HU",e.clics,s)}
    else if(p=='Honduras'){m_pais("HN",e.clics,s)}
    else if(p=='Puerto Rico'){m_pais("PR",e.clics,s)}
    else if(p=='Palestine'){m_pais("PS",e.clics,s)}
    else if(p=='Portugal'){m_pais("PT",e.clics,s)}
    else if(p=='Paraguay'){m_pais("PY",e.clics,s)}
    else if(p=='Panama'){m_pais("PA",e.clics,s)}
    else if(p=='Papua New Guinea'){m_pais("PG",e.clics,s)}
    else if(p=='Peru'){m_pais("PE",e.clics,s)}
    else if(p=='Pakistan'){m_pais("PK",e.clics,s)}
    else if(p=='Philippines'){m_pais("PH",e.clics,s)}
    else if(p=='Poland'){m_pais("PL",e.clics,s)}
    else if(p=='Zambia'){m_pais("ZM",e.clics,s)}
    else if(p=='W. Sahara'){m_pais("EH",e.clics,s)}
    else if(p=='Estonia'){m_pais("EE",e.clics,s)}
    else if(p=='Egypt'){m_pais("EG",e.clics,s)}
    else if(p=='South Africa'){m_pais("ZA",e.clics,s)}
    else if(p=='Ecuador'){m_pais("EC",e.clics,s)}
    else if(p=='Italy'){m_pais("IT",e.clics,s)}
    else if(p=='Vietnam'){m_pais("VN",e.clics,s)}
    else if(p=='Solomon Is.'){m_pais("SB",e.clics,s)}
    else if(p=='Ethiopia'){m_pais("ET",e.clics,s)}
    else if(p=='Somalia'){m_pais("SO",e.clics,s)}
    else if(p=='Zimbabwe'){m_pais("ZW",e.clics,s)}
    else if(p=='Spain'){m_pais("ES",e.clics,s)}
    else if(p=='Eritrea'){m_pais("ER",e.clics,s)}
    else if(p=='Montenegro'){m_pais("ME",e.clics,s)}
    else if(p=='Moldova'){m_pais("MD",e.clics,s)}
    else if(p=='Madagascar'){m_pais("MG",e.clics,s)}
    else if(p=='Morocco'){m_pais("MA",e.clics,s)}
    else if(p=='Uzbekistan'){m_pais("UZ",e.clics,s)}
    else if(p=='Myanmar'){m_pais("MM",e.clics,s)}
    else if(p=='Mali'){m_pais("ML",e.clics,s)}
    else if(p=='Mongolia'){m_pais("MN",e.clics,s)}
    else if(p=='Macedonia'){m_pais("MK",e.clics,s)}
    else if(p=='Malawi'){m_pais("MW",e.clics,s)}
    else if(p=='Mauritania'){m_pais("MR",e.clics,s)}
    else if(p=='Uganda'){m_pais("UG",e.clics,s)}
    else if(p=='Malaysia'){m_pais("MY",e.clics,s)}
    else if(p=='Mexico'){m_pais("MX",e.clics,s)}
    else if(p=='Israel'){m_pais("IL",e.clics,s)}
    else if(p=='France'){m_pais("FR",e.clics,s)}
    else if(p=='Somaliland'){m_pais("XS",e.clics,s)}
    else if(p=='Finland'){m_pais("FI",e.clics,s)}
    else if(p=='Fiji'){m_pais("FJ",e.clics,s)}
    else if(p=='Falkland Is.'){m_pais("FK",e.clics,s)}
    else if(p=='Nicaragua'){m_pais("NI",e.clics,s)}
    else if(p=='Netherlands'){m_pais("NL",e.clics,s)}
    else if(p=='Norway'){m_pais("NO",e.clics,s)}
    else if(p=='Namibia'){m_pais("NA",e.clics,s)}
    else if(p=='Vanuatu'){m_pais("VU",e.clics,s)}
    else if(p=='New Caledonia'){m_pais("NC",e.clics,s)}
    else if(p=='Niger'){m_pais("NE",e.clics,s)}
    else if(p=='Nigeria'){m_pais("NG",e.clics,s)}
    else if(p=='New Zealand'){m_pais("NZ",e.clics,s)}
    else if(p=='Nepal'){m_pais("NP",e.clics,s)}
    else if(p=='Kosovo'){m_pais("XK",e.clics,s)}
    else if(p=='Côte d\'Ivoire'){m_pais("CI",e.clics,s)}
    else if(p=='Switzerland'){m_pais("CH",e.clics,s)}
    else if(p=='Colombia'){m_pais("CO",e.clics,s)}
    else if(p=='China'){m_pais("CN",e.clics,s)}
    else if(p=='Cameroon'){m_pais("CM",e.clics,s)}
    else if(p=='Chile'){m_pais("CL",e.clics,s)}
    else if(p=='N. Cyprus'){m_pais("XC",e.clics,s)}
    else if(p=='Canada'){m_pais("CA",e.clics,s)}
    else if(p=='Congo'){m_pais("CG",e.clics,s)}
    else if(p=='Central African Rep.'){m_pais("CF",e.clics,s)}
    else if(p=='Dem. Rep. Congo'){m_pais("CD",e.clics,s)}
    else if(p=='Czech Rep.'){m_pais("CZ",e.clics,s)}
    else if(p=='Cyprus'){m_pais("CY",e.clics,s)}
    else if(p=='Costa Rica'){m_pais("CR",e.clics,s)}
    else if(p=='Cuba'){m_pais("CU",e.clics,s)}
    else if(p=='Swaziland'){m_pais("SZ",e.clics,s)}
    else if(p=='Syria'){m_pais("SY",e.clics,s)}
    else if(p=='Kyrgyzstan'){m_pais("KG",e.clics,s)}
    else if(p=='Kenya'){m_pais("KE",e.clics,s)}
    else if(p=='S. Sudan'){m_pais("SS",e.clics,s)}
    else if(p=='Suriname'){m_pais("SR",e.clics,s)}
    else if(p=='Cambodia'){m_pais("KH",e.clics,s)}
    else if(p=='El Salvador'){m_pais("SV",e.clics,s)}
    else if(p=='Slovakia'){m_pais("SK",e.clics,s)}
    else if(p=='Korea'){m_pais("KR",e.clics,s)}
    else if(p=='Slovenia'){m_pais("SI",e.clics,s)}
    else if(p=='Dem. Rep. Korea'){m_pais("KP",e.clics,s)}
    else if(p=='Kuwait'){m_pais("KW",e.clics,s)}
    else if(p=='Senegal'){m_pais("SN",e.clics,s)}
    else if(p=='Sierra Leone'){m_pais("SL",e.clics,s)}
    else if(p=='Kazakhstan'){m_pais("KZ",e.clics,s)}
    else if(p=='Saudi Arabia'){m_pais("SA",e.clics,s)}
    else if(p=='Sweden'){m_pais("SE",e.clics,s)}
    else if(p=='Sudan'){m_pais("SD",e.clics,s)}
    else if(p=='Dominican Rep.'){m_pais("DO",e.clics,s)}
    else if(p=='Djibouti'){m_pais("DJ",e.clics,s)}
    else if(p=='Denmark'){m_pais("DK",e.clics,s)}
    else if(p=='Germany'){m_pais("DE",e.clics,s)}
    else if(p=='Yemen'){m_pais("YE",e.clics,s)}
    else if(p=='Algeria'){m_pais("DZ",e.clics,s)}
    else if(p=='USA'){m_pais("US",e.clics,s)}
    else if(p=='Uruguay'){m_pais("UY",e.clics,s)}
    else if(p=='Lebanon'){m_pais("LB",e.clics,s)}
    else if(p=='Lao PDR'){m_pais("LA",e.clics,s)}
    else if(p=='Taiwan'){m_pais("TW",e.clics,s)}
    else if(p=='Trinidad and Tobago'){m_pais("TT",e.clics,s)}
    else if(p=='Turkey'){m_pais("TR",e.clics,s)}
    else if(p=='Sri Lanka'){m_pais("LK",e.clics,s)}
    else if(p=='Latvia'){m_pais("LV",e.clics,s)}
    else if(p=='Lithuania'){m_pais("LT",e.clics,s)}
    else if(p=='Luxembourg'){m_pais("LU",e.clics,s)}
    else if(p=='Liberia'){m_pais("LR",e.clics,s)}
    else if(p=='Lesotho'){m_pais("LS",e.clics,s)}
    else if(p=='Thailand'){m_pais("TH",e.clics,s)}
    else if(p=='Fr. S. Antarctic Lands'){m_pais("TF",e.clics,s)}
    else if(p=='Togo'){m_pais("TG",e.clics,s)}
    else if(p=='Chad'){m_pais("TD",e.clics,s)}
    else if(p=='Libya'){m_pais("LY",e.clics,s)}
    else if(p=='United Arab Emirates'){m_pais("AE",e.clics,s)}
    else if(p=='Venezuela'){m_pais("VE",e.clics,s)}
    else if(p=='Afghanistan'){m_pais("AF",e.clics,s)}
    else if(p=='Iraq'){m_pais("IQ",e.clics,s)}
    else if(p=='Iceland'){m_pais("IS",e.clics,s)}
    else if(p=='Iran'){m_pais("IR",e.clics,s)}
    else if(p=='Armenia'){m_pais("AM",e.clics,s)}
    else if(p=='Albania'){m_pais("AL",e.clics,s)}
    else if(p=='Angola'){m_pais("AO",e.clics,s)}
    else if(p=='Argentina'){m_pais("AR",e.clics,s)}
    else if(p=='Australia'){m_pais("AU",e.clics,s)}
    else if(p=='Austria'){m_pais("AT",e.clics,s)}
    else if(p=='India'){m_pais("IN",e.clics,s)}
    else if(p=='Tanzania'){m_pais("TZ",e.clics,s)}
    else if(p=='Azerbaijan'){m_pais("AZ",e.clics,s)}
    else if(p=='Ireland'){m_pais("IE",e.clics,s)}
    else if(p=='Indonesia'){m_pais("ID",e.clics,s)}
    else if(p=='Ukraine'){m_pais("UA",e.clics,s)}
    else if(p=='Qatar'){m_pais("QA",e.clics,s)}
    else if(p=='Mozambique'){m_pais("MZ",e.clics,s)}
  };      
}]);