

/* PlayBar
 * 
 * Creates and adds a playBar to the container argument.
 * Accepts data for updating the bar to the current video position, 
 * and also sends data to its instantiator on click and playhead drag.
 *
 */


(function(PlayHeadDragger, utils, document, window){
  function PlayBar(prefix, container){
    this.prefix    = prefix; 
    this.container = container;

    this.init();
  }

  utils.extend(PlayBar.prototype, utils.emitter, {
    init: function(){
      this.embedPlayBar();
      this.bind();
    },

    bind: function(){
      this.playHead.addEventListener('mousedown', this.onPlayHeadMousedown.bind(this));
      this.playHead.addEventListener('click',     this.onPlayHeadClick.bind(this));
      this.playBar.addEventListener('click',      this.onPlayBarClick.bind(this));
      this.on('video:made:progress',              this.onVideoProgress.bind(this));
      window.addEventListener('mouseup',          this.onMouseup.bind(this));
    },

    onPlayHeadMousedown: function(e){
      this.playHead.setAttribute('data-is-dragging', true)
      this.trigger('play:head:startdrag');
      this.createPlayHeadDragger(e);
    },

    onMouseup: function(e){
      if(!this.playHeadDragger) return;
      this.playHead.setAttribute('data-is-dragging', false)
      this.destroyPlayHeadDragger();
      this.trigger('play:head:enddrag');
    },

    onPlayHeadClick: function(e){
      e.preventDefault();
      e.stopPropagation();
    },

    onPlayBarClick: function(e){
      var percentage = (e.clientX - this.container.getBoundingClientRect().left) / this.container.offsetWidth * 100;
      this.trigger('progress:bar:clicked', percentage);
    },

    createPlayHeadDragger: function(e){
      var data = {
        playerWidth: this.container.offsetWidth,
        playerOffsetX: this.container.getBoundingClientRect().left,
        playHeadWidth: this.playHead.offsetWidth,
        clientX:e.clientX,
        offsetX:e.offsetX
      };

      this.playHeadDragger = new PlayHeadDragger(data);
      this.playHeadDragger.on('new:target:percentage', this.onNewTargetPercentage.bind(this));
    },

    destroyPlayHeadDragger: function(){
      this.playHeadDragger.off('new:target:percentage');
      this.playHeadDragger.destroy();
      delete this.playHeadDragger;
    },

    onNewTargetPercentage: function(e, percentage){
      this.trigger('play:head:dragged', percentage);
      this.updateProgressBar(percentage);
    },

    onVideoProgress: function(e, data){
      this.updateHeadLabel(data.currentTime);

      if(this.playHeadDragger) return;
      this.updateProgressBar(data.percentage);
    },

    updateProgressBar: function(percentage){
      var style = this.progressBar.style;
      style.width = percentage + '%';
    },

    updateHeadLabel: function(currentTime){
      var secs         = parseInt(currentTime),
          mins         = Math.floor(secs / 60),
          display_secs = secs - (mins * 60),
          time         = mins + ':' + ("0" + display_secs).slice(-2);

       this.playHeadLabel.innerHTML = time;
    },

    embedPlayBar: function(){
      var playBar           = document.createElement('div'),
          playBarPositioner = document.createElement('div'),
          progressBar       = document.createElement('div'),
          playHead          = document.createElement('div'),
          playHeadLabel     = document.createElement('div');

      playBar.setAttribute('class', this.prefix + '-play-bar');
      this.playBar = playBar;

      playBarPositioner.setAttribute( 'class', this.prefix + '-play-bar-positioner');

      progressBar.setAttribute('class', this.prefix + '-progress-bar');

      playHead.setAttribute('class', this.prefix + '-play-head');
      this.playHead = playHead;

      playHeadLabel.setAttribute('class', this.prefix + '-play-head-label');
      this.playHeadLabel = playHeadLabel;
      playHead.appendChild(playHeadLabel);

      progressBar.appendChild(playHead);
      this.progressBar = progressBar;

      playBarPositioner.appendChild(progressBar);
      playBar.appendChild(playBarPositioner);
      this.container.appendChild(playBar);
    }
  });

  window.PlayBar = PlayBar;
}(PlayHeadDragger, utils, document, window ));
