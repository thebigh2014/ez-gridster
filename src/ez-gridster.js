'use strict';

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

.directive('ezGridsterWidget', ['$timeout', 'ezGridsterConfig', function($timeout, ezGridsterConfig) {
  return {
    restrict: 'AE',
    templateUrl: 'ez-gridster-tpl.html',
    link: function(scope, $element) {
      $timeout(function() { // add widget to gridster after digest
        scope.$parent.gridster.add_widget($element);
      });
    }
  };
}])

.directive('ezGridster', ['ezGridsterConfig', function (ezGridsterConfig) {
  return {
    restrict: 'AE',
    scope: {
      widgets: '=ezGridster'
    },
    template: '<ul><li class="gs-w box" ez-gridster-widget ng-repeat="widget in widgets" data-col="{{ widget.col }}" data-row="{{ widget.row }}" data-sizex="{{ widget.size_x }}" data-sizey="{{ widget.size_y }}"></li></ul>',
    link: function (scope, $element, attrs) {
      scope.options = angular.extend(ezGridsterConfig, scope.$parent.$eval(attrs.ezGridsterOptions));

      scope.updateWidgets = function(e) { //  update each widgets new position info
        var $widgets,
            $widget,
            widget;

        angular.forEach($element.find('.gs-w'), function(v, k) {
          $widget = angular.element(v);
          widget = angular.extend(scope.widgets[k], {
            size_x: $widget.attr('data-sizex'),
            size_y: $widget.attr('data-sizey'),
            col: $widget.attr('data-col'),
            row: $widget.attr('data-row')
          });

          scope.widgets[k] = widget;
        });

        scope.$digest();
        scope.$emit('ez_gridster.widgets_updated');
      };

      scope.options.draggable.stop = function(e) {
        scope.updateWidgets(e);

        scope.$emit('ez_gridster.widget_dragged');
      };

      scope.options.resize.stop = function(e, ui) {
        scope.updateWidgets(e);

        scope.$emit('ez_gridster.widget_resized');
      };

      scope.gridster = $element.addClass('gridster').find('ul').gridster(scope.options).data('gridster');

      scope.$on('ez_gridster.add_widget', function(e, widget) {
        var size_x = widget.size_x || 1,
            size_y = widget.size_y || 1;

        widget = angular.extend(widget, scope.gridster.next_position(size_x, size_y));

        scope.widgets.push(widget);

        scope.$emit('ez_gridster.widget_added', widget);
      });

      scope.$on('ez_gridster.remove_widget', function(e, index) {
        scope.removeWidget(index);
      });

      scope.$on('ez_gridster.clear', function() {
        scope.gridster.remove_all_widgets();
        scope.widgets = [];
      });

      scope.$on('ez_gridster.set', function(e, widgets) {
        scope.gridster.remove_all_widgets();
        scope.widgets = widgets;
      });

      scope.removeWidget = function(index) {
        scope.gridster.remove_widget($element.find('li.gs-w').eq(index), scope.options.remove.silent, function() {
          var widget = scope.widgets[index];
          scope.widgets.splice(index, 1);
          scope.$emit('ez_gridster.widget_removed', widget, index);
          scope.$digest();
        });
      };
    }
  };

}]);

