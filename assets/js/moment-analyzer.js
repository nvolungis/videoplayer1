

/* MomentAnalyzer
 *
 * Creates an array of objects that represent discrete moments 
 * in the video the length of which are determined by videoDuration / granularity
 * where granularity is 1 / numberSegmentsPerSecond. Moment objects contain start, 
 * end and plays properties. The analyzer compares a segment of the video representing
 * the current unintereupted portion of the video being viewed to each moment object.
 * If the segments overlap, the play count for that moment in incremented. This info
 * is then used to derive percentages watched, rewatched, tripple watched, etc. 
 *
 */


(function(utils, document, window){
  function MomentAnalyzer(duration, container, options){
    this.duration                   = duration;
    this.container                  = container;
    this.options                    = options;
    this.current_segment_moments    = this.getMoments();
    this.aggregate_segment_moments  = this.getMoments(); 
    this.totalMoments               = this.aggregate_segment_moments.length;
    this.thresholdExceeded          = false;
    this.segments                   = [];
    this.percentWatched             = 0;
    this.percentRewatched           = 0;

    if(this.options.showStats){
      this.ui = new MomentAnalyzerUI(this.duration, container, this.aggregate_segment_moments, this.options)
    }
    
    this.bind();
  }

  utils.extend(MomentAnalyzer.prototype, utils.emitter, {
    bind: function(){
      this.on('new:percentage:watched',   this.onNewPercentageWatched.bind(this));
      this.on('new:percentage:rewatched', this.onNewPercentageRewatched.bind(this));
      this.on('threshold:exceeded',       this.onThresholdExceeded.bind(this));
    },

    onThresholdExceeded: function(){
      console.log(this.options.rewatchThreshold + ' exceeded!');

      if(this.ui){
        this.ui.showThresholdExceeded();
      }
    },

    onNewPercentageWatched: function(){
      if(this.ui){
        this.ui.updatePercentageWatched(this.percentWatched);
      }
    },

    onNewPercentageRewatched: function(){
      var valueRewatched,
          el;

      if(this.percentRewatched >= this.options.rewatchThreshold && !this.thresholdExceeded){
        this.thresholdExceeded = true;
        this.trigger('threshold:exceeded');
      }

      if(this.ui){
        this.ui.updatePercentageRewatched(this.percentRewatched);
      }
    },

    calculatePercentagesWatched: function(sums){
      var momentsWatched,
          percentWatched,
          percentRewatched;

      momentsWatched = sums.reduce(function(memo, curr){
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
      var sum = [],
          moment;

      for(moment in this.aggregate_segment_moments){
        sum[moment] = utils.extend({}, this.aggregate_segment_moments[moment]);
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
          updated     = [],
          moment, 
          sum;

      for( moment in this.current_segment_moments ){
        if(this.overlap(this.current_segment_moments[moment], lastSegment)){
          this.current_segment_moments[moment].plays = 1;
          updated.push(this.current_segment_moments[moment].index);
        }else {
          this.current_segment_moments[moment].plays = 0;
        }
      }

      sum = this.sumMoments();
      this.calculatePercentagesWatched(sum);

      if(this.ui){
        this.ui.updateHeatmap(updated, sum);
      }
    },

    overlap: function(segA, segB){
      var dontOverlap = (segA.end <= segB.start || segB.end <= segA.start);
      return !dontOverlap;
    },

    getMoments: function(){
      var currentTime = 0,
          moments     = [],
          index       = 0;

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
    }

  });

  window.MomentAnalyzer = MomentAnalyzer;

}(utils, document, window));
