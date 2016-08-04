'use strict';

/* App Module */
var common_module_app = angular.module('common_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);







common_module_app.controller('login', function($scope,$state,$cookieStore,$rootScope,$http,contentservice) {

    $scope.submitForm = function(){

        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'login',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {

          //  console.log(data);

            //$rootScope.stateIsLoading = false;
            if(data.error == 1){
                // console.log(data);
                $('.error').html(data.msg);
            }else{
                $cookieStore.put('userid',data.res[0].id);
                $cookieStore.put('useremail',data.res[0].email);
                $cookieStore.put('userrole',data.res[0].role);
                $cookieStore.put('userroleid',data.res[0].role_id);
                $cookieStore.put('userfullname',data.res[0].fname+' '+data.res[0].lname);

                $http({
                    method:'POST',
                    async:false,
                    url:$scope.adminUrl+'updatecartuser',
                    data    : $.param({'newuserid':data.res[0].id,'olduserid':$cookieStore.get('randomid')}),
                    headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

                }).success(function(data){

                });

                console.log($rootScope.cartarray);

                if(typeof($rootScope.goafterlogin) != 'undefined'){
                    if($rootScope.goafterlogin != ''){
                        $scope.dfgfd = $rootScope.goafterlogin;
                        $rootScope.goafterlogin = ''
                        $state.go($scope.dfgfd);
                        return
                    }
                }


                if(data.res[0].role_id==2){
                        $state.go('dashboard');
                    return;
                }
                else{
                        $state.go('profile');
                    return;
                }


            }



        });


    }

});
common_module_app.controller('forgotpassword', function($scope,$state,$http,$cookieStore,$rootScope) {
    $scope.forgotpasssubmit = function(){
        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'forgotpassword',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if(data.error == 0){
                $cookieStore.put('forgotpass_user_id',data.userdetails[0].id);
                $cookieStore.put('forgotpass_user_email',data.userdetails[0].email);

                $rootScope.user_id=$cookieStore.get('forgotpass_user_id');
                $rootScope.user_email=$cookieStore.get('forgotpass_user_email');

                $state.go('forgot-password-check');


            }else{
                $scope.errormsg = data.msg;
            }

        });
    }
});
common_module_app.controller('forgotpasswordcheck', function($scope,$state,$http,$cookieStore,$rootScope,contentservice) {
    if(typeof($cookieStore.get('forgotpass_user_email'))!='undefined' ){
        $scope.form={email:$cookieStore.get('forgotpass_user_email')}
    }
  //  $scope.form={email:$rootScope.user_email}
    $scope.errormsg='';
    $scope.forgotpasschecksubmit = function(){
        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'forgotpassaccesscheck',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            console.log(data)
;            $rootScope.stateIsLoading = false;
            if(data.error == 0){
                $state.go('change-password');
                return

            }else{
                $scope.errormsg = data.msg;
            }

        });
    }
});

common_module_app.controller('changepassword', function($scope,$state,$http,$cookieStore,$rootScope,contentservice) {
    if(typeof($cookieStore.get('forgotpass_user_email'))!='undefined' ){
        $scope.email=$cookieStore.get('forgotpass_user_email');
    }
    if(typeof($cookieStore.get('forgotpass_user_id'))!='undefined' ){
        $scope.user_id=$cookieStore.get('forgotpass_user_id');
    }
    $scope.form={email:$scope.email,user_id:$scope.user_id};
    $scope.changepassFormSubmit = function(){
        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'changepasswords',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if(data.error ==0){
                $state.go('login');
                return

            }else{
                $scope.errormsg = data.msg;
            }

        });
    }
});




common_module_app.controller('signup', function($scope,$http,$sce,$state,$cookieStore,$rootScope,$uibModal,$timeout,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.usertype='generaluser';
    $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'statelist',
        data    : $.param({'country_id':254}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.stateList=data;
        $scope.shipstateList=data;
    });

  //  $scope.form={type:$scope.usertype,userrole:3,status:0};
    $scope.submitsignupForm=function(){
      //  $scope.form={state_id:$scope.form.state.id}
        $scope.form.state=$scope.form.state.id;
        $scope.form.type=$scope.usertype;
        $scope.form.userrole=3;
        $scope.form.status=0;
        $scope.errormsg='';
        $http({

            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'addadmin',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            console.log(data);
            //$rootScope.stateIsLoading = false;
            $scope.loginurl='login';
            if(data.error == 1){
                $scope.errormsg='This email address is already registered. <a href="'+$scope.loginurl+'">Please login here</a>';
            }else{
                $scope.signup.reset();
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'signupsuccess.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    scope:$scope
                });

                setTimeout(function(){
                    modalInstance.dismiss('cancel');
                    //  $('.logpopup').hide();

                    // $window.location.href = $scope.baseUrl+'home';
                    $state.go('login');
                    return;

                },4000)
            }



        });
    }






});
common_module_app.controller('signupactivate', function($scope,$http,$sce,$state,$cookieStore,$stateParams,$rootScope,$uibModal,$timeout,contentservice) {
    $scope.link=$stateParams.link;
    if(typeof($scope.link)!='undefined' && $scope.link!='') {
        $http({
            method: 'POST',
            async: false,
            url: $scope.adminUrl + 'userupdatestatus',
            data: $.param({link: $scope.link}),  // pass in data as strings
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
            if(data.error==0){
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'acountsuccess.html',
                    controller: 'ModalInstanceCtrl',
                    size: 'lg',
                    scope: $rootScope
                });

               setTimeout(function () {
                    modalInstance.dismiss('cancel');
                    $state.go('login');
                }, 4000)

                // $rootScope.stateIsLoading = false;
                // $scope.userlist[idx].status = !$scope.userlist[idx].status;
            }
            else{
                $state.go('index');
            }
        });



    }

    $scope.cancel1=function(){
        modalInstance.dismiss('cancel');
    }


});



common_module_app.controller('home', function($scope,$state,$cookieStore,$rootScope,$http,$sce,contentservice) {
$scope.trustAsHtml=$sce.trustAsHtml;
var productarr=[];
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'servicecategorylist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.servicecategorylist=data;

    })
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'serviceproductlist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.serviceproductlist=data;
        //console.log($scope.serviceproductlist);

    })

  /*  var cat_arra=[];
    var product_arr=[];
    angular.forEach($scope.servicecategorylist, function(val){
        console.log(val);
        angular.forEach($scope.serviceproductlist, function(val1){
            console.logh(val1);
            cat_arra.push(val1);
            cat_arra[val.cat_name]=cat_arra;
            //consol.log();
        })
        product_arr.push(cat_arra);
    })
    console.log(product_arr);*/
    /*$scope.caturl=function(name){
        var myStr = name
        myStr=myStr.toLowerCase();
        myStr=myStr.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,"");   //this one
        myStr=myStr.replace(/\s+/g, "-");
        return myStr;
    }*/




});

common_module_app.controller('aboutus', function($scope,$state,$cookieStore,$rootScope,contentservice) {

});



common_module_app.controller('contactus', function($scope,$http,$sce,$state,$cookieStore,$rootScope,$uibModal,$timeout,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.errormsg='';
    $scope.form={};
     $scope.randomvalue=makeid().toLowerCase();
        $scope.contactsignupForm=function(){
            $scope.errormsg='';
            if(typeof($scope.form.captcha)!='undefined') {
                if ($scope.form.captcha.toLowerCase() == $scope.randomvalue) {
                    $http({

                        method: 'POST',
                        async: false,
                        url: $scope.adminUrl + 'contactsubmit',
                        data: $.param($scope.form),  // pass in data as strings
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function (data) {
                        console.log(data);
                        //$rootScope.stateIsLoading = false;
                        $scope.contact.reset();
                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: 'contactsuccess.html',
                            controller: 'ModalInstanceCtrl',
                            size: 'lg',
                            scope: $scope
                        });

                        $timeout(function () {

                            modalInstance.dismiss('cancel');
                            modalInstance.dismiss('cancel123');

                            //  $('.logpopup').hide();

                            // $window.location.href = $scope.baseUrl+'home';
                            // $state.go('login');
                            // return;

                        }, 4000)


                    });
                }
                else {
                    $scope.errormsg = 'Invalid capctha';
                }
            }
            else{
                $scope.errormsg = 'Captcha can not be blank';
            }
        }

        $scope.randrefresh=function(){
            $scope.randomvalue=makeid().toLowerCase();

        }

});


common_module_app.controller('reviews', function($scope,$state,$cookieStore,$rootScope,contentservice) {

});
common_module_app.controller('appointment', function($scope,$state,$cookieStore,$rootScope,contentservice,$compile,$timeout) {

    $timeout( function(){
        console.log('in timeout');
    var res= $('.appoinmentdiv');
    $compile(res)($scope);
    }, 10000);

});


common_module_app.controller('newsletter', function($scope,$http,$sce,$state,$cookieStore,$rootScope,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.predicate = 'priority';
    $scope.reverse = true;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
    $scope.currentPage=1;
    $scope.perPage=3;

    $scope.totalItems = 0;

    $scope.filterResult = [];

    $http({
        method  : 'GET',
        async:   false,
        url     : $scope.adminUrl+'newsletterlist',
        // data    : $.param($scope.form),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.itemlist=data;
    });


});
common_module_app.controller('newsletterdetails', function($scope,$state,$http,$sce,$stateParams,$cookieStore,$rootScope,contentservice) {
    $scope.id=$stateParams.id;
    $scope.trustAsHtml=$sce.trustAsHtml;
    $http({
        method  : 'POST',
        async:   false,
        url     :     $scope.adminUrl+'newsletterdetails',
        data    : $.param({'id':$scope.id}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {

      $scope.details=data[0];
        // console.log(data);

    });
});

common_module_app.controller('locations', function($scope,$state,$cookieStore,$rootScope,contentservice) {

});
common_module_app.controller('treatmentandservices', function($scope,$state,$cookieStore,$rootScope,$http,$sce,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.predicate = 'priority';
    $scope.reverse = true;
    var productarr=[];
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'servicecategorylist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){

        $scope.servicecategorylist=data;

    })
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'serviceproductlist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.serviceproductlist=data;
      //  console.log($scope.serviceproductlist);

    })
    /*$scope.caturl=function(name){
        var myStr = name
        myStr=myStr.toLowerCase();
        myStr=myStr.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,"");   //this one
        myStr=myStr.replace(/\s+/g, "-");
        return myStr;
    }*/

});

common_module_app.controller('treatmentandservicesinnerpage', function($scope,$state,$cookieStore,$http,$stateParams,$sce,$rootScope,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.id=$stateParams.id;
    $scope.name=$stateParams.name;
    $scope.predicate = 'priority';
    $scope.reverse = true;
   // console.log($scope.id);

    $http({
        method  :   'POST',
        async   :   false,

        url :       $scope.adminUrl+'categorydetails',
        data    : $.param({'id':$scope.id}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.categorydetails=data;
        //console.log($scope.serviceproductlist);

    })

    $http({
        method  :   'POST',
        async   :   false,

        url :       $scope.adminUrl+'serviceproductlistbycategory',
        data    : $.param({'id':$scope.id}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.servicecategorywiseproductlist=data;
        //console.log($scope.serviceproductlist);
        if(data.length>4){
            $('.treatmentnservicesinnerpageblock1right').css('background','none');
        }
        if(data.length==1){
            $('.single_col-md-4_textcon').css('width','96%');
            $('.treatmentnservicesinnerpageblock1right').css('background','none');
        }

    })
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'servicecategorylist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.servicecategorylist=data;

    })


$scope.showservice=function(){
    $('html, body').animate({
        scrollTop: $(".innerpageblock2right").offset().top
    }, 2000);
}
        // Handler for .ready() called.





});

common_module_app.controller('products', function($scope,$state,$cookieStore,$rootScope,$sce,$http,contentservice) {

});

common_module_app.controller('productlisting', function($scope,$state,$cookieStore,$sce,$http,$stateParams,$rootScope,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.id=$stateParams.id;
    $scope.predicate = 'id';
    $scope.reverse = true;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
    $scope.currentPage=1;
    $scope.perPage=10;

    $scope.totalItems = 0;

    $scope.filterResult = [];

    /**==========Get product listing Start============**/
    $http({
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'allproductlistbycategory',
            data    : $.param({'id':$scope.id}),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.productlist=data;
    });
    /**==========End product listing============**/


    /**==========Get category listing Start============**/
    $http({
        method  : 'GET',
        async:   false,
        url     : $scope.adminUrl+'productcategorylist',
        // data    : $.param($scope.form),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
        // console.log(data);
        $scope.categorylist=data;
        var obj={'id':0,'cat_name':'all'};

        $scope.docs=$scope.categorylist;
        //$scope.docs.push(obj);
        $scope.docs.unshift(obj);

        /*$rootScope.var1=name;
        $rootScope.var1= $rootScope.var1.toLowerCase();
        $rootScope.var1= $rootScope.var1.replace(/(^\s+|[^a-zA-Z0-9 ]+|\s+$)/g,"");   //this one
        $rootScope.var1= $rootScope.var1.replace(/\s+/g, "-");*/

        //console.log($scope.docs);
        //$scope.docs.push({''})
    });
    /**==========End category listing============**/
   /* $scope.searchkey = '';

    $scope.search = function(item){

        if ( (item.product_name.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ||  (item.status.toString().indexOf($scope.searchkey) != -1) || (item.cat_name.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) || (item.product_desc.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) || (item.payout.toString().indexOf($scope.searchkey) != -1) || (item.credits.toString().indexOf($scope.searchkey) != -1) ){
            return true;
        }
        return false;
    };*/

    /*$scope.docs = [{"doc":"http://google.com","monthShort":"Jun","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/tJeEsknLWq8")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/golMylAWyDk")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/93EVFCZmW9U")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/HO6IOLuX8BM")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/Dh-q-ukxIwk")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/hUNNA0aWaFw")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/Zp8OpekkyzQ")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/SPr-Ifx3138")},
        {"doc":"http://google.com","monthShort":"Mai","year":2013,"iframeurl":$sce.trustAsResourceUrl("https://www.youtube.com/embed/t9TSnUt-jv8")},
    ];*/
});

common_module_app.controller('productdetails', function($scope,$state,$cookieStore,$sce,$http,$stateParams,$rootScope,contentservice) {




    $scope.id=$stateParams.id;
    $scope.trustAsHtml=$sce.trustAsHtml;
    $http({
        method  : 'POST',
        async:   false,
        url     :     $scope.adminUrl+'productdetails',
        data    : $.param({'id':$scope.id}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {

       $scope.productdetails=data[0];

        $scope.productimage = [];

        if(data[0].addfile != '')
            $scope.productimage=JSON.parse(data[0].addfile);
//console.log($scope.productimage);
        $scope.productimage.splice(0, 0, data[0].product_file);
        $scope.bigimage = data[0].product_file;

    });

    $scope.showImage = function(item){
        $scope.bigimage = item;
    }


    var quan;
    $scope.addquan=function(){
        quan=$('.proqtyinput').val();
        $('.proqtyinput').val(parseInt(quan)+1);

    }
    $scope.removequan=function(){
        quan=$('.proqtyinput').val();
        if(quan > 1){
            $('.proqtyinput').val(parseInt(quan)-1);
        }
    }

    /**==========Get category listing Start============**/
    $http({
        method  : 'GET',
        async:   false,
        url     : $scope.adminUrl+'productcategorylist',
        // data    : $.param($scope.form),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
        // console.log(data);
        $scope.categorylist=data;
        var obj={'id':0,'cat_name':'all'};
        $scope.docs=$scope.categorylist;
       // $scope.docs.push(obj);
        $scope.docs.unshift(obj);
        //console.log($scope.docs);
        //$scope.docs.push({''})
    });
    /**==========End category listing============**/


    $http({
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'allproductlist',
        //data    : $.param({'id':$scope.id}),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.products=data;
	    $rootScope.productslists=data;


    });
    setTimeout(function(){
        $('.bxslider').show();
        $('.imggalbxslider').show();
        $('.bxslider').bxSlider({
            slideWidth: 291,
            minSlides: 1,
            maxSlides: 4,
            slideMargin: 3,
            nextSelector: '#slider-next',
            prevSelector: '#slider-prev',
            auto:true
        });

        $('.imggalbxslider').bxSlider({
            minSlides: 3,
            maxSlides: 3,
            slideWidth: 63,
            slideheight: 63,
            slideMargin: 10,
            auto: true
        });
        //
    },2000);


});
common_module_app.controller('shoppingcart', function($scope,$state,$http,$sce,$stateParams,$cookieStore,$rootScope,contentservice,$uibModal) {
    $scope.id=$stateParams.id;
    $scope.trustAsHtml=$sce.trustAsHtml;

    var quan;

        $scope.addqty=function(pid){
          //  console.log(pid);
        quan=$('#cartquantity'+pid).val();
        $('#cartquantity'+pid).val(parseInt(quan)+1);
            $http({
                method:'POST',
                async:false,
                url:$scope.adminUrl+'updatecart',
                data    : $.param({'pid':pid,'qty':$('#cartquantity'+pid).val(),'userid':$rootScope.cartuser}),
                headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

            }).success(function(data){
                var totalquantity1=0;
                var totalprice1=0.00;
                $rootScope.cartarray = data;
                angular.forEach($rootScope.cartarray, function (value, key) {

                    totalquantity1 +=parseInt(value.qty);
                    totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
                })
                $rootScope.totalquantity=totalquantity1;
                $rootScope.totalprice=totalprice1;
                $rootScope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
            });

         }
         $scope.delqty=function(pid){
            quan=$('#cartquantity'+pid).val();
            if(quan > 1){
            $('#cartquantity'+pid).val(parseInt(quan)-1);
                $http({
                    method:'POST',
                    async:false,
                    url:$scope.adminUrl+'updatecart',
                    data    : $.param({'pid':pid,'qty':$('#cartquantity'+pid).val(),'userid':$scope.cartuser}),
                    headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

                }).success(function(data){
                    var totalquantity1=0;
                    var totalprice1=0.00;
                    $rootScope.cartarray = data;
                    angular.forEach($rootScope.cartarray, function (value, key) {

                        totalquantity1 +=parseInt(value.qty);
                        totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
                    })
                    $rootScope.totalquantity=totalquantity1;
                    $rootScope.totalprice=totalprice1;
                    $rootScope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
                });

            }
         }

    $scope.removecart=function(pid){
        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'removecart',
            data    : $.param({'pid':pid,'userid':$rootScope.cartuser}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

        }).success(function(data){
            var totalquantity1=0;
            var totalprice1=0.00;
            $rootScope.cartarray = data;
            angular.forEach($rootScope.cartarray, function (value, key) {

                totalquantity1 +=parseInt(value.qty);
                totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
            })
            $rootScope.totalquantity=totalquantity1;
            $rootScope.totalprice=totalprice1;
            $rootScope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
        });

    }
    $rootScope.subtotal=function(item1,item2){
        return parseFloat(item1*item2);
    }

    $http({
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'allproductlist',
        //data    : $.param({'id':$scope.id}),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.products=data;
    });

    setTimeout(function(){
        $('.bxslider').show();
        $('.bxslider').bxSlider({
            slideWidth: 291,
            minSlides: 1,
            maxSlides: 4,
            slideMargin: 3,
            nextSelector: '#slider-next',
            prevSelector: '#slider-prev',
            auto:true
        });
        //
    },2000);

    $scope.chklogin = function(){
        console.log($rootScope.userid);
        if($rootScope.userid == 0){

            $rootScope.goafterlogin = 'checkout';

            $uibModal.open({
                animation: true,
                templateUrl: 'chkloginpopup',
                controller: 'ModalInstanceCtrlnew',
                size: 'md',
                scope:$scope
            });
        }else{
            $state.go('checkout');
            return
        }
    }



});
common_module_app.controller('checkout', function($scope,$state,$http,$sce,$stateParams,$cookieStore,$rootScope,$uibModal,$timeout,contentservice) {
    $scope.cartform={};
    $scope.cartform.card_type=1;
 //  console.log($cookieStore.get('userid'));
   // console.log($cookieStore.get('checkoutform'));
    /*if (typeof($cookieStore.get('userid')) == 'undefined') {
       // $state.go('login');
       var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'checkoutlogin.html',
            controller: 'ModalInstanceCtrl',
            size: 'lg',
            scope: $scope
        });

         $timeout(function () {

         modalInstance.dismiss('cancel');
         modalInstance.dismiss('cancel123');
             $state.go('login');
         }, 4000)



    }*/


    $rootScope.subtotal=function(item1,item2){
        return parseFloat(item1*item2).toFixed(2);
    }

    if($rootScope.userid == 0)
        $scope.cartuser=$cookieStore.get('randomid');
    else {
        $scope.cartuser = $scope.userid;
    }

    $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'cartdetails',
        data    : $.param({'userid':$scope.cartuser}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data) {
        var totalquantity1=0;
        var totalprice1=0.00;
        $scope.cartarray = data;
        angular.forEach($scope.cartarray, function (value, key) {

            totalquantity1 +=parseInt(value.qty);
            totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
        })
        $scope.totalquantity=totalquantity1;
        $scope.totalprice=totalprice1;
        $scope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
    });

    $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'statelist',
         data    : $.param({'country_id':254}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.stateList=data;
        $scope.shipstateList=data;
    });

    $scope.billform = {
        'userid':$rootScope.userid,
        'cartuser':$scope.cartuser,
        'company':'',
        'address2':'',
        'prevaddress1':'',
        'stateid':0,
        'billshipchk':true
    }

    $scope.shipform = {
        'userid':$rootScope.userid,
        'stateid':0,
        'company':'',
        'address2':''
    }

    $scope.cardyear=[];

    var d = new Date();
    var n = d.getFullYear();

    var i;

    for(i = n; i<(n+40);i++){
        $scope.cardyear.push(i);
    }

    $scope.err='';
    $scope.termsValidator=function(){
        if($scope.checkout.$submitted){
            if(typeof ($("input[name='terms']:checked").val()) != 'undefined' )      {
                $scope.terms_error=false;
                return true ;
            } else {
                $scope.terms_error=true;
                return '';
            }
        }
    }

    if(typeof($cookieStore.get('checkoutform')) != 'undefined'){
        $scope.checkoutform = $cookieStore.get('checkoutform');

        $scope.billform = $scope.checkoutform.billform;

        if(!$scope.billform.billshipchk){
            $scope.shipform = $scope.checkoutform.shipform;
        }

        $scope.cartform = $scope.checkoutform.cartform;
        console.log($scope.cartform);
    }
    $scope.checkoutsubmit = function(){
        $scope.terms_error=false;
        $('.errormsg1').hide();

        if(typeof ($scope.billform.state) != 'undefined' && typeof ($scope.billform.state.id) != 'undefined'){
            $scope.billform.stateid = $scope.billform.state.id;
        }

        if(typeof ($scope.shipform.state) != 'undefined' && typeof ($scope.shipform.state.id) != 'undefined'){
            $scope.shipform.stateid = $scope.shipform.state.id;
        }

        $scope.form = {
            billform : $scope.billform,
            shipform : $scope.shipform,
            product_det : $scope.cartarray,
            subtotal : $scope.totalprice,
            shippingprice : $rootScope.shippingprice,
            saletax : $rootScope.saletax,
            total : $scope.alltotalprice,
            cartform : $scope.cartform
        }

        $cookieStore.put('checkoutform',$scope.form);

        $state.go('checkoutconfirmation');
        return;


    }


});

common_module_app.controller('checkoutconfirmation', function($scope,$state,$cookieStore,$rootScope,contentservice,$http,$uibModal,$timeout) {

    if($rootScope.userid == 0)
        $scope.cartuser=$cookieStore.get('randomid');
    else {
        $scope.cartuser = $scope.userid;
    }
 /*   $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'cartdetails',
        data    : $.param({'userid':$scope.cartuser}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data) {
        var totalquantity1=0;
        var totalprice1=0.00;
        $scope.cartarray = data;
        angular.forEach($scope.cartarray, function (value, key) {

            totalquantity1 +=parseInt(value.qty);
            totalprice1 +=parseFloat(value.price)*parseInt(value.qty);
        })
        $scope.totalquantity=totalquantity1;
        $scope.totalprice=totalprice1;
        $scope.alltotalprice=totalprice1+$rootScope.shippingprice+$rootScope.saletax;
    });
*/
    $scope.checkoutform = $cookieStore.get('checkoutform');

    $scope.product_det = $scope.checkoutform.product_det;

    if($scope.checkoutform.billform.billshipchk){
        $scope.shipform = $scope.checkoutform.billform;
    }else{
        $scope.shipform = $scope.checkoutform.shipform;
    }

    $scope.cartform = $scope.checkoutform.cartform;
    console.log($scope.shipform);

    $rootScope.subtotal=function(item1,item2){
        return parseFloat(item1*item2);
    }

    $scope.statename = '';
    $scope.shipstatename = '';

    $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'statelist',
        data    : $.param({'country_id':254}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){

        angular.forEach(data,function(value){

            if(value.id == $scope.shipform.stateid){
                $scope.shipstatename = value.s_st_name;
            }
        });
    });

    $scope.addorder = function(){
        $scope.form = {
            user_id:$scope.checkoutform.billform.userid,
            subtotal:$scope.checkoutform.subtotal,
            total:$scope.checkoutform.total,
            tax:$scope.checkoutform.saletax,
            shipping_charge:$scope.checkoutform.shippingprice,
            bill_name:$scope.checkoutform.billform.bname,
            bill_company:$scope.checkoutform.billform.company,
            bill_address:$scope.checkoutform.billform.address,
            bill_address2:$scope.checkoutform.billform.address2,
            bill_city:$scope.checkoutform.billform.city,
            bill_state:$scope.checkoutform.billform.stateid,
            bill_zip:$scope.checkoutform.billform.zip,
            bill_phone:$scope.checkoutform.billform.phone,
            bill_email:$scope.checkoutform.billform.email,
            ship_name:$scope.shipform.bname,
            ship_company:$scope.shipform.company,
            ship_address:$scope.shipform.address,
            ship_address2:$scope.shipform.address2,
            ship_city:$scope.shipform.city,
            ship_state:$scope.shipform.stateid,
            ship_zip:$scope.shipform.zip,
            ship_phone:$scope.shipform.phone,
            card_no:$scope.cartform.card_no,
            card_exp_mon:$scope.cartform.card_exp_mon,
            card_exp_year:$scope.cartform.card_exp_year,
            cvv:$scope.cartform.cvv_code,
            transaction_id:0,
            product_det:JSON.stringify($scope.product_det)
        }



            $http({
                method:'POST',
                async:false,
                url:'http://authorize.influxiq.com',
                data    : $.param($scope.form),
                headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data){
                if(data.error == 0){
                    $scope.form.transaction_id = data.transaction_id;

                    $http({
                        method:'POST',
                        async:false,
                        url:$scope.adminUrl+'addorder',
                        data    : $.param($scope.form),
                        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function(data){
                        $cookieStore.remove('checkoutform');
                         $cookieStore.put('orderid',data);

                         $http({
                         method:'POST',
                         async:false,
                         url:$scope.adminUrl+'allremovecart',
                         data    : $.param({'userid':$scope.cartuser}),
                         headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
                         }).success(function(data){
                         $state.go('ordersuccess');
                         return;
                         });

                    });
                }else{
                    $scope.uibmodalIs= $uibModal.open({
                        animation: true,
                        template: '<div class="newlogin-box">\
                        <div class="newloginwrapper">\
                        <div class="newaccountbtnwrapper">\
                        <h2>'+data.msg+'</h2>\
                    </div>\
                    </div>\
                    </div>',
                        size: 'lg',
                        scope: $scope
                    });

                    $timeout(function(){
                        $scope.uibmodalIs.dismiss('cancel');
                    },4000);
                }
            });




    }

});

common_module_app.controller('ordersuccess', function($scope,$state,$cookieStore,$rootScope,contentservice,$http) {
//console.log($cookieStore.get('orderid'));
    if(typeof($cookieStore.get('orderid')) == 'undefined' ){
        $state.go('index');
        return;
    }else{
        $scope.orderid = $cookieStore.get('orderid');
    }

    //console.log($scope.orderid.order_id);
    $rootScope.subtotal=function(item1,item2){
        return parseFloat(item1*item2);
    }

    $scope.statename = '';
    $scope.shipstatename = '';

    $http({
        method:'POST',
        async:false,
        url:$scope.adminUrl+'orderdetails',
        data    : $.param({'order_id':$scope.orderid.order_id}),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.orderDet = data;

        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'statelist',
            data    : $.param({'country_id':254}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data2){
            angular.forEach(data2,function(value){
                if(value.id == data.bill_state){
                    $scope.statename = value.s_st_name;
                }
                if(value.id == data.ship_state){
                    $scope.shipstatename = value.s_st_name;
                }
            });
        });

      //  console.log($scope.orderDet);


    });

    $scope.getstatus=function(status) {
        var stat;
        if (status == 1) {
            stat = 'Pending';
        }
        if (status == 2) {
            stat = 'In Progress';
        }
        if (status == 3) {
            stat = 'Shipped';
        }
        if (status == 4) {
            stat = 'Cancelled';
        }
        return stat;
    }

});



common_module_app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {
    $scope.cancel123=function(){
        $uibModalInstance.dismiss('cancel');
    }

    $scope.cancel111 = function () {

        $rootScope.goafterlogin = '';

        $uibModalInstance.dismiss('cancel');
    };
    $scope.chkasguest = function () {

        $rootScope.goafterlogin = '';

        $state.go('checkout');
        return;
    };


});

common_module_app.controller('ModalInstanceCtrlnew', function ($scope, $uibModalInstance,$rootScope,$state) {
    $scope.cancel111 = function () {

        $rootScope.goafterlogin = '';

        $uibModalInstance.dismiss('cancel');
    };
    $scope.chkasguest = function () {

        $rootScope.goafterlogin = '';

        $state.go('checkout');
        return;
    };


});

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



common_module_app.controller('productsliderCtrl', function($scope,$state,$cookieStore,$sce,$http,$stateParams,$rootScope,contentservice,$timeout) {

    $http({
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'allproductlist',
        //data    : $.param({'id':$scope.id}),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.docs=data;
    });

    /*$scope.addtocart=function(pid){
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
    }*/

    $scope.addtocart5 = function (pid) {
        console.log(2);
    }

$timeout(function() {
    

	$('.procartbtn2').click(function(){

		console.log(34);
	});
  }, 4000);

});
