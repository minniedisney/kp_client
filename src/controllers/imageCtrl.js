angular.module('photoFeedApp').controller('imageCtrl', ['$rootScope', '$scope', '$http', 'requestService', 'ModalService',
    function($rootScope, $scope, $http, requestService, ModalService) {

        var msgBar = angular.element(document.querySelector('#messageBar'))[0];
        var navHl = angular.element(document.querySelector('#navHighlight'))[0];

        $scope.requestFeedData = function() {
            $rootScope.pageStat = 0;
            requestService.resize();
            requestService.requestGet("/api/feed/self", {
                count: 12
            }).then(function(res) {
                $scope.images = res.data;
            });

            msgBar.style.height = "0";
            navHl.style.left = "0";
        };

        $scope.requestLikedData = function() {
            $rootScope.pageStat = 1;
            requestService.resize();
            requestService.requestGet("/api/users/self/media/liked", {
                count: 12
            }).then(function(res) {
                if (res.data.length === 0) {
                    $scope.nodata = true;
                    $scope.noDataMessage = "What?！ You haven't liked a photo yet! (っ °Д °;)っ";
                } else {
                    $scope.nodata = false;
                    $scope.imagesLiked = res.data;
                }
            });

            msgBar.style.height = "0";
            navHl.style.left = "25%";
        };

        $scope.requestFavedData = function() {
            $rootScope.pageStat = 2;
            requestService.resize();
            requestService.requestGet("/api/users/self/favorite", {
                begin: 0
            }).then(function(res) {
                if (res.data.length === 0) {
                    $scope.nodata = true;
                    $scope.noDataMessage = "Favorite some photos！(๑•́ ₃ •̀๑)";
                } else {
                    $scope.nodata = false;
                    $scope.imagesFaved = res.data;
                }
            });

            msgBar.style.height = "60px";
            msgBar.style.backgroundColor = "#f50057";
            navHl.style.left = "50%";
        };

        $scope.requestUserData = function() {
            $rootScope.pageStat = 3;
            requestService.resize();
            requestService.requestGet("/api/users/" + $rootScope.userId).then(function(res) {
                $scope.userName = res.data.username;
                $scope.userAvatarUrl = res.data.profile_picture;
                $scope.userPost = res.data.counts.media;
                $scope.userFollow = res.data.counts.follows;
                $scope.userFollower = res.data.counts.followed_by;
            });

            msgBar.style.height = "240px";
            msgBar.style.backgroundColor = "#424242";
            navHl.style.left = "75%";
        }


        $scope.requestLoadMore = function() {
            if (requestService.isBusy()) return;

            var oldImages = [];
            var requestUrl;

            if ($rootScope.pageStat === 0 && (typeof $scope.images !== 'undefined')) {
                oldImages = $scope.images;
                requestUrl = "/api/feed/self";
            } else if ($rootScope.pageStat === 1 && (typeof $scope.imagesLiked !== 'undefined')) {
                oldImages = $scope.imagesLiked;
                requestUrl = "/api/users/self/media/liked";
            } else if ($rootScope.pageStat === 2 && (typeof $scope.imagesFaved !== 'undefined')) {
                oldImages = $scope.imagesFaved;
                requestUrl = "/api/users/self/favorite";
            }

            if ($rootScope.pageStat === 2) {
                var params = {
                    begin: oldImages.length
                };
            } else {
                var params = {
                    count: 12,
                    max_id: oldImages[oldImages.length - 1].id
                };
            }

            requestService.requestGet(requestUrl, params).then(function(res) {
                var newImages = res.data;
                console.log("Size: " + oldImages.length + " + " + newImages.length);
                for (var i = 0; i < newImages.length; i++) {
                    if ($rootScope.pageStat === 0) {
                        $scope.images.push(newImages[i]);
                    } else if ($rootScope.pageStat === 1) {
                        $scope.imagesLiked.push(newImages[i]);
                    } else if ($rootScope.pageStat === 2) {
                        $scope.imagesFaved.push(newImages[i]);
                    }
                }
            });
        };

        $scope.requestLogout = function() {
            requestService.requestPost("/api/users/self/logout");
        }

        $scope.likedIconUpdate = function(image) {
            if (image.user_has_liked) {
                return {
                    backgroundImage: "url('../image/likesR.png')"
                };
            } else {
                return {
                    backgroundImage: "url('../image/likes.png')"
                };
            }
        };

        $scope.favStateUpdate = function(image) {
            var favUrl = image.favStat ? "/unfavorite" : "/favorite";
            var mediaId = ($rootScope.pageStat === 2) ? image.mediaId : image.id;
            console.log(mediaId + ' user_favorite : ' + image.favStat);

            requestService.requestPost("/api/media/" + mediaId + favUrl).then(function() {
                image.favStat = !image.favStat;
                console.log(mediaId + ' user_favorite > ' + image.favStat);
            });
        };

        $scope.favBtnUpdate = function(image) {
            if (typeof image.favStat === 'undefined') {
                if ($rootScope.pageStat === 2) {
                    image.favStat = true;
                } else {
                    image.favStat = image.user_favorite;
                }
            }
            return image.favStat ? 'favBtnTrue' : 'favBtnFalse';
        };

        $scope.videoCoverUpdate = function(image) {
            if (image.type !== 'video') {
                return 'hide';
            } else {
                return 'show';
            }
        };

        $scope.openModal = function(image) {
            ModalService.showModal({
                templateUrl: "../partials/imageModal.html",
                controller: "imageModalCtrl",
                inputs: {
                    image: image
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    console.log("Modal Closed!");
                });
            });
        };

        var resizeTimer;
        $scope.$on("resize", function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                requestService.resize();
            }, 200);
        });
    }
]);
