

/* PlayHeadDragger
 *
 * Helps to encapsulate the somewhat complex interaction of
 * dragging the playhead around. Emits an event that contains
 * the target progress percentage for the video. 
 *
 */


(function(utils, window){
  function PlayHeadDragger(envData){
    this.currentPercentage = 0;
    this.envData           = envData;
    this.gutter            = 10;

    this.bind();
  }

  utils.extend(PlayHeadDragger.prototype, utils.emitter, {
    bind: function(){
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
    },

    unbind: function(){
      window.removeEventListener('mousemove');
    },

    onMouseMove: function(e){
      this.broadcastPercentage(e.clientX);
    },

    broadcastPercentage: function(clientX){
      var percentage = this.getPercentage(clientX);

      if(percentage != this.currentPercentage){
        this.currentPercentage = percentage
        this.trigger('new:target:percentage', percentage)
      }
    },

    getPercentage: function(clientX){
      var adjustedClientX = (10 - this.envData.offsetX) + clientX,
          numerator       = adjustedClientX - (this.envData.playerOffsetX + this.gutter),
          denominator     = this.envData.playerWidth - (this.gutter * 2),
          percentage      = (numerator / denominator) * 100;

      if(percentage < 0){
        percentage = 0;
      }else if(percentage > 100){
        percentage = 100
      }

      return percentage;
    },

    destroy: function(){
      this.unbind();
    }
  });

  window.PlayHeadDragger = PlayHeadDragger;

}(utils, window));
