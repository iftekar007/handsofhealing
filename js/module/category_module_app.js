'use strict';

/* App Module */
var category_module_app = angular.module('category_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);





category_module_app.controller('categorylist', function($scope,$state,$http,$cookieStore,$rootScope,$uibModal,$window,contentservice,$sce) {
    $scope.trustAsHtml=$sce.trustAsHtml;
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
    $http({
        method  : 'GET',
        async:   false,
        url     : $scope.adminUrl+'categorylist',
        // data    : $.param($scope.form),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
       // console.log(data);
        $scope.itemlist=data;
        console.log($scope.itemlist);


    });

    $scope.searchkey = '';

        $scope.search = function(item){

            if ( (item.cat_name.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ||(item.cat_url.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) || (item.cat_desc.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ||  (item.priority.toString().indexOf($scope.searchkey.toString()) != -1) ||  (item.status.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ||  (item.parent_name.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)){
                return true;
            }
            return false;
        };

    $scope.deleteitem = function(item,size){

        $scope.currentindex=$scope.itemlist.indexOf(item);

        $uibModal.open({
            animation: true,
            templateUrl: 'delconfirm.html',
            controller: 'ModalInstanceCtrlcategory',
            size: 'md',
            scope:$scope
        });
    }

    $scope.getstatus=function(status){
        if(status==1){
            $scope.stat='Active';
        }
        else{
            $scope.stat='Blocked';
        }


        return $scope.stat;
    }

    $scope.changestatus = function(item){
        $rootScope.stateIsLoading = true;
        var idx = $scope.itemlist.indexOf(item);
        if($scope.itemlist[idx].status==1){
            $scope.status=0;
        }
        else{
            $scope.status=1;
        }
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'categoryupdatestatus',
            data    : $.param({id: $scope.itemlist[idx].id,status:$scope.status}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if($scope.itemlist[idx].status == 0){
                $scope.itemlist[idx].status = 1;
            }else{
                $scope.itemlist[idx].status = 0;
            }
            // $scope.itemlist[idx].status = !$scope.itemlist[idx].status;
        });
    }




    //console.log('in add category form ');
});

category_module_app.controller('ModalInstanceCtrlcategory', function ($scope,$state,$cookieStore,$http,$uibModalInstance,$rootScope,Upload,$uibModal,$timeout) {
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    }
    $scope.confirmdelete = function(){
        $uibModalInstance.dismiss('cancel');

        $rootScope.stateIsLoading = true;
        var idx = $scope.currentindex;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'deletecategory',
            data    : $.param({id: $scope.itemlist[idx].id}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if(data=='success'){
                $scope.itemlist.splice(idx,1);
            }

            // $scope.itemlistp = $scope.itemlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));

        });
    }
});

category_module_app.controller('addcategory', function($scope,$state,$http,$cookieStore,$rootScope,$window,contentservice,Upload) {
    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'parentcategorylist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.categorylist=data;

        //var item={id:0,cat_name:'Parent category'}
        //$scope.categorylist.splice(0, 0, item);


    })
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
    };
    $scope.form={'file':''};
    $scope.$watch('picturupload', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            $scope.upload($scope.picturupload);

        }
    });

    $scope.upload = function (file) {
        Upload.upload({
            url: $scope.adminUrl+'uploads',//webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (response) { //upload function returns a promise
            if(response.data.error_code === 0){ //validate success
                //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ');

                $scope.form.file=response.data.filename;




            } else {
                console.log('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            file.progress = progressPercentage;
        });
    };
    // $state.go('login');
    $scope.form.parent_cat=0;
        $scope.addformsubmit = function(){
            if($scope.form.parent_cat['id']) {
                $scope.form.parent_cat = $scope.form.parent_cat['id'];
            }
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'addcategory',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            //$rootScope.stateIsLoading = false;
                $state.go('category-list');
            //return;




        });


    }

    //console.log('in add category form ');
});


category_module_app.controller('editcategory', function($scope,$state,$http,$cookieStore,$rootScope,Upload,$stateParams,$window,contentservice){

    $http({
        method  :   'GET',
        async   :   false,

        url :       $scope.adminUrl+'parentcategorylist',
        // data    : $.param($scope.form),
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.categorylist=data;

        //var item={id:0,cat_name:'Parent category'}
        //$scope.categorylist.splice(0, 0, item);


    })

    $scope.id=$stateParams.id;

    $http({
        method  : 'POST',
        async:   false,
        url     :     $scope.adminUrl+'categorydetails',
        data    : $.param({'id':$scope.id}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        console.log(data);
        $scope.form = {
            id: data[0].id,

            cat_name: data[0].cat_name,
            cat_url: data[0].cat_url,
            cat_desc: data[0].cat_desc,
            file:data[0].cat_image,
            priority:data[0].priority,
            parent_cat: {
                id:data[0].parent_cat
            },

        }
    });
    $scope.$watch('picturupload', function (files) {
        $scope.formUpload = false;
        if (files != null) {
            $scope.upload($scope.picturupload);

        }
    });

    $scope.upload = function (file) {
        Upload.upload({
            url: $scope.adminUrl+'uploads',//webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (response) { //upload function returns a promise
            if(response.data.error_code === 0){ //validate success
                //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ');

                $scope.form.file=response.data.filename;




            } else {
                console.log('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            file.progress = progressPercentage;
        });
    };
    $scope.editformsubmit = function () {
        if($scope.form.parent_cat['id']) {
            $scope.form.parent_cat = $scope.form.parent_cat['id'];
        }
        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'categoryupdates',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            $state.go('category-list');
            return
        });
    }


})

