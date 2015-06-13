document.addEventListener('DOMContentLoaded', function(){
  var src1 = 'https://embed-ssl.wistia.com/deliveries/9d1b76aa6e0d90c8bae735bf7d2737d0135053b5/file.mp4',
      src2 = 'http://red-sox-pano.netlify.com/video/redsox_bg_v1.mp4',
      videopayer,
      options = {
        rewatchThreshold: 10,
        showStats: true,
        autoplay: true, 
        volume: 0
      };

   videoplayer  = new VideoPlayer(src1, 'video1', options);
});
