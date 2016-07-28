'use strict';

/* App Module */
var contact_module_app = angular.module('contact_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);





contact_module_app.controller('contactlist', function($scope,$state,$http,$cookieStore,$rootScope,$uibModal,$window,contentservice) {
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
        method  : 'POST',
        async:   false,
        url     : $scope.adminUrl+'contactlist',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }) .success(function(data) {
        $rootScope.stateIsLoading = false;
       // console.log(data);
        $scope.contactlist=data;
    });

    $scope.searchkey = '';
    $scope.search = function(item){

        if ( (item.fullname.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)||(item.email.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)||(item.phone.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)||(item.message.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)){
            return true;
        }
        return false;
    };

    $scope.delelete = function(item,size){

        $scope.currentindex=$scope.contactlist.indexOf(item);

        $uibModal.open({
            animation: true,
            templateUrl: 'contactdelconfirm.html',
            controller: 'ModalInstanceCtrlcontact',
            size: 'md',
            scope:$scope
        });
    }

});


contact_module_app.controller('ModalInstanceCtrlcontact', function ($scope,$state,$cookieStore,$http,$uibModalInstance,$rootScope,Upload,$uibModal,$timeout) {
$scope.cancel=function(){
    $uibModalInstance.dismiss('cancel');
}
    $scope.confirmdel = function(){
        $uibModalInstance.dismiss('cancel');

        $rootScope.stateIsLoading = true;
        var idx = $scope.currentindex;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'deletecontact',
            data    : $.param({id: $scope.contactlist[idx].id}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if(data=='success'){
                $scope.contactlist.splice(idx,1);
            }

            // $scope.userlistp = $scope.userlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));

        });
    }
});
