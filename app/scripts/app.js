'use strict';

/**
 * @ngdoc overview
 * @name grademanagerApp
 * @description
 * # grademanagerApp
 *
 * Main module of the application.
 */
angular
  .module('grademanagerApp', [
    'ngAnimate',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'ui.tree',
    'ui.router',
    'IeHelper'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .state('edit', {
        url: '/edit',
        templateUrl: 'views/edit.html',
        controller: 'EditCtrl',
        controllerAs: 'editor'
      })
      .state('scan', {
        url: '/scan',
        templateUrl: 'views/scan.html',
        controller: 'ScanCtrl',
        controllerAs: 'scan'
      })
      .state('scan.manual', {
        url: '/:student/:page\::copy',
        templateUrl: 'views/scan.preview.html',
        controller: 'ScanPreviewCtrl',
        controllerAs: 'preview'
      })
      .state('grade', {
        url: '/grade',
        templateUrl: 'views/grade.html',
        controller: 'GradeCtrl',
        controllerAs: 'grade'
      });
  })
  .config(function($mdIconProvider) {
    $mdIconProvider.defaultFontSet( 'mdi' );
  });

 //http://stackoverflow.com/questions/15895483/angular-ng-href-and-svg-xlink
angular.forEach([
    { ngAttrName: 'ngXlinkHref', attrName: 'xlink:href' },
], function (pair) {

    var ngAttrName = pair.ngAttrName;
    var attrName = pair.attrName;

    angular.module('grademanagerApp').directive(ngAttrName, function (IeHelperSrv) {
        return {
            priority: 99,
            link: function (scope, element, attrs) {
                attrs.$observe(ngAttrName, function (value) {
                    if (!value) return;
                    attrs.$set(attrName, value);
                    if (IeHelperSrv.isIE) element.prop(attrName, value);
                });
            }
        };
    });
});
angular.module('IeHelper', []).factory('IeHelperSrv', function () {

    return {
        isIE: checkForIE.isIE,
    }
});

var checkForIE = {
    init: function () {
        this.isIE = (navigator.userAgent.indexOf('MSIE') != -1);
    }
};
checkForIE.init();