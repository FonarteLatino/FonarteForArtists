app.controller("formulario",['$scope','$rootScope','$http','$window','$location',function($scope,$rootScope,$http,$window,$location){
  $rootScope.usr = "";
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

    /*var mapa = function(){
      //console.log($scope.mapa);
      angular.forEach($scope.mapa,function(lugar) {
        ////console.log(lugar);
        if (lugar.categoria == null) {
          $scope.botonesLugar[lugar.id.replace($scope.user.seccion, "")]=true;
        }
        else
        {
          $scope.botonesLugar[lugar.id.replace($scope.user.seccion, "")]=false;
        }
        $scope.lugaresPrecio[lugar.id.replace($scope.user.seccion, "")]=lugar.precio;
        $scope.categoria[lugar.id.replace($scope.user.seccion, "")]=false;
        $scope.categoriaNom[lugar.id.replace($scope.user.seccion, "")]=lugar.categoria;
        //console.log(lugar.id.replace($scope.user.seccion, ""));
        //console.log($scope.botonesLugar);
        //console.log($scope.lugaresPrecio);
        //console.log($scope.categoria);
      });
      //$scope.categoriaNom[1] = "Gastronomia Huasteca";
    };

    var init = function() {
      if (!$scope.user.seccion) {
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
      });
      
      
    };
    

    init();

    $scope.categoriaF = function() {
      //console.log($scope.user.categoriaProd);
      //console.log($scope.categoriaNom);
      for (var i = 0; i < $scope.categoriaNom.length; i++) {
        if ($scope.categoriaNom[i] == $scope.user.categoriaProd) 
        {
          //console.log("si es");
          $scope.categoria[i] = true;
        }
        else
        {
          $scope.categoria[i] = false;
        }
      }
      //console.log($scope.categoria);
    };

    $scope.update = function() {
      if (!$scope.tanque)
      {
        $scope.tanque = " "
      }
      $scope.user.comentario = $scope.tanque + " " + $scope.user.comentario;
      if ($scope.user.seccion == "AA") {
        $scope.user.categoria = "Artesano";
      }
      else if ($scope.user.seccion[0] == "G") {
        $scope.user.categoria = "Gastronomo";
      }
      $scope.user.telefono = $scope.cel + " / " + $scope.tel;
      //console.log($scope.user);
      if (!$scope.user.otrosProd) 
      {
        //console.log("no definido");
        $scope.user.otrosProd = " ";
      }
      if (!$scope.user.correo) 
      {
        //console.log("correo no");
        $scope.user.correo = " ";
      }
      var req = {
        method : "POST" ,
        url :  "http://sonparamilo.jonathanarc.net/apirest/altaParticipante" , 
        data: {
          apmaterno : $scope.user.apmaterno,
          appaterno : $scope.user.appaterno,
          categoria : $scope.user.categoria,
          categoriaProd : $scope.user.categoriaProd,
          comentario : $scope.user.comentario,
          correo : $scope.user.correo,
          estado : $scope.user.estado,
          lugar : $scope.user.lugar,
          nombre : $scope.user.nombre,
          otrosProd : $scope.user.otrosProd,
          producDesc : $scope.user.productoDescip,
          productoPrin : $scope.user.productoPrin,
          seccion : $scope.user.seccion,
          telefono : $scope.user.telefono
        }
      };
      //console.log(req);

      $http(req).success(function (response) {//'response' es el objeto que devuelve el servicio web
        //console.log(response);
        //console.log(response.folio);
        $scope.folio = response;
        //console.log($scope.folio);
        $rootScope.folio = $scope.folio;
        //console.log($rootScope.folio);
        alert("Inscripcion Completa!");
        $window.location.href = '#/Fin';

      }).error(function (response){
        //console.log(response);
        alert("Ha fallado la petici\u00F3n, No se ha podido realizar su inscripcion, intentelo mas tarde. "+response);
        $window.location.href = '#/';
      });
      
    };
    
    $scope.reset = function(form) {
      $scope.user = {};
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    };

    $scope.reset();
    
    $scope.limpiarSel = function() {
      
      for (var j = 0; j < $scope.lugar.length; j++) {
          //console.log($scope.lugar[j].replace($scope.user.seccion, ""));
          
          
        
        $scope.botonesLugar[$scope.lugar[j].replace($scope.user.seccion, "")] = true;
        
      }
      $scope.lugar = [];
      $scope.user.lugar = "";
      $scope.precio = "$";
      $scope.lugars = "";
      ////console.log($rootScope.tel);
      ////console.log($rootScope.cel);
    }

    

    $scope.seleccionaaBoton = function(lug) {
      ////console.log($.grep(lugares, function(e){ return e.index == lug; })['0'][$scope.user.seccion + lug]);
      //console.log(lug);
      //console.log($scope.botonesLugar[lug]);
      if ($scope.botonesLugar[lug]) {
        //console.log("Lugar vacio");
        if (/^A.*$/.test($scope.user.seccion)) {
          var limite = 2;
        }else{
          var limite = 3;
        }
        //console.log(limite);
        if ($scope.lugar.length == 0 ) {
          //console.log($scope.lugar.length);
          //console.log($scope.lugar);
          $scope.lugar.push($scope.user.seccion+lug);
          //console.log($scope.user.seccion+lug);
          //console.log($scope.lugar);
          //console.log($scope.lugar.join());
          $scope.user.lugar = $scope.lugar;
          $scope.lugars = $scope.lugar.join();
          //console.log($scope.user.lugar);
          $scope.botonesLugar[lug]=false;
          $scope.precio = "$"+$scope.lugaresPrecio[lug];
        } else if ($scope.lugar.length >=1 && $scope.lugar.length < limite) {
          //console.log("validar lugar");
          //console.log($scope.lugar);
          var req = {
            method : "POST" ,
            url :  "http://sonparamilo.jonathanarc.net/apirest/busqueda/validarLugar" , 
            data: {
              buscado: $scope.user.seccion+lug,
              asignados: $scope.lugar
            }
          };
          $http(req).success(function (response) {//'response' es el objeto que devuelve el servicio web
            //console.log(response);
            if (response.asignar) 
            {
              var auxTotal =0;
              $scope.lugar.push($scope.user.seccion+lug);
              for (var i = 0; i < $scope.lugar.length; i++) {
                  auxTotal += parseInt($scope.lugaresPrecio[($scope.lugar[i].replace($scope.user.seccion, ""))]);
              }
              //console.log(auxTotal);
              $scope.user.lugar = $scope.lugar;
              $scope.lugars = $scope.lugar.join();
              $scope.precio = "$"+auxTotal;
              $scope.botonesLugar[lug]=false;
            }
            else{
              alert("Lugares no contig\u00FCos, le sugerimos seleccionar otro lugar");
            }

          }).error(function (response){
            //console.log(response);
            alert("Ha fallado la petici\u00F3n. Estado HTTP:"+status);
          });
          
        }else{
          
          alert("Solo es posible seleccionar "+limite+" lugares m\u00E1ximo por participante");
        }
      }else{
        //console.log("Lugar ocupado");
      }
      ////console.log($scope.user);
      ////console.log($scope.lugar);
    };*/
    
  
}]);

