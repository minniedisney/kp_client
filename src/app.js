var photoFeedApp = angular.module('photoFeedApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'infinite-scroll', 'angularModalService']);

photoFeedApp.value('token', ''); //Authorization token
photoFeedApp.value('requestBusy', false);

photoFeedApp.service('requestService', ['token', '$cookies', '$http', 'requestBusy',
    function(token, $cookies, $http, requestBusy) {

        this.requestAuthStat = function() {
            token = $cookies.get('auth_token');

            if ((typeof token === "undefined") || token === '') {
                return false;
            }

            return true;
        };

        this.requestGet = function(reqUrl, params) {
            requestBusy = true;
            var req = {
                method: 'GET',
                url: reqUrl,
                headers: {
                    'Authorization': token
                }
            };
            var count = 0;
            if (typeof params !== 'undefined') {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (count === 0) {
                            req.url += '?';
                            count++;
                        } else {
                            req.url += '&';
                        }
                        req.url += key + '=' + params[key];
                    }
                }
            }
            var promise = $http(req)
                .success(function(res) {
                    requestBusy = false;
                    return res;
                })
                .error(function(res) {
                    requestBusy = false;
                    console.log("ERROR: (requestGet) " + res.status + res.data);
                });

            return promise;
        };

        this.requestPost = function(reqUrl, params) {
            requestBusy = true;
            var req = {
                method: 'POST',
                url: reqUrl,
                headers: {
                    'Authorization': token
                }
            };
            //TODO: Add data in request if need
            var count = 0;
            if (typeof params !== 'undefined') {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        if (count === 0) {
                            req.url += '?';
                            count++;
                        } else {
                            req.url += '&';
                        }
                        req.url += key + '=' + params[key];
                    }
                }
            }
            var promise = $http(req)
                .success(function(res) {
                    requestBusy = false;
                    return res;
                })
                .error(function(res) {
                    requestBusy = false;
                    console.log("ERROR: (requestPost) " + res.status + res.data);
                });

            return promise;
        };

        this.resize = function() {
            var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var container = angular.element(document.querySelector('#container'))[0];

            if (typeof container !== 'undefined') {
                console.log("Size request! W=" + windowWidth);
                if (windowWidth >= 1300) {
                    container.style.width = "1290px";
                } else if (windowWidth >= 870) {
                    container.style.width = "860px";
                } else {
                    container.style.width = "430px";
                }
            }
        };

        this.isBusy = function() {
            return requestBusy;
        };
    }
]);

photoFeedApp.filter('timeago', function() {
    return function(createdTime) {
        var d = new Date();
        var nowTime = Math.floor(d.getTime() / 1000);
        var secondAgo = nowTime - createdTime;

        if (secondAgo > 3 * 365 * 24 * 3600) {
            return "Long time ago";
        } else if (secondAgo > 365 * 24 * 3600) {
            return Math.floor(secondAgo / (365 * 24 * 3600)) + "yr";
        } else if (secondAgo > 7 * 24 * 3600) {
            return Math.floor(secondAgo / (7 * 24 * 3600)) + "wk";
        } else if (secondAgo > 24 * 3600) {
            return Math.floor(secondAgo / (24 * 3600)) + "d";
        } else if (secondAgo > 3600) {
            return Math.floor(secondAgo / 3600) + "h";
        } else if (secondAgo > 60) {
            return Math.floor(secondAgo / 60) + "min";
        } else if (secondAgo > 0) {
            return "Just now";
        } else {
            return "Future";
        }
    };
});

photoFeedApp.run(function($rootScope) {
    angular.element(window).on("resize", function(e) {
        $rootScope.$broadcast("resize", e);
    });
});

photoFeedApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/feed.html',
            controller: 'imageCtrl'
        })
        .when('/liked', {
            templateUrl: 'partials/liked.html',
            controller: 'imageCtrl'
        })
        .when('/faved', {
            templateUrl: 'partials/faved.html',
            controller: 'imageCtrl'
        })
        .when('/user', {
            templateUrl: 'partials/user.html',
            controller: 'imageCtrl'
        })
        .otherwise({
            redirectTo: '/',
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
