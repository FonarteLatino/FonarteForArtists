var app = angular.module("FonarteForArtists",['ngRoute']);
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
   
   $rootScope.usr = 'Sonalli';
   console.log($rootScope.usr);
   if ($rootScope.usr == undefined||"") {
      console.log("indefinido");
      $location.path('/');
      console.log('Claro');
   }else {
      console.log($rootScope.usr);
      $location.path('/main');
   }
	//$scope.nombre = "Oto";
   //$scope.categoria = $rootScope.categoria;
   ////console.log($rootScope.folio);
   //$scope.folio = $rootScope.folio;
}]);

