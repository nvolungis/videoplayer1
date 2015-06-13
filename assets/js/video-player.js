(function(VideoObject, PlayBar, PlaybackAnalyzer, utils, document, window){
  function VideoPlayer(src, container, options){
    this.container  = document.querySelector('#' + container);
    this.src        = src;
    this.options    = this.getDefaultOptions(options);
    this.video      = new VideoObject(this.options.prefix, this.src, this.container);

    this.video.on('can:play', function(){
      this.video.off('can:play');
      this.init(); 
    }.bind(this));
  }

  utils.extend(VideoPlayer.prototype, {
    init: function(){
      this.playbar  = new PlayBar(this.options.prefix, this.container);
      this.analyzer = new PlaybackAnalyzer(this.video.videoLength, this.container, {
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
        rewatchThreshold: 25
      }

      return utils.extend({}, defaults, options);
    }
  });

  window.VideoPlayer = VideoPlayer;

}(VideoObject, PlayBar, PlaybackAnalyzer, utils, document, window));
