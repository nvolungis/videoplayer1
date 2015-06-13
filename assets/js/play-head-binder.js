//jquery free!!

(function(utils, window){

  function PlayHeadBinder(envData){
    this.envData = envData;
    this.bind();
    this.currentPercentage = 0;
    this.gutter = 10;
  }

  utils.extend(PlayHeadBinder.prototype, utils.emitter, {
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
      var adjustedClientX, percentage;

      adjustedClientX = (10 - this.envData.offsetX) + clientX;
      percentage = ((adjustedClientX - (this.envData.playerOffsetX + this.gutter)) / (this.envData.playerWidth - (this.gutter * 2))) * 100;

      if(percentage < 0){
        percentage = 0;
      }else if(percentage > 100){
        percentage = 100
      }

      if(percentage != this.currentPercentage){
        this.currentPercentage = percentage
        this.trigger('new:target:percentage', percentage)
      }
    },

    destroy: function(){
      this.unbind();
    }
  });

  window.PlayHeadBinder = PlayHeadBinder;

}(utils, window));
