angular.module('photoFeedApp').controller('mainCtrl', ['$rootScope', '$scope', 'requestService', '$window',
    function($rootScope, $scope, requestService, $window) {
    	$scope.isAuthenticated = function() {
            return requestService.requestAuthStat();
        };

        $scope.requestUserData = function() {
            requestService.requestGet("/api/users/self").then(function(res){
                $scope.userName = res.data[0].username;
                $rootScope.userId = res.data[0].id;
            });
            //var logo = angular.element(document.querySelector('#logo'))[0];
            //logo.style.display = "none";
        };


        $scope.instagramLogin = function() {
            requestService.requestPost("/api/auth/instagram").then(function(res){
                $window.location.href = res.data.url;
            });
        };

      var bgStyle = {"background":"linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('../image/loginbg.jpg')","background-size": "cover"};
        //var bgStyle = {"background-image":"url('../image/loginbg.jpg')","-webkit-background-size": "cover","-moz-background-size": "cover","-o-background-size": "cover","background-size": "cover"}
        $rootScope.htmlStyle=bgStyle;

    }
]);