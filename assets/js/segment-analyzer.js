(function($, window){
  function SegmentAnalyzer(duration, options){
    this.duration = duration;
    this.options  = this.getDefaultOptions(options);
    this.moments  = this.getMoments();
    this.addDisplay();
    this.bind();
    // this.segments = [];
  }

  $.extend(SegmentAnalyzer.prototype, $.eventEmitter, {
    bind: function(){
      this.on('moment:plays:incremented', this.onMomentPlaysIncremented.bind(this));
    },

    onMomentPlaysIncremented: function(e, moment){
      moment.$el.attr('data-played', moment.plays);
    },

    update: function(time){
      this.updateMoments(time);
      this.analyze();
    },

    addDisplay: function(){
      var $container = $('#video'),
          $heatmap = $('<div />'),
          $elBase = $('<div />'),
          currentLeft = 0;

      $elBase.addClass('heatmap-moment');
      $heatmap.addClass('heatmap');

      this.moments.forEach(function(moment){
        var $el = $elBase.clone(),
            selector = 'heatmap-moment-' + moment.index,
            width = ((moment.end - moment.start) / this.duration) * 100;

        this.moments[moment.index].$el = $el;

        $el.addClass(selector);
        $el.css({
          width: width + '%',
          left: currentLeft + '%'
        });

        currentLeft += width;
        $heatmap.append($el);
      }.bind(this));

      $container.append($heatmap);
    },

    updateDisplay: function(){
       
    },

    analyze: function(){
      console.log(this.moments);
    },

    updateMoments: function(time){
      var i = 0, len;

      len = this.moments.length;

      for(i; i < len; i += 1){
        if(this.moments[i].start < time && this.moments[i].end >= time){
          this.moments[i].plays += 1;
          this.trigger('moment:plays:incremented', this.moments[i]);
        }
      }
    },
    
    getMoments: function(){
      var currentTime = 0,
          moments = [],
          index = 0;


      while((currentTime + this.options.granularity) < this.duration){
        moments.push({
          start: currentTime,
          end: currentTime + this.options.granularity,
          plays: 0,
          index: index
        });

        currentTime += this.options.granularity;
        index += 1;
      }

      moments.push({
        start: currentTime,
        end: this.duration,
        plays: 0,
        index: index
      });

      return moments;
    },

    getDefaultOptions: function(options){
      var defaults = {
        granularity: .5 
      };

      return $.extend({}, defaults, options);
    }
  });

  window.SegmentAnalyzer = SegmentAnalyzer;

}(jQuery, window));
