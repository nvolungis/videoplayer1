(function($, SegmentAnalyzer, window){
  function PlaybackAnalyzer(){
    this.canRecord       = false;
    this.segmentAnalyzer = new SegmentAnalyzer(100);
  }

  $.extend(PlaybackAnalyzer.prototype, $.eventEmitter, {
    record: function(data){
      if(!this.canRecord) return;

      this.segmentAnalyzer.update(data.currentTime);

      return;

      // var len;

      // len = this.currentSegment.length;
      //
      // if(len == 0){
      //   this.currentSegment[0] = data.currentTime;
      // }else {
      //   this.currentSegment[1] = data.currentTime;
      //   this.segmentAnalyzer.updateLastSegment(this.currentSegment);
      // }
    },

    enableRecording: function(){
      this.canRecord = true;
    },

    disableRecording: function(){
      this.canRecord = false;
    }
  });

  window.PlaybackAnalyzer = PlaybackAnalyzer;
}(jQuery, SegmentAnalyzer, window));


