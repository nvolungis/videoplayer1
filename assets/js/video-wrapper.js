

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
      this.nativeVideoEl.addEventListener('progress',   this.onBufferProgress.bind(this));
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

    onBufferProgress: function(){
      var buffer     = this.nativeVideoEl.buffered,
          len        = buffer.length,
          largestEnd = 0;

      for(i=0; i<len; i+=1){
        if(buffer.end(i) > largestEnd){
          largestEnd = buffer.end(i);
        }
      }

      percentage = (largestEnd / this.nativeVideoEl.duration) * 100;
      this.trigger('buffer:updated', percentage);
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

    getAuxContainer: function(){
      return this.auxContainer;
    },

    getVidContainer: function(){
      return this.vidContainer;
    },

    getEmbedContainer: function(){
      return this.embedContainer;
    },

    embedVideo: function(){
      var videoTag       = document.createElement('video'),
          videoSrc       = document.createElement('source'),
          auxContainer   = document.createElement('div'),
          vidContainer   = document.createElement('div'),
          embedContainer = document.createElement('div');

      if(this.options.autoplay){
        videoTag.setAttribute('autoplay', 1);
      }

      videoTag.id = this.container.id + '-VIDEO';
      videoSrc.setAttribute('src', this.src);
      videoSrc.setAttribute('type', 'video/mp4');

      videoTag.appendChild(videoSrc);

      vidContainer.setAttribute('class', this.options.prefix + '-vid-container');
      vidContainer.appendChild(videoTag);
      this.vidContainer = vidContainer;

      auxContainer.setAttribute('class', this.options.prefix + '-aux-container');
      this.auxContainer = auxContainer;

      embedContainer.setAttribute('class', this.options.prefix + '-embed-container');
      embedContainer.appendChild(vidContainer);
      embedContainer.appendChild(auxContainer);
      this.embedContainer = embedContainer;

      this.container.appendChild(embedContainer);
      this.nativeVideoEl = videoTag;
    }
  });

  window.VideoWrapper = VideoWrapper;
}(utils, document, window));
