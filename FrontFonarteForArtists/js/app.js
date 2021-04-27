var app = angular.module("FonarteForArtists",['ngRoute','chart.js']);
app.config(function($routeProvider) {
   $routeProvider
   .when('/' ,{templateUrl: './views/login.html', controller: ''})
   .when('/main' ,{templateUrl: './views/stats.html', controller: 'main'})
   /*.when('/GastronomoB' ,{templateUrl: './views/GastronomoB.html', controller: 'formulario'})
   .when('/GastronomoC' ,{templateUrl: './views/GastronomoC.html', controller: 'formulario'})
   .when('/GastronomoD' ,{templateUrl: './views/GastronomoD.html', controller: 'formulario'})
   .when('/GastronomoE' ,{templateUrl: './views/GastronomoE.html', controller: 'formulario'})
   .when('/Artesano' ,{templateUrl: './views/Artesano.html', controller: 'formulario'})
   .when('/Fin' ,{templateUrl: './views/fin.html', controller: ''})*/
   .otherwise({redirectTo: '/'});
});
app.controller("primero", ['$scope','$rootScope','$http','$location',function($scope,$rootScope,$http,$location){
   
   //$rootScope.usr = 'Diego';
   //console.log($rootScope.usr);
   //sessionStorage.clear();
   let token = sessionStorage.getItem('token');
   console.log(token);
   /*sessionStorage.setItem('token', 'Miguel Antonio')
   token = sessionStorage.getItem('token');*/
   
   if (token === null) {
      console.log("no existe el token");
      $location.path('/');
      
   }else {
      console.log("Si tenemos token");
      console.log(token);
      $location.path('/main');
   }
}]);

