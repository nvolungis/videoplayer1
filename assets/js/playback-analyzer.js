

/* PlaybackAnalyzer
 *
 * An interface to sit between the concerns of the player
 * and the concerns of collecting playback analytics. 
 * Potentially incorporate other analytics objects here. 
 *
 * Exposes three methods:
 *  
 * record
 * Accepts a data object that contains currentPercentage
 * and currentTime properties
 *
 * enableRecording
 * allow record events to be processes
 *  
 * disableRecoding
 * disallow record events from being processed
 *
 */


(function(MomentAnalyzer, utils, window){
  function PlaybackAnalyzer(duration, container, options){
    this.canRecord       = false;
    this.currentSegment  = {};
    this.options         = this.getDefaultOptions(options);
    this.momentAnalyzer  = new MomentAnalyzer(duration, container, options);
  }

  utils.extend(PlaybackAnalyzer.prototype, {
    record: function(data){
      if(!this.canRecord) return;

      if(this.currentSegment.start == undefined){
        this.currentSegment.start = data.currentTime;

      }else if(this.currentSegment.end == undefined){
        this.currentSegment.end = data.currentTime;
        this.momentAnalyzer.addSegment(this.currentSegment);

      }else{
        this.currentSegment.end = data.currentTime;
        this.momentAnalyzer.updateLastSegment(this.currentSegment);
      }
    },

    enableRecording: function(){
      this.canRecord = true;
    },

    disableRecording: function(){
      this.canRecord = false;
      this.currentSegment = {};
    },

    getDefaultOptions: function(options){
      var defaults = {};

      return utils.extend({}, defaults, options);
    }
  });

  window.PlaybackAnalyzer = PlaybackAnalyzer;
}(MomentAnalyzer, utils, window));
