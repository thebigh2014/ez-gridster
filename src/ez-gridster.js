'use strict';

var gridster;

angular.module('ez.gridster', [])

.constant('ezGridsterConfig', {
  widget_base_dimensions: [400, 300],
  widget_margins: [5, 5],
  widget_selector: 'li',
  helper: 'clone',
  draggable: {},
  remove: {
    silent: true
  },
  resize: {
    enabled: true
  }
})

.directive('ezGridsterWidget', ['$timeout', function($timeout) {
  return {
    restrict: 'AE',
    templateUrl: 'ez-gridster-tpl.html',
    link: function(scope, $element) {
      $timeout(function() { // update gridster after digest
        gridster.add_widget($element);
      });
    }
  };
}])

.directive('ezGridster', ['$timeout', 'ezGridsterConfig', function ($timeout, ezGridsterConfig) {
  return {
    restrict: 'AE',
    scope: {
      widgets: '=ezGridster'
    },
    template: '<ul><li class="gs-w box" ez-gridster-widget ng-repeat="widget in widgets" data-col="{{ widget.col }}" data-row="{{ widget.row }}" data-sizex="{{ widget.width }}" data-sizey="{{ widget.height }}"></li></ul>',
    link: function (scope, $element, attrs) {
      scope.options = angular.extend( ezGridsterConfig, (scope.$parent.$eval(attrs.ezGridsterOptions) || []) );

      gridster = $element.addClass('gridster').find('ul').gridster(scope.options).data('gridster');

      scope.$on('ez_gridster.add_widget', function(e, widget) {
        var width = widget.width || 1,
            height = widget.height || 1;

        widget = angular.extend(widget, gridster.next_position(width, height));

        scope.widgets.push(widget);

        scope.$emit('ez_gridster.widget_added', widget);
      });

      scope.removeWidget = function(widget, index) {
        gridster.remove_widget($element.find('li').eq(index), scope.options.remove.silent, function() {
          scope.widgets.splice(index, 1);
          scope.$digest();

          scope.$emit('ez_gridster.widget_removed', widget, index);
        });
      };
    }
  };

}]);
