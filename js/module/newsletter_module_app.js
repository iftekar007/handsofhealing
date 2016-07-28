'use strict';

/* App Module */
var newsletter_module_app = angular.module('newsletter_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);





newsletter_module_app.controller('newsletterlist', function($scope,$state,$http,$cookieStore,$rootScope,$uibModal,$window,contentservice,$sce) {
    $scope.trustAsHtml=$sce.trustAsHtml;
    $scope.predicate = 'priority';
    $scope.reverse = true;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
        console.log($scope.predicate);
        console.log($scope.reverse);
    };
    $scope.currentPage=1;
    $scope.perPage=10;

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

        /*angular.forEach(data,function(value){
            var cat_name=[];
            var categorylist = JSON.parse(value.category_id);
            angular.forEach(categorylist,function(value1){
                cat_name.push(value1.cat_name);
            });
            value.category_str=cat_name.join(', ');
        })*/

    });

    $scope.searchkey = '';

        $scope.search = function(item){

            if ( (item.newsletter_name.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1) ||  (item.status.toString().indexOf($scope.searchkey) != -1)   || (item.newsletter_desc.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)  ){
                return true;
            }
            return false;
        };

    $scope.deleteitem = function(item,size){

        $scope.currentindex=$scope.itemlist.indexOf(item);

        $uibModal.open({
            animation: true,
            templateUrl: 'delconfirm.html',
            controller: 'ModalInstanceCtrlnewsletter',
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
            url     : $scope.adminUrl+'newsletterupdatestatus',
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




    //console.log('in add newsletter form ');
});

newsletter_module_app.controller('ModalInstanceCtrlnewsletter', function ($scope,$state,$cookieStore,$http,$uibModalInstance,$rootScope,Upload,$uibModal,$timeout) {
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
            url     : $scope.adminUrl+'deletenewsletter',
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

newsletter_module_app.controller('addnewsletter', function($scope,$state,$http,$cookieStore,$rootScope,$window,contentservice,Upload) {
    $scope.loader='hide';
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

    $scope.addfilearr=[];



    $scope.$watch('picturupload', function (files) {
        $scope.loader='show';
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
                $scope.loader='hide';



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


        $scope.addformsubmit = function(){

          //  $scope.form.category_id=$scope.form.category_id['id'];;

        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'addnewsletter',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            //$rootScope.stateIsLoading = false;
                $state.go('newsletter-list');
            //return;




        });


    }

    //console.log('in add newsletter form ');
});


newsletter_module_app.controller('editnewsletter', function($scope,$state,$http,$cookieStore,$rootScope,$stateParams,Upload,$window,contentservice){

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

    $scope.id=$stateParams.id;

    $http({
        method  : 'POST',
        async:   false,
        url     :     $scope.adminUrl+'newsletterdetails',
        data    : $.param({'id':$scope.id}),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {

       // console.log(data);
        $scope.form = {
            id: data[0].id,

            newsletter_name: data[0].newsletter_name,
            newsletter_desc: data[0].newsletter_desc,
            category_id: {
             id:data[0].category_id
             },
           // category_id:data[0].category_id,
            file: data[0].newsletter_file,
            priority: data[0].priority,
            price: data[0].price,

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
       // $scope.form.category_id=JSON.stringify($scope.form.category_id);

        $rootScope.stateIsLoading = true;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'newsletterupdates',
            data    : $.param($scope.form),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            $state.go('newsletter-list');
            return
        });
    }


})

