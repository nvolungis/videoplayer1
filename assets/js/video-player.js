

/* VideoPlayer
 * 
 * Serves as the main interface to the player 
 * and coordinates all componenets
 *
 * Options:
 *
 * granularity - Double
 *   from .01 to 1.0
 *   default .5
 *   the number of segments / second 
 *   to split the video into for analytics
 *
 * autoplay - Boolean
 *   default true
 *   autoplay the video, or don't 
 *
 * volume - Double
 *   from 0.0 to 1.0
 *   default 1.0
 *   sets the volume of the player on initialization
 *
 * rewatchTreshold - Integer
 *   from 0 to 100
 *   default 25
 *   the percentage of the video rewatched required to trigger a thresholdExceeded event
 *
 * showStats - Boolean
 *   default false
 *   show the heatmap, or don't
 *
 * prefix - String
 *   default 'neils-video'
 *   Prefix added to all the elements created by the video player
 *
 */


(function(VideoWrapper, PlayBar, PlaybackAnalyzer, utils, document, window){
  function VideoPlayer(src, container, options){
    this.container  = document.querySelector('#' + container);
    this.src        = src;
    this.options    = this.getDefaultOptions(options);
    this.video      = new VideoWrapper(this.src, this.container, {
      autoplay: this.options.autoplay,
      volume: this.options.volume,
      prefix: this.options.prefix
    });

    this.video.on('can:play', function(){
      this.video.off('can:play');
      this.init(); 
    }.bind(this));
  }

  utils.extend(VideoPlayer.prototype, {
    init: function(){
      this.playbar  = new PlayBar(this.options.prefix, this.video.getVidContainer());
      this.analyzer = new PlaybackAnalyzer(this.video.videoLength, this.video.getAuxContainer(), {
        granularity: this.options.granularity,
        prefix: this.options.prefix,
        showStats: this.options.showStats,
        rewatchThreshold: this.options.rewatchThreshold
      });

      this.bind();
    },

    bind: function(){
      this.video.on('play',                   this.onPlay.bind(this));
      this.video.on('paused',                 this.onPause.bind(this));
      this.video.on('stop',                   this.onStop.bind(this));
      this.video.on('current:time:changed',   this.onCurrentTimeChanged.bind(this));
      this.video.on('video:duration:updated', this.onVideoDurationUpdate.bind(this));
      this.video.on('buffer:updated',         this.onBufferUpdated.bind(this));
      this.playbar.on('play:head:dragged',    this.onPlayHeadDragged.bind(this));
      this.playbar.on('play:head:startdrag',  this.onPlayHeadStartDrag.bind(this));
      this.playbar.on('play:head:enddrag',    this.onPlayHeadEndDrag.bind(this));
      this.playbar.on('progress:bar:clicked', this.onProgressBarClicked.bind(this));
    },

    onVideoDurationUpdate: function(e, duration){
      this.analyzer.updateVideoDuration(duration);
    },

    onProgressBarClicked: function(e, percentage){
      this.analyzer.disableRecording();
      this.video.pauseVideo();
      this.video.updatePercentage(percentage);
      this.video.playVideo();
    },

    onPlayHeadStartDrag: function(e){
      this.analyzer.disableRecording();
      this.video.pauseVideo();
    },

    onPlayHeadEndDrag: function(e){
      if(this.video.currentPercentage() == 100) return;
      this.video.playVideo();
    },

    onPlayHeadDragged: function(e, percentage){
      this.video.updatePercentage(percentage);
    },

    onCurrentTimeChanged: function(e, data){
      this.analyzer.record(data);
      this.playbar.trigger('video:made:progress', data)
    },

    onBufferUpdated: function(e, progress){
      this.playbar.trigger('buffer:made:progress', progress);
    },

    onPlay: function(){
      this.analyzer.enableRecording();
    },

    onPause: function(){
      this.analyzer.disableRecording();
    },

    onStop: function(){
      this.anaylzer.disableRecording();
    },

    getDefaultOptions: function(options){
      var defaults = {
          prefix: 'neils-video',
          granularity: .5,
          showStats: false,
          rewatchThreshold: 25,
          autoplay: true,
          volume: 1.0
      }

      return utils.extend({}, defaults, options);
    }
  });

  window.VideoPlayer = VideoPlayer;
}(VideoWrapper, PlayBar, PlaybackAnalyzer, utils, document, window));
