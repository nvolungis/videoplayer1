(function($, window){
  function VideoObject(prefix, src, $container){
    this.prefix      = prefix;
    this.src         = src;
    this.$container  = $container;
    this.videoLength = 0;
    this.embed_video();
    this.bind();
  }

  $.extend(VideoObject.prototype, $.eventEmitter, {
    bind: function(){
      this.nativeVideoEl.addEventListener('canplay',    this.onCanPlay.bind(this));
      this.nativeVideoEl.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      this.nativeVideoEl.addEventListener('play',       this.onPlay.bind(this)); 
      this.nativeVideoEl.addEventListener('pause',      this.onPause.bind(this));
      this.nativeVideoEl.addEventListener('stop',       this.onStop.bind(this));
      this.$videoTag.on('click', this.onVideoTagClick.bind(this));
    },

    onVideoTagClick: function(){
      if(this.nativeVideoEl.paused){
        this.nativeVideoEl.play();
      }else{
        this.nativeVideoEl.pause();
      }
    },

    onCanPlay: function(){
      this.videoLength = this.nativeVideoEl.duration;
      this.trigger('can:play');
    },

    onTimeUpdate: function(e){
      var percentage = this.nativeVideoEl.currentTime / this.videoLength * 100;

      this.trigger('current:time:changed', {
        currentTime: this.nativeVideoEl.currentTime,
        percentage: percentage
      });
    },

    onPlay: function(){
      this.trigger('play');
    },

    onPause: function(){
      this.trigger('paused');
    },

    onStop: function(){
      this.trigger('stop');
    },

    updatePercentage: function(percentage){
      var currentTime = (percentage / 100) * this.videoLength;
      this.nativeVideoEl.currentTime = currentTime;
    },

    pauseVideo: function(){
      console.log('pause video');
      this.nativeVideoEl.pause();
    },

    playVideo: function(){
      console.log('play video');
      if(this.nativeVideoEl.paused || this.nativeVideoEl.ended){
        this.nativeVideoEl.play();
      }
    },

    currentPercentage: function(){
      return this.nativeVideoEl.currentTime / this.videoLength * 100;
    },

    embed_video: function(){
      var $videoTag = $('<video />'),
          $videoSrc = $('<source />');

      $videoTag.attr({
        autoplay: 1,
      });

      $videoSrc.attr({
        src: this.src,
        type: "video/mp4"
      });

      $videoTag.append($videoSrc);

      this.$videoTag = $videoTag;
      this.$container.append($videoTag);
      this.nativeVideoEl = $videoTag[0]
    }
  });

  window.VideoObject = VideoObject;

}(jQuery, window));
