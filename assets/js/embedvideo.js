/* embedvideo
 * 
 * Creates a new VideoPlayer object
 * returns the VideoPlayer object.
 *
 * Required args:
 *
 * src - String
 *   the url of the video in mp4 format
 *
 * container - String
 *   the id of the container to append the video to
 *
 *
 *
 * Options:
 *
 * granularity - Double
 *   from .01 to 1.0
 *   default .5
 *   the number of segments / second 
 *   to split the video into for analytics
 *
 * autoplay - Boolean
 *   default true
 *   autoplay the video, or don't 
 *
 * volume - Double
 *   from 0.0 to 1.0
 *   default 1.0
 *   sets the volume of the player on initialization
 *
 * rewatchTreshold - Integer
 *   from 0 to 100
 *   default 25
 *   the percentage of the video rewatched required to trigger a thresholdExceeded event
 *
 * showStats - Boolean
 *   default false
 *   show the heatmap, or don't
 *
 * prefix - String
 *   default 'neils-video'
 *   Prefix added to all the elements created by the video player
 *
 */

function embedvideo(src, container, options){
  return new VideoPlayer(src, container, options); 
}
