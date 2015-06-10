(function($, VideoObject, PlayBar, PlaybackAnalyzer, window){

  function VideoPlayer(src, container, options){
    this.$container = $('#' + container);
    this.src        = src;
    this.options    = this.getDefaultOptions(options);
    this.video      = new this.options.VideoObject(this.options.prefix, this.src, this.$container);

    this.video.on('can:play', function(){
      this.video.off('can:play');
      this.init(); 
    }.bind(this));
  }

  $.extend(VideoPlayer.prototype, {
    init: function(){
      this.playbar  = new this.options.PlayBar(this.options.prefix, this.$container);
      this.analyzer = new this.options.PlaybackAnalyzer(this.video.videoLength);
      this.bind();
    },

    bind: function(){
      this.video.on('play',                  this.onPlay.bind(this));
      this.video.on('paused',                this.onPause.bind(this));
      this.video.on('stop',                  this.onStop.bind(this));
      this.video.on('current:time:changed',  this.onCurrentTimeChanged.bind(this));
      this.video.on('video:duration:updated',this.onVideoDurationUpdate.bind(this));
      this.playbar.on('play:head:dragged',   this.onPlayHeadDragged.bind(this));
      this.playbar.on('play:head:startdrag', this.onPlayHeadStartDrag.bind(this));
      this.playbar.on('play:head:enddrag',   this.onPlayHeadEndDrag.bind(this));
      this.playbar.on('progress:bar:clicked',this.onProgressBarClicked.bind(this));
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
      e.stopPropagation();
    },

    onPlayHeadEndDrag: function(e){
      if(this.video.currentPercentage() == 100) return;
      this.video.playVideo();
    },

    onPlayHeadDragged: function(e, percentage){
      this.video.updatePercentage(percentage);
    },

    onCurrentTimeChanged: function(e, data){
      console.log('on current time change');
      this.analyzer.record(data);
      this.playbar.trigger('video:made:progress', data)
    },

    onPlay: function(){
      this.analyzer.enableRecording();
    },

    onPause: function(){
      console.log('onPause');
      this.analyzer.disableRecording();
    },

    onStop: function(){
      this.anaylzer.disableRecording();
    },

    getDefaultOptions: function(options){
      var defaults = {
        VideoObject: VideoObject,
        PlayBar: PlayBar,
        PlaybackAnalyzer: PlaybackAnalyzer,
        prefix: 'neils-video',
        replay_minimum: 5
      }

      return $.extend({}, defaults, options);
    }
  });

  window.VideoPlayer = VideoPlayer;

}(jQuery, VideoObject, PlayBar, PlaybackAnalyzer, window));
