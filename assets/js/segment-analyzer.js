(function($, window){
  function SegmentAnalyzer(duration, options){
    this.duration = duration;
    this.options  = this.getDefaultOptions(options);
    this.current_segment_moments    = this.getMoments();
    this.aggregate_segment_moments  = this.getMoments(); 
    this.totalMoments = this.aggregate_segment_moments.length;
    this.thresholdExceeded = false;
    this.segments = [];
    this.percentWatched = 0;
    this.percentRewatched = 0;
    this.addHeatmap();
    this.addStats();
    this.bind();
  }

  $.extend(SegmentAnalyzer.prototype, $.eventEmitter, {
    bind: function(){
      this.on('new:percentage:watched', this.onNewPercentageWatched.bind(this));
      this.on('new:percentage:rewatched', this.onNewPercentageRewatched.bind(this));
      this.on('threshold:exceeded', this.onThresholdExceeded.bind(this));
    },

    onThresholdExceeded: function(){
      $('.stats-rewatched').addClass('exceeded');
    },

    onNewPercentageWatched: function(){
      $('.stats-watched-value').html(this.percentWatched.toFixed(2) + '%');
    },

    onNewPercentageRewatched: function(){
      if(this.percentageRewatched >= 25 && !this.thresholdExceeded){
        this.thresholdExceeded = true;
        this.trigger('threshold:exceeded');
      }

      $('.stats-rewatched-value').html(this.percentRewatched.toFixed(2) + '%');
    },

    updateHeatmap: function(indexes, sum){
      var moment;

      indexes.forEach(function(moment_index){
        moment = sum[moment_index];
        moment.$el.attr('data-played', moment.plays);
      });
    },

    calculatePercentagesWatched: function(sums){
      var momentsWatched,
          percentWatched,
          percentRewatched;

      momentsWatched = sums.reduce(function(memo, curr, i, arr){
        if(curr.plays > 0){
          memo.once += 1;
        }

        if(curr.plays > 1){
          memo.twice += 1;
        }

        return memo;
      }, {once:0, twice: 0});

      percentWatched = (momentsWatched.once / this.totalMoments) * 100;
      if(percentWatched != this.percentWatched){
        this.percentWatched = percentWatched;
        this.trigger('new:percentage:watched');
      }

      percentRewatched = (momentsWatched.twice / this.totalMoments) * 100;
      if(percentRewatched != this.percentRewatched){
        this.percentRewatched = percentRewatched;
        this.trigger('new:percentage:rewatched');
      }
    },

    addSegment: function(segment){
      this.updateAggregateMoments();
      this.segments.push(segment);
      this.analyze();
    },

    updateAggregateMoments: function(){
      this.aggregate_segment_moments = this.sumMoments();
    },

    sumMoments: function(){
      var moment,
          sum = [];

      for(moment in this.aggregate_segment_moments){
        sum[moment] = $.extend({}, this.aggregate_segment_moments[moment]);
        sum[moment].plays += this.current_segment_moments[moment].plays;
      }

      return sum;
    },

    updateLastSegment: function(segment){
      this.segments[this.segments.length - 1] = segment;
      this.analyze();
    },

    lastSegment: function(){
      return this.segments[this.segments.length -1];
    },

    analyze: function(){
      var lastSegment = this.lastSegment(),
          updated = [],
          moment, sum;

      for( moment in this.current_segment_moments ){
        if(this.overlap(this.current_segment_moments[moment], lastSegment)){
          this.current_segment_moments[moment].plays = 1;
          updated.push(this.current_segment_moments[moment].index);
        }else {
          this.current_segment_moments[moment].plays = 0;
        }
      }

      sum = this.sumMoments();
      this.updateHeatmap(updated, sum);
      this.calculatePercentagesWatched(sum);
    },

    overlap: function(segA, segB){
      var dontOverlap = (segA.end <= segB.start || segB.end <= segA.start);
      return !dontOverlap;
    },

    getMoments: function(){
      var currentTime = 0,
          index = 0,
          moments = [];

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

    addHeatmap: function(){
      var $container = $('#video'),
          $heatmap = $('<div />'),
          $elBase = $('<div />'),
          currentLeft = 0;

      $elBase.addClass('heatmap-moment');
      $heatmap.addClass('heatmap');

      this.aggregate_segment_moments.forEach(function(moment){
        var $el = $elBase.clone(),
        width = ((moment.end - moment.start) / this.duration) * 100;

        this.aggregate_segment_moments[moment.index].$el = $el;

        $el.css({
          width: width + '%',
          left: currentLeft + '%'
        });

        $el.attr({
          "data-index": moment.index
        });

        currentLeft += width;
        $heatmap.append($el);
      }.bind(this));

      $container.append($heatmap);
    },

    addStats: function(){
      var $container = $("#video"),
          $stats = $('<div />'),
          $label = $('<span />'),
          $value = $('<span />');

      ['watched', 'rewatched'].forEach(function(item){
        var $statsclone = $stats.clone(),
            $labelclone = $label.clone(),
            $valueclone = $value.clone();

        $statsclone.addClass('stats stats-'+ item);
        $labelclone.addClass('stats-' + item + '-label').html('Percentage ' + item + ': ');
        $valueclone.addClass('stats-' + item + '-value').html('0.00%');

        $statsclone.append($labelclone);
        $statsclone.append($valueclone);

        $container.append($statsclone);
      });
    },

    getDefaultOptions: function(options){
      var defaults = {
        granularity: .75 
      };

      return $.extend({}, defaults, options);
    }
  });

  window.SegmentAnalyzer = SegmentAnalyzer;

}(jQuery, window));
