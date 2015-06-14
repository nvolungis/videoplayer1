

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

    this.init();
    this.bind();
  }

  utils.extend(PlayHeadDragger.prototype, utils.emitter, {
    init: function(){
      this._onMouseMove = this.onMouseMove.bind(this);
    },

    bind: function(){
      window.addEventListener('mousemove', this._onMouseMove);
    },

    unbind: function(){
      window.removeEventListener('mousemove', this._onMouseMove);
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
      var adjustedClientX = this.getAdjustedClientX(clientX),
          numerator       = adjustedClientX - (this.envData.playerOffsetX),
          denominator     = this.envData.playerWidth - (this.envData.gutter * 2),
          percentage      = (numerator / denominator) * 100;

      if(percentage < 0){
        percentage = 0;
      }else if(percentage > 100){
        percentage = 100
      }

      return percentage;
    },

    getAdjustedClientX: function(clientX){
      var adjustedClientX = (-this.envData.offsetX) + clientX,
          leftOfPlayhead = this.envData.playHeadLabelRightX - (this.envData.clientX),
          offset;

      if(leftOfPlayhead > 0){
        offset = this.envData.playHeadLabelWidth;
        adjustedClientX += offset;
      }

      return adjustedClientX;
    },

    destroy: function(){
      this.unbind();
    }
  });

  window.PlayHeadDragger = PlayHeadDragger;

}(utils, window));
