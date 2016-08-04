'use strict';

/* App Module */
var myaccount_module_app = angular.module('myaccount_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);















myaccount_module_app.controller('profile', function($scope,$state,$cookieStore,$rootScope,$http,$sce,contentservice) {
$scope.trustAsHtml=$sce.trustAsHtml;
   // console.log($cookieStore.get('useremail'));
    if (typeof($cookieStore.get('userid')) != 'undefined' && $cookieStore.get('userid') > 0) {
        $rootScope.userid = $cookieStore.get('userid');
        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'admindetails',
            data    : $.param({'id':$rootScope.userid}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

        }).success(function(data) {
            $rootScope.userdetails=data[0];

        });

        $scope.editprofileformsubmit = function () {

            $rootScope.stateIsLoading = true;
            $http({
                method  : 'POST',
                async:   false,
                url     : $scope.adminUrl+'adminupdates',
                data    : $.param($scope.form),  // pass in data as strings
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }) .success(function(data) {
                $rootScope.stateIsLoading = false;
                $state.go('profile');
                return
            });
        }


    }
});
myaccount_module_app.controller('editprofile', function($scope,$state,$cookieStore,$rootScope,$http,$sce,contentservice) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    if (typeof($cookieStore.get('userid')) != 'undefined' && $cookieStore.get('userid') > 0) {
        $rootScope.userid = $cookieStore.get('userid');
        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'admindetails',
            data    : $.param({'id':$rootScope.userid}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

        }).success(function(data) {
            $rootScope.userdetails=data[0];
            $scope.form = {
                id: data[0].id,

                fname: data[0].fname,
                lname: data[0].lname,
                email: data[0].email,
                address: data[0].address,
                phone_no: data[0].phone_no,
                mobile_no: data[0].mobile_no,
            }

        });


        $scope.editprofileformsubmit = function () {

            $rootScope.stateIsLoading = true;
            $http({
                method  : 'POST',
                async:   false,
                url     : $scope.adminUrl+'adminupdates',
                data    : $.param($scope.form),  // pass in data as strings
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }) .success(function(data) {
                $rootScope.stateIsLoading = false;
                $state.go('profile');
                return
            });
        }

    }
});

myaccount_module_app.controller('userchangepassword', function($scope,$state,$http,$cookieStore,$rootScope) {
    if (typeof ($cookieStore.get('userid')) != 'undefined') {

        $scope.userid = $cookieStore.get('userid');
    }
    console.log($cookieStore.get('useremail'));
    if (typeof($cookieStore.get('useremail')) != 'undefined' && $cookieStore.get('useremail')!='') {
        $scope.useremail1 = $cookieStore.get('useremail');
        console.log($cookieStore.get('useremail'));

    }
    $scope.form={};
    console.log($scope.useremail);
    $scope.errormsg='';
    $scope.form.user_id=$scope.userid;
    $scope.form.user_mail=$scope.useremail1;
    $scope.changepasswordsubmit = function(){
        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'userchangepassword',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            console.log(data.error);
            $rootScope.stateIsLoading = false;
            if(data.error == 0){
                $state.go('profile');


            }else{
                $scope.errormsg = data.msg;
            }

        });
    }
});

myaccount_module_app.controller('myorder', function($scope,$state,$cookieStore,$rootScope,$http,$sce,contentservice) {
    if (typeof ($cookieStore.get('userid')) != 'undefined') {

        $rootScope.userid = $cookieStore.get('userid');
    }
    $scope.form = {
        from_date:'',
        to_date:'',
    }

    $scope.format = 'MM/dd/yyyy';

    $scope.setDate1 = function(){
        if(typeof($scope.form.to_date) != 'undefined'){
            $scope.maxDate = new Date($scope.form.to_date);
        }
    }

    $scope.setDate = function(){
        if(typeof($scope.form.from_date) != 'undefined'){
            $scope.minDate1 = new Date($scope.form.from_date);
        }
    }

    $scope.open11 = function() {
        $scope.opened1 = true;
    };

    $scope.open1 = function() {
        $scope.opened = true;
    };


    /*    $rootScope.type='affiliate';
     $http({
     method  : 'POST',
     async:   false,
     url     : $scope.adminUrl+'adminlist?type='+$rootScope.type,
     // data    : $.param($scope.form),  // pass in data as strings
     headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
     }) .success(function(data) {
     $scope.affiliatelist=data;
     //$scope.userlistp = $scope.userlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));


     });
     $scope.searchbyaffiliate=function(item){
     if(typeof(item)!='undefined'){
     $scope.searchkey = item.uid;
     }
     else{
     $scope.searchkey = '';
     }

     }*/
    $scope.searchbyOrderStatus=function(item){
        console.log(item);
        if(typeof(item)!='undefined'){
            $scope.searchkey1 = item.id;
        }
        else{
            $scope.searchkey1 = '';
        }

    }


    $scope.orderstatuslist = [
        {
            'id':1,
            'text':'Pending'
        },
        {
            'id':2,
            'text':'In Progress'
        },
        {
            'id':3,
            'text':'Shipped'
        },
        {
            'id':4,
            'text':'Canceled'
        }

    ]
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
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'accountorderlist',
            data    : $.param({'userid':$rootScope.userid}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
        $scope.orderlist=data;
        // $scope.userlistp = $scope.userlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));



        angular.forEach($scope.orderlist,function(value){
            value.dd_order_status = {
                id: value.order_status
            }
        });


    });

    $scope.searchkey = '';
    $scope.searchkey1 = '';
    $scope.searchkey3 = '';
    $scope.search = function(item){

        if ( (item.affiliate_id.toString().indexOf($scope.searchkey.toString()) != -1 )){
            return true;
        }
        return false;
    };

    $scope.search1 = function(item){

        if ( ( item.order_status.toString().indexOf($scope.searchkey1.toString()) != -1)){
            return true;
        }
        return false;
    };
    $scope.search3 = function(item){

        if ( ( item.transaction_id.toString().indexOf($scope.searchkey3.toString()) != -1)){
            return true;
        }
        return false;
    };
    $scope.searchdate = function(item){

        var from_time = 0;
        var to_time = 0;
        if($scope.form.from_date != null && typeof($scope.form.from_date) != 'undefined' && $scope.form.from_date != ''){
            var from_date1 = $scope.form.from_date;
            var from_date = from_date1.getDate();
            var from_mon = from_date1.getMonth();
            var from_year = from_date1.getFullYear();
            var d = new Date(from_year, from_mon, from_date, 0, 0, 0);
          /*  from_time = d.getTime()/1000;*/
            from_time = d.getTime();
        }
        if($scope.form.to_date != null && typeof($scope.form.to_date) != 'undefined' && $scope.form.to_date != ''){
            var to_date1 = $scope.form.to_date;
            var to_date = to_date1.getDate();
            var to_mon = to_date1.getMonth();
            var to_year = to_date1.getFullYear();
            var d = new Date(to_year, to_mon, to_date, 23, 59, 59);
          /*  to_time = d.getTime()/1000;*/
            to_time = d.getTime();

        }
        if(from_time == 0 && to_time == 0){


            return true;
        }
        else if(to_time == 0){
            if  (item.order_time > from_time) {
                return true;
            }else{
                return false;
            }
        }
        else if(from_time == 0){
            if (item.order_time < to_time){
                return true;
            }else{
                return false;
            }
        }else{
            if ( (item.order_time > from_time && item.order_time < to_time) ){
                return true;
            }else{
                return false;
            }
        }

    };


    $scope.changeOrderStatus = function(item){
        $rootScope.stateIsLoading = true;
        // console.log(item);
        var idx = $scope.orderlist.indexOf(item);
        console.log(item);
        console.log(idx);
        console.log($scope.orderlist[idx].dd_order_status);

        var o_status = $scope.orderlist[idx].dd_order_status.id;

        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'orderupdatestatus',
            data    : $.param({id: $scope.orderlist[idx].id,status:o_status}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
        });
    }
    $scope.duplicate_mail=function(id){
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'cart/duplicatemail',
            data    : $.param({id: id}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
        });

    }

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
            stat = 'Canceled';
        }
        return stat;
    }

});
myaccount_module_app.controller('myorderdetails', function($scope,$state,$cookieStore,$rootScope,$http,$sce,$stateParams,contentservice) {
    $scope.orderid=$stateParams.id;
    $scope.statename='';
    $scope.shipstatename='';
    $http({
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'orderdetails',
        data    : $.param({order_id:$scope.orderid}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $scope.orderdetails=data;
        console.log($scope.orderdetails.productdet);
        $http({
            method:'POST',
            async:false,
            url:$scope.adminUrl+'statelist',
            data    : $.param({'country_id':254}),
            headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data2){
            console.log(data2);
            angular.forEach(data2,function(value){
                if(value.id == data.bill_state){
                    $scope.statename = value.s_st_name;
                }
                if(value.id == data.ship_state){
                    $scope.shipstatename = value.s_st_name;
                }
            });
        });


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
            stat = 'Canceled';
        }
        return stat;
    }
});
