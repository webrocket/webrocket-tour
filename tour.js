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
        return CodeMirror(pane, {'theme': 'lesser-dark'});
    }

    function __hideIf(condition, el) {
        if (condition)
            el.hide();
        else
            el.show();
    }

    function __loadSource(editor, source) {
        
    }
    
    var editor = __editor();
    
    function Steps(root, tour) {
        this.tour        = tour
        this.steps       = root.find('> section');
        this.currentStep = __currentStep();

        if (this.currentStep < 0 || this.currentStep > this.steps.length)
            this.currentStep = 0;

        this.load();
    }

    Steps.prototype.load = function() {
        var step = this.steps[this.currentStep]
        if (!!step)
            this.applyStep($(step), this.currentStep);
    }

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
        this.tour.find('.step').html(this.currentStep + 1);
        
        __loadSource(editor, article.data('src'));
        __route(id);
        
        __hideIf(this.currentStep == this.steps.length - 1, this.tour.find('#next'));
        __hideIf(this.currentStep == 0, this.tour.find('#prev'));
    };

    exports.Steps = Steps;
}(this));

$(document).ready(function() {
    var steps  = new Steps($('#steps'), $('#tour'));

    $('#next').live('click', function() {
        steps.next();
        return false;
    });
    $('#prev').live('click', function() {
        steps.prev();
        return false;
    });

    $(document).keydown(function(e){
        if (e.keyCode == 37 || e.keyCode == 40) {
            steps.prev();
            return false;
        }
        if (e.keyCode == 39 || e.keyCode == 38) {
            steps.next();
            return false;
        }
    });
});
