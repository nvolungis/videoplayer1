(function($, PlayHeadBinder, window){
  function PlayBar(prefix, $container){
    this.prefix = prefix; 
    this.$container = $container;
    this.init();
  }

  $.extend(PlayBar.prototype, $.eventEmitter, {
    init: function(){
      this.embedPlayBar();
      this.bind();
    },

    bind: function(){
      this.bindVideoProgress();
      this.$playHead.on('mousedown', this.onPlayHeadMousedown.bind(this));
      this.$playHead.on('click',     this.onPlayHeadClick.bind(this));
      this.$playBar.on('click',      this.onPlayBarClick.bind(this));
      $(window).on('mouseup',        this.onMouseup.bind(this));
    },

    onPlayHeadMousedown: function(e){
      this.trigger('play:head:startdrag');
      this.unbindVideoProgress();
      this.createPlayHeadDragger(e);
    },

    onMouseup: function(e){
      if(!this.playHeadBinder) return;
      this.bindVideoProgress();
      this.destroyPlayHeadDragger();
      this.trigger('play:head:enddrag');
    },

    onPlayHeadClick: function(e){
      e.preventDefault();
      e.stopPropagation();
    },

    onPlayBarClick: function(e){
      var percentage = (e.clientX - this.$container.offset().left) / this.$container.width() * 100;
      this.trigger('progress:bar:clicked', percentage);
    },

    onPlayBarMouseup: function(e){
      
    },

    createPlayHeadDragger: function(e){
      var data = {
        playerWidth: this.$container.width(),        
        playerOffsetX: this.$container.offset().left,
        playHeadWidth: this.$playHead.width(),
        clientX:e.clientX,
        offsetX:e.offsetX
      };

      this.playHeadBinder = new PlayHeadBinder(data);
      this.playHeadBinder.on('new:target:percentage', this.onNewTargetPercentage.bind(this));
    },

    destroyPlayHeadDragger: function(){
      this.playHeadBinder.off('new:target:percentage');
      this.playHeadBinder.destroy();
      delete this.playHeadBinder;
    },

    onNewTargetPercentage: function(e, percentage){
      this.trigger('play:head:dragged', percentage);
      this.updateProgressBar(percentage);
      console.log('log current time here');
    },

    bindVideoProgress: function(){
      this.on('video:made:progress', this.onVideoProgress.bind(this));
    },

    unbindVideoProgress: function(){
      this.off('video:made:progress');
    },

    onVideoProgress: function(e, data){
      this.updateProgressBar(data.percentage);
      this.updateHeadLabel(data.currentTime);
    },

    updateProgressBar: function(percentage){
      this.$progressBar.css({
        width: percentage + '%'
      });
    },

    updateHeadLabel: function(currentTime){
      // console.log('update head label', currentTime);
    },

    embedPlayBar: function(){
      var $playBar = $('<div />'),
          $playBarPositioner = $('<div />'),
          $progressBar = $('<div />'),
          $playHead = $('<div />');

      $playBar.attr({
        class: this.prefix + '-play-bar'
      });

      this.$playBar = $playBar;

      $playBarPositioner.attr({
        class: this.prefix + '-play-bar-positioner'
      });

      $progressBar.attr({
        class: this.prefix + '-progress-bar'
      });

      $playHead.attr({
        class: this.prefix + '-play-head'
      });

      this.$playHead = $playHead;

      $progressBar.append($playHead);
      this.$progressBar = $progressBar;

      $playBarPositioner.append($progressBar);

      $playBar.append($playBarPositioner);

      this.$container.append($playBar);
    }
  });

  window.PlayBar = PlayBar;
}(jQuery, PlayHeadBinder, window ));
