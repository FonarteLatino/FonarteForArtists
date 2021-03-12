app.controller("main",['$scope','$rootScope','$http','$window','$location',function($scope,$rootScope,$http,$window,$location){
    $scope.usr="Si";
    var init = function() {
        $scope.usr="No";
        console.log($rootScope.usr);

        if ($rootScope.usr == undefined||"") {
            console.log("indefinido");
            $location.path('/');
            console.log('Claro que no hay');
         }else {
            console.log($rootScope.usr);
            $scope.usr = $rootScope.usr;
            var req = {
                method : "GET" ,
                url :  "http://localhost:8091/api/regalias/"+$scope.usr , 
                data: {}
              };
              console.log(req);
              $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
                console.log(response);
                console.log(response.data.length);
                console.log(response.data);
                //console.log(response.data[0].usr);
                
                /*if (response.data.length > 0) {
                  console.log(response.data[0].usr);
                  $rootScope.usr=response.data[0].usr;
                  console.log($rootScope.usr);
                  console.log($location.path())
                  $location.path('/main');
                }else {
                  console.log('El usuario No se encuentra');  
                  $window.location.href = '#';
                }*/
    
              }, function (response) {
                console.log('El usuario No se encuentra');
                $window.location.href = '#';
              });
         }

        /*if (!$scope.user.seccion) {
          //console.log("no existe");
          $scope.user.seccion = document.getElementById("seccion").value;
        }
        $scope.mapa = [];
        var req = {
          method : "POST" ,
          url :  "http://sonparamilo.jonathanarc.net/apirest/busqueda/lugaresArea" , 
          data: {
            area: $scope.user.seccion
          }
        };
        //console.log(req);
        $http(req).success(function (response) {//'response' es el objeto que devuelve el servicio web
          ////console.log(response);
          $scope.mapa = response;
          ////console.log($scope.mapa);
          $scope.user.seccion = document.getElementById("seccion").value;
          //console.log($scope.user.seccion);
          mapa();

        }).error(function (response){
          //console.log(response);
          alert("Ha fallado la petici\u00F3n. Estado HTTP:"+status);
        });*/
        
        
      };
      

      init();

      $scope.usr = "";
      
      $scope.consultar = function(){
          console.log("Holiiiiii");
          console.log($scope.usr)
          
          var req = {
              method : "GET" ,
              url :  "http://localhost:8091/api/sello/"+$scope.usr , 
              data: {}
            };
            console.log(req);
            $http(req).then(function (response) {//'response' es el objeto que devuelve el servicio web
              console.log(response);
              console.log(response.data.length);
              console.log(response.data[0]);
              //console.log(response.data[0].usr);
              
              if (response.data.length > 0) {
                console.log(response.data[0].usr);
                $rootScope.usr=response.data[0].usr;
                console.log($rootScope.usr);
                console.log($location.path())
                $location.path('/main');
              }else {
                console.log('El usuario No se encuentra');  
                $window.location.href = '#';
              }
  
            }, function (response) {
              console.log('El usuario No se encuentra');
              $window.location.href = '#';
            });
      };
}]);