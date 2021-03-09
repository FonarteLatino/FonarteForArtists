var app = angular.module("FonarteForArtists",['ngRoute']);
app.config(function($routeProvider) {
   $routeProvider
   .when('/login' ,{templateUrl: './views/login.html', controller: ''})
   //.when('/inicio' ,{templateUrl: './views/stats.html', controller: ''})
   /*.when('/GastronomoB' ,{templateUrl: './views/GastronomoB.html', controller: 'formulario'})
   .when('/GastronomoC' ,{templateUrl: './views/GastronomoC.html', controller: 'formulario'})
   .when('/GastronomoD' ,{templateUrl: './views/GastronomoD.html', controller: 'formulario'})
   .when('/GastronomoE' ,{templateUrl: './views/GastronomoE.html', controller: 'formulario'})
   .when('/Artesano' ,{templateUrl: './views/Artesano.html', controller: 'formulario'})
   .when('/Fin' ,{templateUrl: './views/fin.html', controller: ''})*/
   .otherwise({redirectTo: '/login'});
});
app.controller("primero", ['$scope','$rootScope','$http',function($scope,$rootScope,$http){
   console.log($rootScope.usr);
   if ($rootScope.usr == undefined||"") {
      console.log("indefinido");
      
   }
	//$scope.nombre = "Oto";
   //$scope.categoria = $rootScope.categoria;
   ////console.log($rootScope.folio);
   //$scope.folio = $rootScope.folio;
}]);

