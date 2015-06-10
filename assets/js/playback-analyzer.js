(function($, SegmentAnalyzer, window){
  function PlaybackAnalyzer(duration){
    this.canRecord       = false;
    this.currentSegment  = {};
    this.segmentAnalyzer = new SegmentAnalyzer(duration);
  }

  $.extend(PlaybackAnalyzer.prototype, $.eventEmitter, {
    record: function(data){
      if(!this.canRecord) return;

      if(this.currentSegment.start == undefined){
        this.currentSegment.start = data.currentTime;

      }else if(this.currentSegment.end == undefined){
        this.currentSegment.end = data.currentTime;
        this.segmentAnalyzer.addSegment(this.currentSegment);

      }else{
        this.currentSegment.end = data.currentTime;
        this.segmentAnalyzer.updateLastSegment(this.currentSegment);
      }
    },

    enableRecording: function(){
      this.canRecord = true;
    },

    disableRecording: function(){
      this.canRecord = false;
      this.currentSegment = {};
    }
  });

  window.PlaybackAnalyzer = PlaybackAnalyzer;
}(jQuery, SegmentAnalyzer, window));


