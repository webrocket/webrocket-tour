(function(exports){
    function __route(step) {
        document.location.hash = '#' + (step + 1).toString();
    }

    function __currentStep() {
        var step = document.location.hash.split('#')[1];
        step = !!step ? step : '1';
        return parseInt(step) - 1;
    }

    function __editor() {
        var pane = document.getElementById('code');
        return CodeMirror(pane, {'theme': 'monokai'});
    }

    function __hideIf(condition, el) {
        if (condition)
            el.hide();
        else
            el.show();
    }

    function __parseSource(source, fn) {
        if (!source)
            return fn(undefined);
        
        var parts = source.split(':');
        var file = parts[0], lines = parts[1], range = parts[2];

        if (!file)
            return fn(undefined);
        if (!!lines) {
            lines = lines.split('-');
            if (lines.length == 1) {
                lines[1] = lines[0];
            }
        }
        if (!!range) {
            range = range.split('-');
            if (range.length < 2)
                range = undefined;
        }

        fn(file, lines, range);
    }
    
    function __loadSource(editor, source) {
        var file, lines, range;
        __parseSource(source, function(f, l, r) {
            file = f; lines = l; range = r;
        });

        var source = $('#src-' + file);
        if (!source)
            return;

        editor.setValue(source.text());
        editor.setOption('mode', source.data('mode'));
        
        if (!!lines) {
            var start = {}, end = {};
            start.line = parseInt(lines[0]) - 1;

            if (!!range) {
                end.line = parseInt(lines[1]) - 1;
                start.ch = parseInt(range[0]);
                end.ch   = parseInt(range[1]);
            } else {
                start.ch = 0;
                end.line = parseInt(lines[1]);
                end.ch   = 0;
            }

            editor.setSelection(start, end);
        }
    }
    
    var editor = __editor();
    $(editor.getScrollerElement()).css('height', $('#tour .code').height());
    
    function Steps(root, tour) {
        this.tour  = tour
        this.steps = root.find('> section');

        this.reload();
    };

    Steps.prototype.load = function() {
        var step = this.steps[this.currentStep]
        if (!!step)
            this.applyStep($(step), this.currentStep);
    };

    Steps.prototype.reload = function() {
        this.currentStep = __currentStep();

        if (this.currentStep < 0 || this.currentStep > this.steps.length)
            this.currentStep = 0;

        this.tour.find('.step .total').html(this.steps.length);
        this.load();
    };

    Steps.prototype.next = function() {
        var step = this.steps[this.currentStep + 1];
        if (!!step)
            this.applyStep($(step), ++this.currentStep);
    };

    Steps.prototype.prev = function() {
        var step = this.steps[this.currentStep - 1];
        if (!!step)
            this.applyStep($(step), --this.currentStep);
    };

    Steps.prototype.applyStep = function(step, id) {
        var article = step.find('> article')

        this.tour.find('.text').html(article.html());
        this.tour.find('.step .current').html(this.currentStep + 1);
        
        __loadSource(editor, article.data('src'));
        __route(id);
        
        __hideIf(this.currentStep == this.steps.length - 1, this.tour.find('#next'));
        __hideIf(this.currentStep == 0, this.tour.find('#prev'));

        this.tour.find('#next').attr('href', '#' + (id + 2));
        this.tour.find('#prev').attr('href', '#' + (id));
    };

    exports.Steps = Steps;
}(this));

$(document).ready(function() {
    var steps  = new Steps($('#steps'), $('#tour'));
    
    if ('onhashchange' in window) {
        window.onhashchange = function() {
            steps.reload();
        };
    }
});
