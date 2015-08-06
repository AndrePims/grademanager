'use strict';

/**
 * @ngdoc directive
 * @name grademanagerApp.directive:myRichTextEditor
 * @description
 * # myRichTextEditor
 */

/* jshint ignore:start */
function GUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
/* jshint ignore:end */

 //patch wysihtml5 with additional commands
(function(wysihtml5) {
	wysihtml5.commands.insertCode = {
	  exec: function(composer, command, html) {
  		html = '<code id="code'+ GUID() +'"></code>';
  		command = 'insertHTML';
  		if (composer.commands.support(command)) {
  		  composer.doc.execCommand(command, false, html);
  		} else {
  		  composer.selection.insertHTML(html);
  		}
	  },
    state: function() {
  		return false;
	  }
	};
})(wysihtml5);

angular.module('grademanagerApp')
  .directive('myRichTextEditor', function ($timeout, $mdDialog, exam) {

      var myParse = function(elementOrHtml_current, config){
        // replace empty tags
        elementOrHtml_current = elementOrHtml_current.replace(/<b><\/b>/, '');
        elementOrHtml_current = elementOrHtml_current.replace(/<i><\/i>/, '');
        elementOrHtml_current = elementOrHtml_current.replace(/<pre><\/pre>/, '');
        elementOrHtml_current = elementOrHtml_current.replace(/<xmp><\/xmp>/, '');
        elementOrHtml_current = elementOrHtml_current.replace(/(<code.*?>).*?(<\/code>)/g, '$1$2');
        return wysihtml5.dom.parse(elementOrHtml_current, config);
      };

     return {
      restrict: 'E',
      replace: true,
      require: '?ngModel',
      transclude: true,
      templateUrl: 'views/myrichtexteditor.html',
      scope:{
        'content': '=ngModel'
      },
      link: function (scope, element, attrs, ngModel) {
        var toolbar = element.children()[0];
        var textarea = element.children()[1];
        var preview = element.children()[2];
        var graphicsToolbar = element.children()[3];

        var editor;
        var currentImg;

        var watchers = {};

        scope.examService = exam;

        function watchImg(img){
          watchers[img.id] = scope.$watch("examService.exam.graphics['" + img.id + "']", function(){
              $timeout(function(){
                  decorate();
                  if(currentImg){
                    graphicsToolbar.style.width = currentImg.offsetWidth + 'px';
                  }
              });
          }, true);
        }

        function watchCode(code){
          watchers[code.id] = scope.$watch("examService.exam.codes['" + code.id + "']", function(){
              $timeout(function(){
                  decorate();
              });
          }, true);
        }

        function decorate(){
            var element = preview;
            if(editor){
              element= editor.composer.editableArea;
            }
            var imgs = element.getElementsByTagName('img');
            for(var i=0; i < imgs.length; i++){
                var imgElement= imgs[i];
                var img = exam.getGraphics(imgElement.getAttribute('id'));
                if (img) {
                    if (!watchers.hasOwnProperty(img.id)) {
                        watchImg(img);
                    }
                    imgElement.setAttribute('src', exam.graphicsPreviewURL(img.id));
                    imgElement.classList.toggle('border', img.border);
                    imgElement.classList.toggle('options', img.options);
                    imgElement.style.width = img.width * 100 + '%';
                } else {
                  imgElement.setAttribute('src', exam.graphicsPreviewURL(''));
                }
            }

            var codes = element.getElementsByTagName('code');
            for(var c=0; c < codes.length; c++){
                var codeElement = codes[c];
                codeElement.classList.add('wysihtml5-uneditable-container');
                var code = exam.getCode(codeElement.getAttribute('id'), true);
                codeElement.classList.toggle('border', code.border);
                var cm;
                if(codeElement.children.length === 0){
                    cm = CodeMirror(codeElement, {
                        viewportMargin:Infinity,
                        value: code.content || '\n',
  							        lineNumbers: code.numbers,
                        mode: code.mode,
                        readOnly: 'nocursor'
                    });
                    if (!watchers.hasOwnProperty(code.id)) {
                        watchCode(code);
                    }
                } else {
                    cm = codeElement.children[0].CodeMirror;
                    cm.setOption('lineNumbers', code.numbers);
                    cm.setOption('mode', code.mode);
                    cm.setValue(code.content);
                }
            }
        }

        scope.showGraphicsManager = function($event){
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: 'views/graphicsmanager.html',
                targetEvent: $event,
                controller: 'GraphicsManagerCtrl',
                controllerAs: 'ctrl'
            })
            .then(function(id){
                wysihtml5.commands.insertImage.exec(editor.composer, 'insertImage', {id: id});
                $timeout(decorate);
            });
        };

        function findParentCode(element){
            if(element.tagName === 'CODE') {
                return element;
            }
            if (element.parentElement) {
                return findParentCode(element.parentElement);
            }
        }

        function initEditor(){
            editor = new wysihtml5.Editor(textarea, {
                autoLink: false,
                toolbar: toolbar,
                parserRules: wysihtml5ParserRules,
                parser: myParse,
                contentEditableMode: true,
                useLineBreaks: false,
                stylesheets: ['styles/wysihtml5_custom.css']
            });

            scope.closeGraphicsToolbar = function(){
              graphicsToolbar.classList.add('hide');
            };

            scope.showGraphicsSettings = function($event, graphics){
                $mdDialog.show({
                    clickOutsideToClose: false,
                    targetEvent: $event,
                    templateUrl: 'views/promptdialog.html',
                    controller: 'PromptDialogCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        options: {
                            title: 'Advanced options',
                            content: 'Provide LaTeX \includegraphics options overrides:',
                            label: 'options',
                            value: graphics.options
                        }
                    }
                })
                .then(function(value){
                    graphics.options = value;
                });
            };


            $timeout(function(){
                editor.composer.editableArea.addEventListener('click', function(event){
                    if (event.target.tagName === 'IMG'){
                        var imgElement = event.target;
                        graphicsToolbar.classList.remove('hide');
                        graphicsToolbar.style.top = imgElement.offsetTop + 'px';
                        graphicsToolbar.style.left = imgElement.offsetLeft + 'px';
                        graphicsToolbar.style.width = imgElement.offsetWidth + 'px';
                        scope.graphics = exam.getGraphics(imgElement.getAttribute('id'));
                        currentImg = imgElement;
                        scope.$apply();
                    }

                    var codeElement = findParentCode(event.target);
                    if (codeElement){

                        var code = exam.getCode(codeElement.getAttribute('id'));
                        $mdDialog.show({
                            clickOutsideToClose: false,
                            targetEvent: event,
                            templateUrl: 'views/codeeditor.html',
                            controller: 'CodeEditorCtrl',
                            controllerAs: 'ctrl',
                            locals: {
                                code: code
                            }
                        });
                    }
                });
            });

            editor.on('focus', function() {
                toolbar.classList.remove('hide');
            });

            editor.on('blur', function() {
                toolbar.classList.add('hide');
                graphicsToolbar.classList.add('hide');
            });

            // Sync view -> model
            editor.on('change', function(){
              $timeout(function(){
                  console.log('change');
                  ngModel.$setViewValue(editor.getValue(true));
              });
            });

            editor.on('paste', function(){
                $timeout(decorate);
            });

            editor.on('aftercommand:composer', function(){
                $timeout(decorate);
            });

            editor.on('change_view', function(){
                $timeout(decorate);
            });

            toolbar.classList.remove('hide');
            textarea.classList.remove('hide');

            //remove preview since we now have the editor
            element[0].removeChild(preview);
            preview = null;
            editor.setValue(ngModel.$viewValue || '');
            $timeout(function(){
              editor.focus();
            });
        }

        // Sync model -> view
        ngModel.$render = function () {
            var newValue = ngModel.$viewValue || '';
             if (preview) {
               preview.innerHTML = newValue;
             }
             if (editor) {
                editor.setValue(newValue);
             }
             $timeout(decorate);
        };



        //only initEditor if needed
        preview.addEventListener('click', initEditor, false);

      }
    };
  });
