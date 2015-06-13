

/* VideoWrapper
 * 
 * Creates and adds a video object and adds it to the container argument.
 * Hooks up to the native video events and exposes a more tailored
 * api.
 *
 */


(function(utils, document, window){
  function VideoWrapper(src, container, options){
    this.src         = src;
    this.container   = container;
    this.options     = options;
    this.videoLength = 0;

    this.embedVideo();
    this.updateVolume(this.options.volume);
    this.bind();
  }

  utils.extend(VideoWrapper.prototype, utils.emitter, {
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

    updateVolume: function(volume){
      this.nativeVideoEl.volume = volume;
    },

    currentPercentage: function(){
      return this.nativeVideoEl.currentTime / this.videoLength * 100;
    },

    embedVideo: function(){
      var videoTag = document.createElement('video'),
          videoSrc = document.createElement('source');

      if(this.options.autoplay){
        videoTag.setAttribute('autoplay', 1);
      }

      videoTag.id = this.container.id + '-VIDEO';
      videoSrc.setAttribute('src', this.src);
      videoSrc.setAttribute('type', 'video/mp4');

      videoTag.appendChild(videoSrc);

      this.container.appendChild(videoTag);
      this.nativeVideoEl = this.container.querySelector('video')
    }
  });

  window.VideoWrapper = VideoWrapper;
}(utils, document, window));
