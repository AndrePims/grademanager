'use strict';

/**
 * @ngdoc service
 * @name grademanagerApp.API
 * @description
 * # API
 * Service in the grademanagerApp.
 */
angular.module('grademanagerApp')
  .service('API', function () {
var apiURL = 'http://192.168.59.103:8080/amcui/';
    this.pages = [];
    this.page = {};
    /*
    {
      "src":"%PROJET/scans/aBack0042.tif",
      "student":"1",
      "page":14,
      "copy":2,
      "timestamp_auto":1390327992,
      "timestamp_manual":1390334120,
      "a":1.000953,
      "b":0.000828,
      "c":0.001489,
      "d":0.998423,
      "e":-18.083462,
      "f":1.174288,
      "mse":2.672195,
      "layout_image":"page-1-14-2.jpg",
      "annotated":"page-1-14-2.jpg",
      "timestamp_annotate":1391091002
    }

       'pageNearRatio'=>{'sql'=>"SELECT MIN(ABS(1.0*black/total-darkness_threshold))"
		       ." FROM $t_zone"
		       ." WHERE student=? AND page=? AND copy=? AND total>0"},
           sub sensitivity_down {
  my ($delta,$threshold)=@_;
  return(defined($delta) && $threshold>0 ? 10*($threshold-$delta)/$threshold : undef);
}

sub sensitivity_up {
  my ($delta,$threshold)=@_;
  return(defined($delta) && $threshold<1 ? sensitivity($delta,1-$threshold) : undef);
}

    */
    this.zones = [];

    var self = this;


  });
