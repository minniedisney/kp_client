angular.module('photoFeedApp').controller('imageModalCtrl', ['$rootScope', '$scope', '$sce', 'requestService', 'image', 'close',
    function ($rootScope, $scope, $sce, requestService, image, close) {
        var closeModeStyle = { "overflow": "auto" };
        var openModeStyle = { "overflow": "hidden" };
        $rootScope.htmlStyle = openModeStyle;
        $scope.display = true;
        $scope.imageType = image.type;
        if ($rootScope.pageStat === 2) {
            if ($scope.imageType === "video") {
                $scope.imageUrl = image.video_standard_resolution;
            }
            else {
                $scope.imageUrl = image.standard_resolution;
            }
            $scope.authorUsername = image.create_username;
        } else {
            if ($scope.imageType === "video") {
                $scope.imageUrl = image.videos.standard_resolution.url;
            } else {
                $scope.imageUrl = image.images.standard_resolution.url;
            }
            $scope.authorAvatarUrl = image.user.profile_picture;
            $scope.authorUsername = image.user.username;
            $scope.createTime = image.created_time;
            $scope.commentsCount = image.comments.count;
            $scope.likesCount = image.likes.count;
            $scope.comments = image.comments.data;

            // handle image caption field
            $scope.showLinkContainer = false;
            if (image.caption === null || image.caption === undefined) {
                $scope.caption = '';
            } else {
                var captionTextlimit = 256; // caption text threshold to show hide/show more text link 
                $scope.caption = image.caption.text;

                if (image.caption.text.length >= captionTextlimit) {
                    $scope.showLinkContainer = true;

                    var showModeStyle = { "height": "auto" };
                    var hideModeStyle = { "height": "80px", "overflow": "hidden" };

                    $scope.captionStyle = hideModeStyle;
                    $scope.showMoreLink = true;
                    $scope.showHideLink = false;

                    $scope.showMoreCaptionText = function () {
                        $scope.captionStyle = showModeStyle;
                        $scope.showMoreLink = false;
                        $scope.showHideLink = true;
                    };

                    $scope.hideMoreCaptionText = function () {
                        $scope.captionStyle = hideModeStyle;
                        $scope.showMoreLink = true;
                        $scope.showHideLink = false;
                    };
                }
            }
        }

        $scope.close = function () {
            $scope.display = false;
            close();
            $rootScope.htmlStyle = closeModeStyle;
        };

        $scope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.likedIconUpdate = function () {
            if (image.user_has_liked) {
                return { backgroundImage: "url('../image/likesR.png')" };
            }
            else {
                return { backgroundImage: "url('../image/likes.png')" };
            }
        };

        $scope.favStateUpdate = function (image) {
            var favUrl = image.favStat ? "/unfavorite" : "/favorite";
            var mediaId = ($rootScope.pageStat === 2) ? image.mediaId : image.id;
            console.log(mediaId + ' user_favorite : ' + image.favStat);

            requestService.requestPost("/api/media/" + mediaId + favUrl).then(function () {
                image.favStat = !image.favStat;
                console.log(mediaId + ' user_favorite > ' + image.favStat);
            });
        };

        $scope.favBtnUpdate = function (image) {
            if (typeof image.favStat === 'undefined') {
                if ($rootScope.pageStat === 2) {
                    image.favStat = true;
                } else {
                    image.favStat = image.user_favorite;
                }
            }
            return image.favStat ? 'favBtnTrue' : 'favBtnFalse';
        };
    }
]);