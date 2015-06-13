//jquery free!

(function(utils, document, window){
  function VideoObject(prefix, src, container){
    this.prefix      = prefix;
    this.src         = src;
    this.container   = container;
    this.videoLength = 0;
    this.embed_video();
    this.bind();
  }

  utils.extend(VideoObject.prototype, utils.emitter, {
    bind: function(){
      this.nativeVideoEl.addEventListener('canplay',    this.onCanPlay.bind(this));
      this.nativeVideoEl.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      this.nativeVideoEl.addEventListener('play',       this.onPlay.bind(this)); 
      this.nativeVideoEl.addEventListener('pause',      this.onPause.bind(this));
      this.nativeVideoEl.addEventListener('stop',       this.onStop.bind(this));
      this.nativeVideoEl.addEventListener('click',      this.onVideoTagClick.bind(this));
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

      // the time update handler here to catch beginning moments of videos with very high segment granularity.
      this.onTimeUpdate();
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
      this.nativeVideoEl.pause();
    },

    playVideo: function(){
      if(this.nativeVideoEl.paused || this.nativeVideoEl.ended){
        this.nativeVideoEl.play();
      }
    },

    currentPercentage: function(){
      return this.nativeVideoEl.currentTime / this.videoLength * 100;
    },

    embed_video: function(){
      var videoTag = document.createElement('video'),
          videoSrc = document.createElement('source');

      videoTag.setAttribute('autoplay', 1);
      videoTag.id = this.container.id + '-VIDEO';
      videoSrc.setAttribute('src', this.src);
      videoSrc.setAttribute('type', 'video/mp4');

      videoTag.appendChild(videoSrc);

      this.container.appendChild(videoTag);
      this.nativeVideoEl = this.container.querySelector('video')
      console.log(this.nativeVideoEl);
    }
  });

  window.VideoObject = VideoObject;

}(utils, document, window));
