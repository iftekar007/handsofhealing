'use strict';

/* App Module */
var r1headzappvar = angular.module('r1headzapp', ['admin_module_app','generaluser_module_app','contact_module_app','userrole_module_app','category_module_app','product_module_app','newsletter_module_app','order_module_app','common_module_app','myaccount_module_app','ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);


r1headzappvar.run(function ($templateCache) {
    $templateCache.put(
        'tmpl-doc-list-wrapper', jQuery('#tmpl-doc-list-wrapper').html());


});

r1headzappvar.directive('bxSlider', function () {
    var BX_SLIDER_OPTIONS = {
        minSlides:1 ,
        maxSlides: 4,
        slideWidth: 287,
        infiniteLoop: false
        //slideHeight:315
    };

    return {
        restrict: 'A',
        require: 'bxSlider',
        priority: 0,
        controller: function() {},
        link: function (scope, element, attrs, ctrl) {
            var slider;
            ctrl.update = function() {
                slider && slider.destroySlider();
                slider = element.bxSlider(BX_SLIDER_OPTIONS);
            };
        }
    }
});


r1headzappvar.filter('limitHtml', ['$sce',function($sce) {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;
        var newStr = '';

        newStr =  length > limit ? changedString.substr(0, limit - 1)+"..." : changedString;

        return $sce.trustAsHtml(newStr);
    }
}]);

r1headzappvar.filter('limitHtml1', ['$sce',function($sce) {
    return function(text, limit) {

        var newlimit = limit;

        if($( window ).width() >= 1920){
            newlimit = 115;
        }else if($( window ).width() >= 1660){
            newlimit = 100;
        }else if($( window ).width() >= 1600){
            newlimit = 80;
        }

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;
        var newStr = '';

        newStr =  length > newlimit ? changedString.substr(0, newlimit - 1)+"..." : changedString;

        return $sce.trustAsHtml(newStr);
    }
}]);


r1headzappvar.directive('bxSliderItem', function($timeout) {
    return {
        require: '^bxSlider',
        link: function(scope, elm, attr, bxSliderCtrl) {
            if (scope.$last) {
                bxSliderCtrl.update();
            }
        }
    }
});
r1headzappvar.directive('docListWrapper', ['$timeout', function ($timeout) {
    return {
        restrict: 'C',
        priority: 500,
        replace: false,
        templateUrl: 'tmpl-doc-list-wrapper',
        scope: { docs: '=docs'},
        link: function (scope, element, attrs) {
        }
    };
}]);

r1headzappvar.run(['$rootScope','$cookieStore','$state','contentservice','$uibModal','$log',function($rootScope,$cookieStore, $state,contentservice,$uibModal,$log){

    $rootScope.$on('$stateChangeStart', function () {
        $rootScope.stateIsLoading = true;
        var random=Math.random() * Math.random();
        //$cookieStore.remove('randomid');
        random=random.toString().replace('.','');
        //$cookieStore.put('randomid', random);

        //console.log($cookieStore.get('randomid')+'random');

        if(typeof($cookieStore.get('randomid'))=='undefined'){

            $cookieStore.put('randomid', random);
        }
    });

    $rootScope.$on('$stateChangeSuccess',function(ev, to, toParams, from, fromParams) {
        $rootScope.stateIsLoading = false;
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        $(document).scrollTop(0);

        $rootScope.refreshcontent=function(){
            if (typeof (data) != 'undefined') unset(data);
            $rootScope.interval = 600;
            $rootScope.contentupdated = false;
            //var data=contentservice.getcontent( $rootScope.adminUrl+'listcontent');
            var myVar = setInterval(function () {
                $rootScope.contentbasedata = contentservice.getcontent($rootScope.adminUrl + 'listcontent');
                if (typeof ($rootScope.contentbasedata) != 'undefined') {
                    clearInterval(myVar);
                }
                $rootScope.contentlist = [];
                $rootScope.conf = [];
                $rootScope.contenttype = [];
                angular.forEach($rootScope.contentbasedata, function (value, key) {
                    //console.log(value.type);
                    $rootScope.tempval = value;
                    if (value.ctype == "html" || value.ctype == 'text') {
                        $rootScope.tempval.content = JSON.parse(value.content);
                        $rootScope.contentvalue = '';
                        angular.forEach($rootScope.tempval.content, function (value1, key1) {
                            $rootScope.contentvalue += value1;
                        });

                        $rootScope.tempval.content = $rootScope.contentvalue;
                    }
                    else {
                        $rootScope.tempval.content = "<img src = nodeserver/uploads/" + value.content + " /> ";
                    }
                    $rootScope.contentlist.splice(value.id, 0, $rootScope.tempval);
                    $rootScope.conf[value.id] = $rootScope.tempval.content;
                    $rootScope.contenttype[value.id] = $rootScope.tempval.ctype;

                    $rootScope[value.cname + value.id] = $rootScope.tempval;
                    //array.splice(2, 0, "three");
                    if (value.parentid != 0) {
                        $rootScope.conf[value.parentid] = $rootScope.tempval.content;
                        $rootScope.contenttype[value.parentid] = $rootScope.tempval.ctype;
                        $rootScope[value.cname + value.parentid] = $rootScope.tempval;
                    }
                });

            }, $rootScope.interval);
        }



        $rootScope.refreshcontent();

        $rootScope.convert=function convert(str) {
            var date = new Date(str),
                mnth = ("0" + (date.getMonth()+1)),
                day  = ("0" + date.getDate()),
                hour  = ("0" + date.getHours()),
                minute  = ("0" + date.getMinutes());
            console.log(date);
            return [ date.getFullYear(), mnth, day,hour,minute ].join("-");
            //return new Date(date).getTime() / 1000
        }
        $rootScope.timeConverter=function (UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var month1 = a.getUTCMonth();
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = month + ' ' + date + ' ' + year + '  ' + hour + ':' + min + ':' + sec ;
            return time;
        }





    });

    $rootScope.items = ['item1', 'item2', 'item3'];

    $rootScope.animationsEnabled = true;

    $rootScope.opencontentmodal = function (size,id) {

        var modalInstance = $uibModal.open({
            animation: $rootScope.animationsEnabled,
            templateUrl: 'contenteditmodal',
            controller: 'editcontent',
            size: size,
            resolve: {
                items: function () {
                    return id
                }
            }
        });
    }

}]);


r1headzappvar.service('contentservice', function($http, $log, $q) {
    var d;
    this.getcontent= function(url) {
        $http.get(url)
            .success(function(data) {
                d= data;
            }).error(function(msg, code) {
                $log.error(msg, code);
            });
        return d;
    }
});


r1headzappvar.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start;
            return input.slice(start);
        }
        return [];
    };
});

r1headzappvar.directive('content',['$compile','$sce','$state','$rootScope', function($compile,$sce,$state,$rootScope) {
    var directive = {};
    directive.restrict = 'E';
    directive.template = '<div  class=contentbind ng-bind-html="student.content | sanitize123" editid="student.id| sanitize123"  ></div><button  class = editableicon editid="student.id| sanitize123" ng-click=editcontent("student.name")>Edit</button><div class=clearfix></div>';
    directive.scope = {
        student : "=name"
    }
    directive.compile = function(element, attributes) {

        element.css("display", "inline");
        var linkFunction = function($scope, element, attributes) {
            $compile($(element).find('.cc'))($scope);
            $compile($(element).find('.editableicon'))($scope);
            $(element).css('display','inline-block');
            $(element).css('position','relative');

           /* if($rootScope.userroleid != 2){
                $(element).find('.editableicon').remove();
            }*/
            $(element).bind("DOMSubtreeModified",function(){
                setTimeout(function(){
                    //$(element).find('.editableicon').css('position','absolute').css('top',parseFloat($(element).offset().top+$(element).height()-30)).css('left',parseFloat($(element).offset().left+$(element).width()-40));
                    $(element).find('.editableicon').css('position','absolute').css('top',0).css('right',0);
                    //console.log($(element).height());
                    //console.log($(element).next().width());
                },1000);

               // console.log('changed');
            });
            $(element).find('.editableicon').on( "click", function() {
                $rootScope.opencontentmodal('lg',$( this ).parent().attr('id'));
            });

        }
        return linkFunction;
    }
    return directive;
}]);


r1headzappvar.filter("sanitize123", ['$sce', function($sce) {
    return function(htmlCode){
        // console.log(htmlCode);
        // console.log('santize');
        return $sce.trustAsHtml(htmlCode);
    }
}]);

r1headzappvar.filter("sanitizelimit", ['$sce', function($sce) {
    return function(htmlCode){
        //console.log(htmlCode);
        //console.log('santize');
        htmlCode=htmlCode.substr(0,20);
        return $sce.trustAsHtml(htmlCode);
    }
}]);

r1headzappvar.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    $urlRouterProvider
        .otherwise("/index");


    $stateProvider

        .state('login',{
            url:"/login",
            views: {

                'content': {
                    templateUrl: 'partial/login.html' ,
                    controller: 'login'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'login'
                },
            }
        }
    )
        .state('forgot-password',{
                url:"/forgot-password",
                views: {

                    'content': {
                        templateUrl: 'partial/forgot_password.html' ,
                        controller: 'forgotpassword'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                       // controller: 'login'
                    },
                }
            }
        )
        .state('forgot-password-check',{
                url:"/forgot-password-check",
                views: {

                    'content': {
                        templateUrl: 'partial/forgot_password_check.html' ,
                        controller: 'forgotpasswordcheck'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                       // controller: 'login'
                    },
                }
            }
        )
        .state('change-password',{
                url:"/change-password",
                views: {

                    'content': {
                        templateUrl: 'partial/change_password.html' ,
                        controller: 'changepassword'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                        controller: 'login'
                    },
                }
            }
        )

        .state('signup',{
            url:"/signup",
            views: {

                'content': {
                    templateUrl: 'partial/signup.html' ,
                    controller: 'signup'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'signup'
                },
            }
        }
    )
        .state('signupactivate',{
                url:"/signupactivate/:link",
                views: {

                    'content': {
                        templateUrl: 'partial/signup.html' ,
                        controller: 'signupactivate'
                    },
                    'header': {
                       // templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                       // templateUrl: 'partial/footer.html' ,
                       // controller: 'header'
                    },
                    'modalview': {
                      //  templateUrl: 'partial/modalview.html' ,
                      //  controller: 'signup'
                    },
                }
            }
        )


        .state('index',{
            url:"/index",
            views: {

                'content': {
                    templateUrl: 'partial/home.html' ,
                    controller: 'home'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    //controller: 'home'
                },
            }
        }
    )

        .state('aboutus',{
            url:"/aboutus",
            views: {

                'content': {
                    templateUrl: 'partial/aboutus.html' ,
                    controller: 'aboutus'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'aboutus'
                },
            }
        }
    )




        .state('locations',{
            url:"/locations",
            views: {

                'content': {
                    templateUrl: 'partial/locations.html' ,
                    controller: 'newsletter'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'locations'
                },
            }
        }
    )


        .state('contactus',{
            url:"/contactus",
            views: {

                'content': {
                    templateUrl: 'partial/contactus.html' ,
                    controller: 'contactus'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                  //  controller: 'contactus'
                },
            }
        }
    )

        .state('reviews',{
            url:"/reviews",
            views: {

                'content': {
                    templateUrl: 'partial/reviews.html' ,
                    controller: 'reviews'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'reviews'
                },
            }
        }
    )

        .state('newsletter',{
            url:"/newsletter",
            views: {

                'content': {
                    templateUrl: 'partial/newsletter.html' ,
                    controller: 'newsletter'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                  //  controller: 'newsletter'
                },
            }
        }
    )

        .state('newsletter-details',{
                url:"/newsletter-details/:id",
                views: {

                    'content': {
                        templateUrl: 'partial/newsletter_details.html' ,
                        controller: 'newsletterdetails'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                        //  controller: 'newsletter'
                    },
                }
            }
        )



        .state('treatmentandservices',{
            url:"/treatmentandservices",
            views: {

                'content': {
                    templateUrl: 'partial/treatmentandservices.html' ,
                    controller: 'treatmentandservices'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'treatmentandservices'
                },
            }
        }
    )


        .state('treatmentandservicesinnerpage',{
            url:"/treatmentandservicesinnerpage/:id/:name",
            views: {

                'content': {
                    templateUrl: 'partial/treatmentandservicesinnerpage.html' ,
                    controller: 'treatmentandservicesinnerpage'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    controller: 'treatmentandservicesinnerpage'
                },
            }
        }
    )


        .state('products',{
            url:"/products",
            views: {

                'content': {
                    templateUrl: 'partial/products.html' ,
                    controller: 'products'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                   // controller: 'products'
                },
            }
        }
    )


        .state('productdetails',{
            url:"/productdetails/:id/:name",
            views: {

                'content': {
                    templateUrl: 'partial/productdetails.html' ,
                    controller: 'productdetails'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                  //  controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                    //controller: 'productdetails'
                },
            }
        }
    )


        .state('productlisting',{
            url:"/productlisting/:id",
            views: {

                'content': {
                    templateUrl: 'partial/productlisting.html' ,
                    controller: 'productlisting'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                   // controller: 'productlisting'
                },
            }
        }
    )

        .state('shoppingcart',{
                url:"/shoppingcart",
                views: {

                    'content': {
                        templateUrl: 'partial/shoppingcart.html' ,
                        controller: 'shoppingcart'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                       // controller: 'shoppingcart'
                    },
                }
            }
        )
        .state('ordersuccess',{
                url:"/ordersuccess",
                views: {

                    'content': {
                        templateUrl: 'partial/order_success.html' ,
                         controller: 'ordersuccess'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                       // controller: 'ordersuccess'
                    },
                }
            }
        )
        .state('checkout',{
                url:"/checkout",
                views: {

                    'content': {
                        templateUrl: 'partial/checkout.html' ,
                        controller: 'checkout'
                    },
                    'header': {
                        templateUrl: 'partial/header.html' ,
                        controller: 'header'
                    },
                    'footer': {
                        templateUrl: 'partial/footer.html' ,
                        controller: 'header'
                    },
                    'modalview': {
                        templateUrl: 'partial/modalview.html' ,
                       // controller: 'checkoutconfirmation'
                    },
                }
            }
        )
        .state('checkoutconfirmation',{
            url:"/checkoutconfirmation",
            views: {

                'content': {
                    templateUrl: 'partial/checkoutconfirmation.html' ,
                    controller: 'checkoutconfirmation'
                },
                'header': {
                    templateUrl: 'partial/header.html' ,
                    controller: 'header'
                },
                'footer': {
                    templateUrl: 'partial/footer.html' ,
                    controller: 'header'
                },
                'modalview': {
                    templateUrl: 'partial/modalview.html' ,
                   // controller: 'checkoutconfirmation'
                },
            }
        }
    )


        .state('profile',{
                url:"/profile",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/myprofile.html' ,
                         controller: 'profile'
                    },

                }
            }
        )
        .state('edit-profile',{
                url:"/edit-profile",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/edit_profile.html' ,
                        controller: 'editprofile'
                    },

                }
            }
        )

         .state('user-change-password',{
                url:"/user-change-password",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/user_change_password.html' ,
                        controller: 'userchangepassword'
                    },

                }
            }
        )


        .state('myaccount-affiliate',{
                url:"/myaccount-affiliate",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/affiliate.html' ,
                       // controller: 'myaccountaffiliate'
                    },

                }
            }
        )
        .state('myaccount-order-details',{
                url:"/myaccount-order-details/:id",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller:'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/order_details.html' ,
                        controller: 'myorderdetails'
                    },

                }
            }
        )


        .state('myaccount-order',{
                url:"/myaccount-order",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/order.html' ,
                        controller: 'myorder'
                    },

                }
            }
        )

        .state('myaccount-order-manager',{
                url:"/myaccount-order-manager",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/myaccount/header.html' ,
                        controller: 'header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/myaccount/footer.html' ,
                        controller: 'header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/myaccount/left.html' ,
                        //  controller:'footer'
                    },

                    'content': {
                        templateUrl: 'partial/myaccount/order_manager.html' ,
                        //controller: 'myaccountordermanager'
                    },

                }
            }
        )
        .state('dashboard',{
                url:"/dashboard",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/dashboard/dashboard.html' ,
                        //controller: 'dashboard'
                    },

                }
            }
        )

        .state('add-admin',{
                url:"/add-admin",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/admin/add_admin.html' ,
                        controller: 'addadmin'
                    },

                }
            }
        )

        .state('generaluser-list',{
                url:"/generaluser-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/generaluser/generaluser_list.html' ,
                        controller: 'generaluserlist'
                    },

                }
            }
        )

        .state('contact-list',{
                url:"/contact-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/contact/contact_list.html' ,
                        controller: 'contactlist'
                    },

                }
            }
        )
        .state('admin-list',{
                url:"/admin-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/admin/admin_list.html' ,
                        controller: 'adminlist'
                    },

                }
            }
        )


        .state('edit-admin',{
                url:"/edit-admin/:userId",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/admin/edit_admin.html' ,
                        controller: 'editadmin'
                    },

                }
            }
        )

        .state('add-role',{
                url:"/add-role",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                         controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/userrole/add_role.html' ,
                        controller: 'addrole'
                    },

                }
            }
        )
        .state('role-list',{
                url:"/role-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/userrole/rolelist.html' ,
                        controller: 'rolelist'
                    },

                }
            }
        )

        .state('edit-role',{
                url:"/edit-role/:id",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/userrole/edit_role.html' ,
                        controller: 'editrole'
                    },

                }
            }
        )


        .state('add-category',{
                url:"/add-category",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/category/add_category.html' ,
                        controller: 'addcategory'
                    },

                }
            }
        )
        .state('category-list',{
                url:"/category-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/category/category_list.html' ,
                        controller: 'categorylist'
                    },

                }
            }
        )

        .state('edit-category',{
                url:"/edit-category/:id",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/category/edit_category.html' ,
                        controller: 'editcategory'
                    },

                }
            }
        )

        .state('add-product',{
                url:"/add-product",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/product/add_product.html' ,
                        controller: 'addproduct'
                    },

                }
            }
        )
        .state('product-list',{
                url:"/product-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                          controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/product/product_list.html' ,
                        controller: 'productlist'
                    },

                }
            }
        )

        .state('edit-product',{
                url:"/edit-product/:id",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/product/edit_product.html' ,
                        controller: 'editproduct'
                    },

                }
            }
        )

        .state('addcontent',{
            url:"/add-content",
            views: {

                'admin_header': {
                    templateUrl: 'partial/admin_top_menu.html' ,
                    controller: 'admin_header'
                },
                'admin_left': {
                    templateUrl: 'partial/admin_left.html' ,
                      controller: 'admin_header'
                },
                'admin_footer': {
                    templateUrl: 'partial/admin_footer.html' ,
                },
                'content': {
                    templateUrl: 'partial/add_content.html' ,
                    controller: 'addcontent'
                },

            }
        }
    )
        .state('contentlist',{
            url:"/contentlist",
            views: {

                'admin_header': {
                    templateUrl: 'partial/admin_top_menu.html' ,
                    controller: 'admin_header'
                },
                'admin_left': {
                    templateUrl: 'partial/admin_left.html' ,
                      controller: 'admin_header'
                },
                'admin_footer': {
                    templateUrl: 'partial/admin_footer.html' ,
                },
                'content': {
                    templateUrl: 'partial/contentlist.html' ,
                    controller: 'contentlist'
                },

            }
        }
    )

        .state('edit-content',{
            url:"/edit-content/:id",
            views: {

                'admin_header': {
                    templateUrl: 'partial/admin_top_menu.html' ,
                    controller: 'admin_header'
                },
                'admin_left': {
                    templateUrl: 'partial/admin_left.html' ,
                    controller: 'admin_header'
                },
                'admin_footer': {
                    templateUrl: 'partial/admin_footer.html' ,
                },
                'content': {
                    templateUrl: 'partial/edit_content.html' ,
                    controller: 'editcontent'
                },

            }
        }
    )


        .state('add-newsletter',{
                url:"/add-newsletter",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/newsletter/add_newsletter.html' ,
                        controller: 'addnewsletter'
                    },

                }
            }
        )
        .state('newsletter-list',{
                url:"/newsletter-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/newsletter/newsletter_list.html' ,
                        controller: 'newsletterlist'
                    },

                }
            }
        )

        .state('edit-newsletter',{
                url:"/edit-newsletter/:id",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/newsletter/edit_newsletter.html' ,
                        controller: 'editnewsletter'
                    },

                }
            }
        )

        .state('order-list',{
                url:"/order-list",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/order/order_list.html' ,
                        controller: 'orderlist'
                    },

                }
            }
        )
        .state('order-details',{
                url:"/order-details/:orderid",
                views: {

                    'admin_header': {
                        templateUrl: 'partial/admin_top_menu.html' ,
                        controller: 'admin_header'
                    },
                    'admin_left': {
                        templateUrl: 'partial/admin_left.html' ,
                        controller: 'admin_header'
                    },
                    'admin_footer': {
                        templateUrl: 'partial/admin_footer.html' ,
                    },
                    'content': {
                        templateUrl: 'partial/order/order_details.html' ,
                        controller: 'orderdetails'
                    },

                }
            }
        )



    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        hashPrefix:'!'
    });
});



r1headzappvar.controller('ModalInstanceCtrl', function($scope,$state,$cookieStore,$http,$uibModalInstance,$rootScope,Upload,$uibModal,$timeout) {
    $scope.cancel = function () {

        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel111 = function () {

        $rootScope.goafterlogin = '';

        $uibModalInstance.dismiss('cancel');
    };



});

r1headzappvar.controller('addcontent', function($compile,$scope,$state,$http,$cookieStore,$rootScope,Upload,$sce,$stateParams,$window) {



    $rootScope.editcontent= function (evalue) {

        console.log(evalue);
    }



    $scope.tinymceOptions = {
        trusted: true,
        theme: 'modern',
        plugins: [
            'advlist autolink link  lists charmap   hr anchor pagebreak spellchecker',
            'searchreplace wordcount visualblocks visualchars code  insertdatetime  nonbreaking',
            'save table contextmenu directionality  template paste textcolor'
        ],
        // toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons',
        toolbar: ' undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link  |   media fullpage | forecolor backcolor',
        valid_elements : "a[href|target| href=javascript:void(0)],strong,b,img,div[align|class],br,span,label,i[class],ul[class],ol[class],li[class],iframe[width|height|src|frameborder|allowfullscreen],p",
        force_p_newlines : false,
        forced_root_block:'',
        extended_valid_elements : "label,span,i[class]"
    };

    $scope.form={};
    $scope.form.resume = '';
    $scope.form.resumearrn = new Array();
    $scope.form.resumearrp = new Array();
    $scope.form.resume = null;;


    $scope.caclismultiple=function(){

        if($scope.form.ismultiple=='yes'){

            $scope.ismultipleval=true;
        }
        else   $scope.ismultipleval=false;

    }

    $scope.delcopy=function(ev){

        console.log('test ...');

        var target = ev.target || ev.srcElement || ev.originalTarget;

        if($scope.cimage==true) {

            var spval = ($('.imgc').find('.delb').index(target));
            $scope.form.resumearrn.splice(spval, 1);
            $scope.form.resumearrp.splice(spval, 1);
            $(target).parent().remove();
        }

        if($scope.ctext==true || $scope.chtml==true){
            console.log($(target).prev().prev().attr('indexval'));
            // $scope.form.ctext.splice($(target).prev().attr('indexval'),1);
            // /delete $scope.form.ctext.$(target).prev().attr('indexval');
            var key = $(target).prev().prev().attr('indexval');
            if(key!=0){
                ;
                if($scope.ctext==true) $scope.form.ctext[key]=null;
                if($scope.chtml==true) $scope.form.chtml[key]=null;
                var res= $(target).parent().parent();
                $(target).parent().remove()
                $compile(res)($scope);

            }else{
                alert('You can not delete default content area' );
            }

        }

    }
    $scope.addcopy=function(ev){

        var target = ev.target || ev.srcElement || ev.originalTarget;

        if($scope.cimage!=true) {
            if ($scope.ctext == true ) {

                var addedval =parseInt(parseInt($(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('indexval'))+1);
                if(isNaN(addedval)) addedval=1;

                var res=$(target).prev().prev().clone().appendTo($(target).parent().find('.clearfix1').last());

                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('indexval',addedval);
                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('ng-model','form.ctext['+addedval+']');
                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('name','ctext['+addedval+']');
                //$compile(res)($scope);
                $compile($(target).prev().find('.copyarea').last())($scope);
                $(target).prev().find('.copyarea').last().find('button').removeClass('delb');

                $scope.add_Admin.$setDirty(true);

            }
            if ($scope.chtml == true) {
                var addedval =parseInt(parseInt($('div[ng-show="chtml"]').find('textarea').last().attr('indexval'))+1);
                if(isNaN(addedval)) addedval=1;

                $(target).parent().find('.clearfix1').last().append("\<div class='copyarea'>\
                \<textarea ui-tinymce='tinymceOptions'   name='chtml["+addedval+"]'  indexval ="+addedval+"  \
             \ ng-model='form.chtml["+addedval+"]'   \
                \ required\
              \  ></textarea>\
        \<div class='clearfix'></div>\
               \ <button type='button' ng-click='delcopy($event)' class='btn btn-primary'>Delete</button>\
               \ </div>\
                \<div class='clearfix'></div>");

                var res=$(target).parent().find('.copyarea').last();

                $compile(res)($scope || $rootScope);
                //$rootScope.$digest();

            }
        }
        else {
            $('input.uploadbtn').click();
            console.log($('button.uploadbtn').text());
        }

    }
    $scope.form.ismultiple='no';
    $scope.cimage=false;
    $scope.chtml=false;
    $scope.ctext=false;


    $scope.ctype=function(ctype){

        $scope.cimage=false;
        $scope.chtml=false;
        $scope.ctext=false;

        if(ctype=='html') {

            // $('textarea[name^="chtml"]').attr('required','');
            $scope.chtml=true;
        }
        if(ctype=='text') {
            //$('textarea[name^="ctext"]').attr('required','');
            $scope.ctext=true;
        }
        if(ctype=='image') $scope.cimage=true;

    }


    $scope.$watch('cfile', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            $scope.upload($scope.cfile);
            $rootScope.stateIsLoading = true;
        }
    });

    $scope.upload = function (file) {
        Upload.upload({
            url: $scope.adminUrl+'uploads',//webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (response) { //upload function returns a promise
            if(response.data.error_code === 0){ //validate success
                //$window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');

                console.log(response.data.filename);

                $('.progress').removeClass('ng-hide');
                file.result = response.data;

                if($scope.form.ismultiple=='yes'){

                    $scope.form.resumearrn.push(response.data.filename);
                    $scope.form.resumearrp.push(response.data.filename);

                    $scope.form.resume = null;
                    $scope.form.event_image = null;

                }
                else {

                    $scope.form.resume = response.data.filename;
                    $scope.form.image_url_url = response.data.filename;
                    $scope.form.event_image = response.data.filename;

                    $scope.form.resumearrn=new Array();
                    $scope.form.resumearrp=new Array();
                }
                $rootScope.stateIsLoading = false;

                //$('#loaderDiv').addClass('ng-hide');
            } else {
                $window.alert('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            $window.alert('Error status: ' + resp.status);
        }, function (evt) {
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            //vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };



    /*file upload end */



    $scope.contentValidator=function(){


        if($scope.add_Admin.$submitted){


            if($scope.form.ismultiple=='yes'){

                $scope.ismultipleval=true;
            }
            else   $scope.ismultipleval=false;

            if(typeof ($scope.form.ismultiple)!='undefined') return true;

            else return 'Required !' ;

        }

    }
    $scope.contenetv=function(){




        if($scope.add_Admin.$submitted){

            console.log($scope.form.ctext);
            if(typeof ($scope.form.ctext)!='undefined')
                console.log(Object.keys($scope.form.ctext).length);
            console.log($('textarea[name^="ctext"]').length);

            console.log('in cont validator');

        }

    }

    $scope.submitadminForm=function(){


        if($scope.chtml == true ){

            $scope.form.chtml=JSON.stringify($scope.form.chtml);

        }
        if($scope.ctext == true ){

            $scope.form.ctext=JSON.stringify($scope.form.ctext);

        }


        console.log($scope.form);
        console.log($.param($scope.form));

        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'adddata',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            //$('#employmentmodal').modal('show');
            console.log(data);
            $state.go('contentlist');

        });

    }

});




r1headzappvar.controller('contentlist', function($scope,$state,$http,$cookieStore,$rootScope,$uibModal) {
    $scope.getTextToCopy = function() {
        return "ngClip is awesome!";
    }
    $scope.doSomething = function () {
        console.log("NgClip...");
    }

    var clipboard = new Clipboard('.btn');
    $scope.predicate = 'id';
    $scope.reverse = true;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
    $scope.currentPage=1;
    $scope.perPage=10;

    $scope.totalItems = 0;

    $scope.filterResult = [];    $http({
        method  : 'GET',
        async:   false,
        url     : $scope.adminUrl+'listcontent',
        // data    : $.param($scope.form),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
        //console.log(data);
        $scope.contentlist=[];
        $scope.conf=[];
        $scope.contenttype=[];

        angular.forEach(data, function(value, key){
            //console.log(value.type);
            $scope.tempval=value;
            if(value.ctype == "html" || value.ctype=='text') {
                $scope.tempval.content=JSON.parse(value.content);
            }
            $scope.contentlist.splice(value.id,0,$scope.tempval);

            $scope.conf[value.id]= $scope.tempval.content;
            $scope.contenttype[value.id]= $scope.tempval.ctype;
            //array.splice(2, 0, "three");
            if(value.parentid!=0) {

                $scope.conf[value.parentid]= $scope.tempval.content;
                $scope.contenttype[value.parentid]= $scope.tempval.ctype;
            }
        });
        console.log($scope.contentlist);
        $scope.contentlistp = $scope.contentlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));

    });

    $scope.searchkey = '';
    $scope.search = function(item){

        if ( (item.cname.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) || (item.content.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ){
            return true;
        }
        return true;
    };

    $scope.deladmin = function(item,size){

        $scope.currentindex=$scope.userlist.indexOf(item);

        $uibModal.open({
            animation: true,
            templateUrl: 'delconfirm.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            scope:$scope
        });
    }

    $scope.changeStatus = function(item){
        $rootScope.stateIsLoading = true;
        var idx = $scope.userlist.indexOf(item);
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'updatestatus',
            data    : $.param({uid: $scope.userlist[idx].uid}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if($scope.userlist[idx].status == 0){
                $scope.userlist[idx].status = 1;
            }else{
                $scope.userlist[idx].status = 0;
            }
            // $scope.userlist[idx].status = !$scope.userlist[idx].status;
        });
    }





});


r1headzappvar.controller('editcontent', function(contentservice,$compile,$scope,$state,$http,$cookieStore,$rootScope,Upload,$sce,$stateParams,$uibModalInstance,items) {

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.form={};
    $scope.form.resume = '';
    $scope.form.resumearrn = new Array();
    $scope.form.resumearrp = new Array();
    $scope.form.resume = null;;
    if(typeof (items)=='undefined')$scope.id=$stateParams.id;
    else $scope.id=items;

    $http({
        method  : 'GET',
        async:   false,
        url     :     $scope.adminUrl+'contentlistbyid/'+$scope.id,
        data    : $.param({'id':$scope.userid}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        console.log(data.length);
        //console.log($scope.form);
        console.log('after form');
        $rootScope.currentlistdata=data;
        $scope.form = {
            cname: data[data.length-1].cname,
            ctype: data[data.length-1].ctype,
            description: data[data.length-1].description,
            parentid:data[data.length-1].id
        }

        if(data[data.length-1].parentid!=0) $scope.form.parentid=data[data.length-1].parentid;
        if(data[data.length-1].ctype!='image') {
            data[data.length-1].content = JSON.parse(data[data.length-1].content);

            if (data[data.length-1].content.length > 1) $scope.form.ismultiple = 'yes';
            else $scope.form.ismultiple = 'no';
        }else {

            $scope.form.ismultiple = 'no';
        }
        if(data[data.length-1].ctype=='html') {
            $scope.chtml=true;
            $scope.form.chtml=data[data.length-1].content;
        }
        if(data[data.length-1].ctype=='text') {
            $scope.form.ctext=data[data.length-1].content;
            $scope.ctext=true;
        }
        if(data[data.length-1].ctype=='image'){
            $scope.form.cimage=data[data.length-1].content;
            $scope.form.resume=data[data.length-1].content;
            $scope.form.image_url_url=data[data.length-1].content;
            $scope.cimage=true;
            $scope.form.ismultiple='no';
        }
        console.log($scope.form);
        console.log('after form');
    });

    $scope.tinymceOptions = {
        trusted: true,
        theme: 'modern',
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "emoticons template paste textcolor"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
        toolbar2: "print preview media | forecolor backcolor emoticons",
        valid_elements : "a[href|target],strong,b,img[src|alt],div[align|class],br,span,label,h3,h4,h2,h1,strong,i[class],ul[class],ol[class],li[class],iframe[width|height|src|frameborder|allowfullscreen],p",
        extended_valid_elements : "label,span,i[class]",
        'force_p_newlines'  : false,
        'forced_root_block' : '',
    };

    $scope.caclismultiple=function(){
        if($scope.form.ismultiple=='yes'){
            $scope.ismultipleval=true;
        }
        else   $scope.ismultipleval=false;
    }

    $scope.delcopy=function(ev){

        console.log('test ...');

        var target = ev.target || ev.srcElement || ev.originalTarget;

        if($scope.cimage==true) {

            var spval = ($('.imgc').find('.delb').index(target));
            $scope.form.resumearrn.splice(spval, 1);
            $scope.form.resumearrp.splice(spval, 1);
            $(target).parent().remove();
        }
        if($scope.ctext==true || $scope.chtml==true){
            console.log($(target).prev().prev().attr('indexval'));

            var key = $(target).prev().prev().attr('indexval');
            if(key!=0){
                ;
                if($scope.ctext==true) $scope.form.ctext[key]=null;
                if($scope.chtml==true) $scope.form.chtml[key]=null;
                var res= $(target).parent().parent();
                $(target).parent().remove()
                $compile(res)($scope);

            }else{
                alert('You can not delete default content area' );
            }
        }
    }
    $scope.addcopy=function(ev){

        var target = ev.target || ev.srcElement || ev.originalTarget;

        //console.log($( target).parentsUntil('.copyarea').html());
        if($scope.cimage!=true) {
            if ($scope.ctext == true ) {

                var addedval =parseInt(parseInt($(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('indexval'))+1);
                if(isNaN(addedval)) addedval=1;

                var res=$(target).prev().prev().clone().appendTo($(target).parent().find('.clearfix1').last());

                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('indexval',addedval);
                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('ng-model','form.ctext['+addedval+']');
                $(target).parent().find('.clearfix1').last().find('.copyarea').last().find('textarea').attr('name','ctext['+addedval+']');
                //$compile(res)($scope);
                $compile($(target).prev().find('.copyarea').last())($scope);
                $(target).prev().find('.copyarea').last().find('button').removeClass('delb');

                $scope.add_Admin.$setDirty(true);

            }
            if ($scope.chtml == true) {
                var addedval =parseInt(parseInt($('div[ng-show="chtml"]').find('textarea').last().attr('indexval'))+1);
                if(isNaN(addedval)) addedval=1;

                $(target).parent().find('.clearfix1').last().append("\<div class='copyarea'>\
                \<textarea ui-tinymce='tinymceOptions'   name='chtml["+addedval+"]'  indexval ="+addedval+"  \
             \ ng-model='form.chtml["+addedval+"]'   \
                \ required\
              \  ></textarea>\
             \<div class='clearfix'></div>\
               \ <button type='button' ng-click='delcopy($event)' class='btn btn-primary'>Delete</button>\
               \ </div>\
                \<div class='clearfix'></div>");

                var res=$(target).parent().find('.copyarea').last();

                $compile(res)($scope || $rootScope);
            }
        }
        else {
            $('input.uploadbtn').click();
            console.log($('button.uploadbtn').text());
        }

    }
    $scope.form.ismultiple='no';
    $scope.cimage=false;
    $scope.chtml=false;
    $scope.ctext=false;

    $scope.ctype=function(ctype){

        $scope.cimage=false;
        $scope.chtml=false;
        $scope.ctext=false;

        if(ctype=='html') {

            $scope.chtml=true;
        }
        if(ctype=='text') {
            $scope.ctext=true;
        }
        if(ctype=='image') $scope.cimage=true;
    }

    /*file upload part start */

    $scope.$watch('cfile', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            $scope.upload($scope.cfile);
            $rootScope.stateIsLoading = true;
        }
    });

    $scope.upload = function (file) {
        Upload.upload({
            url: $scope.adminUrl+'uploads',//webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (response) { //upload function returns a promise
            if(response.data.error_code === 0){ //validate success
                //$window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');

                console.log(response.data.filename);

                $('.progress').removeClass('ng-hide');
                file.result = response.data;

                if($scope.form.ismultiple=='yes'){

                    $scope.form.resumearrn.push(response.data.filename);
                    $scope.form.resumearrp.push(response.data.filename);

                    $scope.form.resume = null;
                    $scope.form.event_image = null;

                }
                else {

                    $scope.form.resume = response.data.filename;
                    $scope.form.image_url_url = response.data.filename;
                    $scope.form.event_image = response.data.filename;

                    $scope.form.resumearrn=new Array();
                    $scope.form.resumearrp=new Array();
                }
                $rootScope.stateIsLoading = false;

            } else {
                $window.alert('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            $window.alert('Error status: ' + resp.status);
        }, function (evt) {
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            //vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };

    /*file upload end */

    setTimeout(function(){
        $scope.form.country={};
        $scope.form.country.s_name='Belize';
        $('#country').val(20);
    },2000);


    $scope.contentValidator=function(){
        if($scope.add_Admin.$submitted){
            if($scope.form.ismultiple=='yes'){
                $scope.ismultipleval=true;
            }
            else   $scope.ismultipleval=false;
            if(typeof ($scope.form.ismultiple)!='undefined') return true;
            else return 'Required !' ;
        }
    }
    $scope.contenetv=function(){
        if($scope.add_Admin.$submitted){
            console.log($scope.form.ctext);
            if(typeof ($scope.form.ctext)!='undefined')
                console.log(Object.keys($scope.form.ctext).length);
            console.log($('textarea[name^="ctext"]').length);
            console.log('in cont validator');
        }
    }

    $scope.submitadminForm=function(){


        if($scope.chtml == true ){

            $scope.form.chtml=JSON.stringify($scope.form.chtml);

        }
        if($scope.ctext == true ){

            $scope.form.ctext=JSON.stringify($scope.form.ctext);

        }
        console.log($scope.form);
        console.log($.param($scope.form));
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'adddata',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            console.log(data);
            if($state.current!='edit-content'){
                $rootScope.refreshcontent();
                setTimeout(function(){
                    $rootScope.refreshcontent();
                    $scope.cancel();
                },1900);
            }
            else{
                if(typeof ($rootScope.previousState)!='undefined'){
                   // console.log($rootScope.previousState);
                    $state.go($rootScope.previousState);
                }
                else $state.go('contentlist');
            }
        });

    }

    $scope.iseditableformon=true

    $rootScope.getpreview=function(){
        $scope.iseditableformon=false;

        if($scope.chtml == true ){

            $scope.previewcontent=$scope.form.chtml[0];

        }
        if($scope.ctext == true ){

            $scope.previewcontent=$scope.form.ctext[0];

        }
        if($scope.cimage == true ){

            $scope.previewcontent="<img src=nodeserver/uploads/"+$scope.form.image_url_url+" /> ";

        }
    }

    $rootScope.update=function(){
        console.log($scope.contenetselected);


        console.log($scope.contenetselected.ctype+'==type');


        $scope.form = {
            cname: $scope.contenetselected.cname,
            ctype: $scope.contenetselected.ctype,
            description: $scope.contenetselected.description,
            parentid:$scope.contenetselected.id
        }

        if($scope.contenetselected.parentid!=0) $scope.form.parentid=$scope.contenetselected.parentid;
        if($scope.contenetselected.ctype!='image') {
            console.log($scope.contenetselected.content);
            console.log($scope.contenetselected.content[0]);
            if(typeof ($scope.contenetselected.content)!='object')$scope.contenetselected.content = JSON.parse($scope.contenetselected.content);
            console.log($scope.contenetselected.content);

            if ($scope.contenetselected.content.length > 1) $scope.form.ismultiple = 'yes';
            else $scope.form.ismultiple = 'no';
        }else {

            $scope.form.ismultiple = 'no';
        }
        if($scope.contenetselected.ctype=='html') {
            $scope.chtml=true;
            $scope.cimage=false;
            $scope.ctext=false;
            $scope.form.chtml=$scope.contenetselected.content;
            $scope.previewcontent=$scope.contenetselected.content[0];
        }
        if($scope.contenetselected.ctype=='text') {
            $scope.form.ctext=$scope.contenetselected.content;
            $scope.ctext=true;
            $scope.cimage=false;
            $scope.chtml=false;
            $scope.previewcontent=$scope.contenetselected.content[0];
        }
        if($scope.contenetselected.ctype=='image'){
            $scope.form.cimage=$scope.contenetselected.content;
            $scope.form.resume=$scope.contenetselected.content;
            $scope.form.image_url_url=$scope.contenetselected.content;
            $scope.cimage=true;
            $scope.ctext=false;
            $scope.chtml=false;
            $scope.form.ismultiple='no';
            $scope.previewcontent="<img src=nodeserver/uploads/"+$scope.form.image_url_url+" /> ";
        }
    }
});

r1headzappvar.controller('admin_header', function($compile,$scope,$state,$http,$cookieStore,$rootScope,Upload,$sce,$stateParams,$window) {

    $scope.sdfsdfsd = function(){
        //console.log(1212);
        if(angular.element( document.querySelector( 'body' ) ).hasClass('sidebar-collapse')){
            angular.element( document.querySelector( 'body' ) ).removeClass('sidebar-collapse');
        }else{
            angular.element( document.querySelector( 'body' ) ).addClass('sidebar-collapse');
        }
    }
    if (typeof($cookieStore.get('userrole')) != 'undefined' && $cookieStore.get('userrole') > 0) {
        $rootScope.userrole = $cookieStore.get('userrole');

    }
    if (typeof($cookieStore.get('userid')) != 'undefined' && $cookieStore.get('userid') > 0) {
        $rootScope.userid = $cookieStore.get('userid');

    }
    if (typeof($cookieStore.get('useremail')) != 'undefined' && $cookieStore.get('useremail') > 0) {
        $rootScope.useremail = $cookieStore.get('useremail');

    }
    if (typeof($cookieStore.get('userroleid')) != 'undefined' && $cookieStore.get('userroleid') > 0) {
        $rootScope.userroleid = $cookieStore.get('userroleid');

    } if (typeof($cookieStore.get('userfullname')) != 'undefined' && $cookieStore.get('userfullname')!='') {
        $rootScope.userfullname = $cookieStore.get('userfullname');

    }


    console.log($rootScope.userid);


    $rootScope.logout = function () {
        $(".editableicon").remove();
        $cookieStore.remove('userid');
        $cookieStore.remove('userroleid');
        $cookieStore.remove('userrole');
        $cookieStore.remove('useremail');
        $cookieStore.remove('userfullname');

        $rootScope.userrole='';
        $rootScope.userfullname='';
        $rootScope.useremail='';
        $rootScope.userid=0;
        $rootScope.userroleid=0;

        // console.log('in logout');
        $state.go('index');
    }


});

r1headzappvar.controller('header', function($compile,$scope,$state,$http,$cookieStore,$rootScope,Upload,$uibModal,$sce,$stateParams,$window,$timeout) {
    $rootScope.userrole='';
    $rootScope.userfullname='';
    $rootScope.useremail='';
    $rootScope.userid=0;
    $rootScope.userroleid=0;
    $rootScope.shippingprice=0.00;
    $rootScope.saletax=0.00;

    if (typeof($cookieStore.get('userrole')) != 'undefined' && $cookieStore.get('userrole') > 0) {
        $rootScope.userrole = $cookieStore.get('userrole');

    }
    if (typeof($cookieStore.get('userid')) != 'undefined' && $cookieStore.get('userid') > 0) {
        $rootScope.userid = $cookieStore.get('userid');


    }
    if (typeof($cookieStore.get('useremail')) != 'undefined' && $cookieStore.get('useremail') > 0) {
        $rootScope.useremail = $cookieStore.get('useremail');

    }
    if (typeof($cookieStore.get('userroleid')) != 'undefined' && $cookieStore.get('userroleid') > 0) {
        $rootScope.userroleid = $cookieStore.get('userroleid');

    } if (typeof($cookieStore.get('userfullname')) != 'undefined' && $cookieStore.get('userfullname')!='') {
        $rootScope.userfullname = $cookieStore.get('userfullname');

    }
    $rootScope.rootUserid='';
    $rootScope.rootUserroleid='';
   // console.log($cookieStore.get('userroleid'));
    if(typeof ($cookieStore.get('userid'))!='undefined' && typeof ($cookieStore.get('userroleid'))!='undefined' && $cookieStore.get('userroleid')==2){
        // && typeof($cookieStore.get('userroleid'))!='undefined' && typeof($cookieStore.get('userroleid'))==2
        $rootScope.rootUserid=$cookieStore.get('userid');
        $rootScope.rootUserroleid=$cookieStore.get('userroleid');
    }else{
        $(".editableicon").remove();

        $timeout(function(){
            $scope.removeBtn();
        },2000);

    }
    /* && $rootScope.rootUserroleid==''*/
    $scope.removeBtn = function(){
        if($rootScope.rootUserid == '' && $rootScope.rootUserroleid=='' && $rootScope.rootUserroleid!=2 ){
            $(".editableicon").remove();
            $timeout(function(){
                $scope.removeBtn();
            },5000);
        }
    }
    setTimeout(function(){

        if($rootScope.userid == 0)  $rootScope.cartuser=$cookieStore.get('randomid');
        else {
            $rootScope.cartuser = $rootScope.userid;
        }

        //$rootScope.carttotal=parseInt(carttotal.getcontent($scope.adminUrl+'cart/carttotal?user='+$rootScope.cartuser));
        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'cartdetails',
            data    : $.param({'userid':$rootScope.cartuser}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

        }).success(function(data) {
            var totalquantity1=0;
            var totalprice1=0.00;
            $rootScope.cartarray = data;
            console.log($rootScope.cartarray);
            angular.forEach($rootScope.cartarray, function (value, key) {

                totalquantity1 +=parseInt(value.qty);
                totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
            })
            $rootScope.totalquantity=totalquantity1;
            $rootScope.totalprice=totalprice1;
            $rootScope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
        });


    },2000);

    $rootScope.addtocart=function(pid){
         var quan;
        quan=$('.proqtyinput').val();
        if(typeof(quan)!='undefined'){
            quan=quan;
        }
        else{
            quan=1;
        }
        //console.log(quan);
        if($rootScope.userid == 0)
        {
            $rootScope.cartuser=$cookieStore.get('randomid');
        }

        else {
            $rootScope.cartuser = $rootScope.userid;
                $http({
                    method:'POST',
                    async:false,
                    url:$scope.adminUrl+'updatecartuser',
                    data    : $.param({'newuserid':$rootScope.userid,'olduserid':$cookieStore.get('randomid')}),
                    headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

                }).success(function(data){

                });
        }
        $http({

            method:'POST',
            async:false,
            url:$scope.adminUrl+'addtocart',
            data    : $.param({'pid':pid,'qty':quan,'userid':$rootScope.cartuser}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

        }).success(function(data){
           var totalquantity=0;
           var totalprice=0.00;
            $rootScope.carttotal=parseInt($rootScope.carttotal+parseInt($('#quantity').val()));
            $rootScope.cartarray = data;
            $rootScope.cartarray2 = data.cartarr;
            angular.forEach($rootScope.cartarray, function (value, key) {

                 totalquantity +=parseInt(value.qty);
                totalprice +=parseFloat(value.price)*parseInt(value.qty);
            })
            $rootScope.totalquantity=totalquantity;
            $rootScope.totalprice=totalprice;
           $('html, body').animate({ scrollTop: 0 }, 1000);



            $('.carthome').addClass('open');


        });
    }

    $rootScope.appointment=function(){


        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'appointmentmodal.html',
            controller: 'ModalInstanceCtrl',
            size: 'md',
            scope: $scope
        });
    }

    $rootScope.logout = function () {
        $(".editableicon").remove();
        $cookieStore.remove('userid');
        $cookieStore.remove('userroleid');
        $cookieStore.remove('userrole');
        $cookieStore.remove('useremail');
        $cookieStore.remove('userfullname');

        $rootScope.userrole='';
        $rootScope.userfullname='';
        $rootScope.useremail='';
        $rootScope.userid=0;
        $rootScope.userroleid=0;

        // console.log('in logout');
        $state.go('index');


    }
    $rootScope.caturl=function(name){
        var myStr;
         myStr = name
        myStr=myStr.toLowerCase();
        myStr=myStr.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,"");   //this one
        myStr=myStr.replace(/\s+/g, "-");
        return myStr;
    }

    $rootScope.editlogo=function(ev){
        var target = ev.target || ev.srcElement || ev.originalTarget;
           $(target).parent().parent().css('display','block');
           $(target).parent().next().css('top','55px').css('display','block');
    }
    $rootScope.editbannerhide=function(ev){
        var target = ev.target || ev.srcElement || ev.originalTarget;
        $("#195").find('.editableicon ').css('display','none');
        console.log($("#195").html());
    }
    $rootScope.headhover=function(){
        $("#195").find('.editableicon ').css('display','block');
    }

});



