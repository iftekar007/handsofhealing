'use strict';

/* App Module */
var userrole_module_app = angular.module('userrole_module_app', ['ui.router','angularValidator','ngCookies','ui.bootstrap','ngFileUpload','ui.tinymce']);











userrole_module_app.controller('addrole', function($compile,$scope,$state,$http,$cookieStore,$rootScope,$sce,$stateParams,$window,contentservice) {
    $scope.submitroleForm=function() {
        $http({
            method: 'POST',
            async: false,
            url: $scope.adminUrl + 'addrole',
            data: $.param($scope.form),  // pass in data as strings
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
            //$('#employmentmodal').modal('show');
           // console.log(data);
           $state.go('role-list');

        });
    }

});
userrole_module_app.controller('rolelist', function($compile,$scope,$state,$http,$cookieStore,$rootScope,$sce,$stateParams,$window,$uibModal,contentservice) {

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
        method:'GET',
        async:false,
        url:$scope.adminUrl+'rolelist',
        headers :   { 'Content-Type': 'application/x-www-form-urlencoded' }

    }).success(function(data){
        $scope.rolelist=data;
      //  $scope.getArray =data;

    })
    $scope.searchkey = '';
    $scope.search = function(item){

        if ( (item.role.toString().toLowerCase().indexOf($scope.searchkey.toString().toLowerCase()) != -1)){
            return true;
        }
        return false;
    };
    $scope.delrole = function(item,size){
        console.log(1);
        console.log(item);

        $scope.currentindex=$scope.rolelist.indexOf(item);
        $uibModal.open({
            animation: true,
            templateUrl: 'roledelconfirm.html',
            controller: 'ModalInstanceCtrl1',
            size: 'md',
            scope:$scope
        });
    }

});

userrole_module_app.controller('editrole', function($compile,$scope,$state,$http,$cookieStore,$rootScope,$sce,$stateParams,$window,contentservice) {

    $scope.id = $stateParams.id;

    $http({
        method: 'POST',
        async: false,
        url: $scope.adminUrl + 'roledetails',
        data: $.param({'id': $scope.id}),  // pass in data as strings
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data) {
       // console.log(data);
       /// console.log(data);
      //  console.log(data.role);
        $scope.form = {
            id: data[0].id,
            role: data[0].role,
        }
    });
    $scope.submiteditroleForm = function () {

        $rootScope.stateIsLoading = true;
        $http({
            method: 'POST',
            async: false,
            url: $scope.adminUrl + 'roleupdates',
            data: $.param($scope.form),  // pass in data as strings
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
            $rootScope.stateIsLoading = false;
            $state.go('role-list');
            return
        });
    }

});

userrole_module_app.controller('ModalInstanceCtrl1', function ($scope,$state,$cookieStore,$http,$uibModalInstance,$rootScope,Upload,$uibModal,$timeout) {

    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    }

    $scope.role_delete = function(){
        $uibModalInstance.dismiss('cancel');

        $rootScope.stateIsLoading = true;
        var idx = $scope.currentindex;
        $http({
            method  : 'POST',
            async:   false,
            url     : $scope.adminUrl+'deleterole',
            data    : $.param({id: $scope.rolelist[idx].id}),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) .success(function(data) {
            $rootScope.stateIsLoading = false;
            if(data=='success'){
                $scope.rolelist.splice(idx,1);
            }

            // $scope.userlistp = $scope.userlist.slice($scope.begin, parseInt($scope.begin+$scope.perPage));

        });
    }
});
