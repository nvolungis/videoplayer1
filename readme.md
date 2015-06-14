# Wistia Video Player
Hi ladies and gents! Below are my thoughts on the video player project. I found it fun, challenging, and think we got a pretty cool player out of it. 

#### Developed on and tested against chrome =]=]

## How to use it

```
<html>
  <head>
    <link rel="stylesheet" href="neilsplayer.css" />
  <head>
  
  <body>
    <div id='player'></div>
    
    <script src="neilsplayer.js"></script>
    <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', function(){ 
        var src, options, player;
        
        src = 'https://embed-ssl.wistia.com/deliveries/9d1b76aa6e0d90c8bae735bf7d2737d0135053b5/file.mp4'
        options = {
          showStats: true
        }
        
        player = embedvideo(src, 'player', options);
      });
    </script>
  </body>
</html>
```

### Required arguments
#### src
- String
- the url of the video in mp4 format    

#### container 
- String 
- the id of the container to append the video to 

### Options
#### granularity 
- Double
- .01 to 1.0
- default .5 
- the number of segments / second to split the video into for analytics

#### autoplay
- Boolean
- default true
- autoplay the video, or don't =]

#### volume
- Double
- from 0.0 to 1.0
- default 1.0
- sets the volume of the player on initialization

#### rewatchThreshold
- Integer
- from 1 to 100
- default 25
- the percentage of the video rewatched required to trigger a thresholdExceeded event

#### showStats
- Boolean
- default false
- displays watch and rewatch percentages as well as a heatmap of the most rewatched areas

#### prefix
- String
- default 'neils-video' 
- Prefix added to all the elements created by the video player 
- *note*: changing this will break the included style sheet

## Most challenging aspects

### 1 - Making the play head draggable
It took lots of playing around and sketches to figure out what was actually happening here. The most difficult part was translating the current x position of the mouse to a percentage based on the scroll bar width. Lots of things have to be take into account, namely the position of the player itself, the play bar's dimensions, and how wide the play head is. I ended up with a flexible implementation – I can dynamically set the play head width in code and resize the player's container and everything still works.

### 2 - Building the segments representing continuous views
The biggest issue here was determining what constituted a view-segment and then accurately recording them. I arrived at the following definition: anything recorded between a play event and a pause/stop event is a view-segment. Since I hooked the analyzer up to the 'timeChanged' event I was receiveing more info that I actually wanted. For instance, whenever the play head is dragged the currentTime attribute of the video is updated which results in a 'timeChanged' event. Since these events aren't coming from organic play, the analyzer needs to know to ignore them. Then when the video starts playing normally it needs to be told to pay attention again. Getting this just right was challenging. 

### 3 - Determining the best way to derive meaning from those segments
My initial approach to the analytics problem was to compare view-segments to each other, detecting their overlapping portions, and using that data to build a table which I could then further analyze. The issue with this however is that not only did I have to detect *IF* they overlapped, I also had to detect by how much, where exactly that overlap was in time, and ultimately how many other segments were already overlapping in that space. That seemed really messy, and it also didn't seem like it would scale well – What if I wanted to know what percentage of the video was viewed 3 times? n times?

Then I started thinking – it's not really overlaps that we care about here, it's whether a specific moment was viewed or not. I could keep track of all the moments in the video in the form of moment-segments (start of the moment to end of the moment) then if a moment-segment overlapped a view-segment, we'd know that moment was watched! Detecting the overlaps was easy because we could just test if they don't overlap, then return the inverse. Better still, detecting different numbers of rewatches became trivial – any time an overlap was detected, we'd just increment that moment's play count! 

To get a percentage of moments watched n times, just find all moments with a play count >= n and divide by the total number of moments. 

#### Drawbacks
If more percise accuracy was a requirement, this approach would not work. The very act of splitting the video up into segments means that we can only gather data as granular as those segments are defined. Of course we have the ability to set that granularity to anything we want, but at some point the performance would likely force a different solution – potentially more along the lines of my initial approach. 

The percentage calculation is also almost guaranteed to be a little bit off. Since it's likely that the length of a video will not be evenly divisible by the chosen moment-segment legnth, the last moment-segment of any run of this algorithm will almost always be different from the others. Thus using just the number of moment-segments played / total segments will be slightly off, the severity of which depends on (video length in seconds % num segments per second) and the number of moment-segments that get generated.

The clarity of the algorithm, as well as the flexibility to track an arbitrary number of rewatches seemed like a fair tradeoff for more precision in this case.

### 4 – Replacing jQuery
I initially built this on jQuery. Once I realized that wasn't an option, I went through piece by piece replacing the DOM code with native JS. I was then left with two components to swap out: the $.extends method and a custom eventemitter that leverages jquery's event system. The $.extends method was easy, but replacing the event system was a bit more difficult. I built an object that held a few different methods for wiring up and firing events. That object also had an _callbacks property where I stored the callbacks for registered events. I would then mix that object into the prototype of whatever function I wanted to have event capabilities. This worked great, but once I added a second video instance all my callbacks would fire twice. 

To figure out what was happeneing I created a minimal test case reproducing the problem. I tried a few different ways of mixing methods into the prototype before I realized what was going on. I was mixing the instance relevant _callbacks property into the prototype of my function meaning that it would be shared by all instances of that function. The fix was easy, just remove the _callbacks property from the prototype and add it after instantiaton. 


### What was new to me
Prior to this project I had limited experience with the video tag. I essentially only used it for background videos on websites and didn't much care about anything other than it's canplay event. For this project I had to deal with lots more methods and learn more about how video loads and plays. I also hadn't built an algorithm to collect information like this – most of the time I'm dealing with problems more concerned with UI and not raw data. Getting rid of jQuery was also a new and surprisingly rewarding experience. 

### What I would change
I'm always driving toward more modular code with logically derived boundaries. I think I did an okay job here, but something that kept bugging me was how I was passing options down from the main module to sub modules. On some ocassions, I'm passing options through 4 modules. Not sure what could be done about it, perhaps I need to make my module structure flatter vs. deeper. I'd love to hear your thoughts on my overall structure!

During development I built each of the modules independently in their own files, then used a build system to concatenate them together. If I had a little more time, I would have tweaked the build to export each module onto a non-global object, then only expose the embedvideo function to the window. Reducing the number of objects on the window is always good. 

It would be nice to expose a more thought out interface for the VideoObject instance returned by the embedvideo function. Adding play, pause, stop, and volume would be at the top of the list so another program could control the player. Adding destroy methods to all my objects would also be a huge win for people embedding in SPAs. 

I could also do a better job of validating the required arguments. If an invalid container id is supplied the player will just error out. Same goes for the src – if the browser can't play the supplied video the player doesn't error out gracefully. 

The buffer progress bar width reflects the largest buffer.end(n) value found. I initially tried aggregating all the buffer timeRange objects attached to the video tag, but that didn't give me the desired behavior. Given more time I'd look more into how to make this more accurate.

If you check out the heat map (and you should!) you may see some vertical white lines dispersed throughout. These come from pixel rounding. If you resize the browser you will see that they go away and return in different, random locations. If I were to build something like this for real, I'd probably visualize that data with D3 to canvas or some other canvas based solution.

### Support
Since this is an HTML5 player, browsers that don't support html5 video will not display the video. Furthermore since I'm using .addEventListener directly this code would blow up on any broswer that didn't support it (ie8 comes to mind). I'm also using some css3 stuff ( like repeating-linear-gradient ). I can't imagine this working too well on tablets either. I did not factor in any touch event handlers. The player is only provided with one source tag for mp4 format, so this wont work on any browsers that don't support that format ( know old firefox doesn't – are they still only OGG? )

## How the analyzer works / performance analysis
  
### Initialization
- Get the legnth of the video and slice it up into x-length segments (called moments in my code)
- Create an object for each moment with a start, end, plays, and index property
- shove them on an array.

#### Run Time
video length in seconds (n) * number of moments per second (c)
This would equal O(Cn), or just O(n)


### Percentage Viewed Calculation
- invoked by a 'timeChanged' event on the video object
- each time more than two uninterupted 'timeChanged' events are detected, a moment is defined composed of the starttime and endtime of the uniterupted portion of video currently being viewed.
- each subsequent uniterrupted 'timeChanged' event will overwrite the endtime of that segment. 
- loop through each moment and determine if it touches the segment currently being viewed
- if so, mark that moment watched for this segment.
- after all moments have been compared, add that segments watched moments to the aggregate watched moments (just temporarily, dont mutate the actual aggregate watches yet) and compare the number of moments with plays > (target play count) to the total number of moments The result is the percentage of the video with as least (target play count) views.
- compare that percentage with the threshold for (target play count) view percentages and fire an event if it's met.
- when watching is interupted (pause, stop, playehead drag, playbar click) add it's watched moments to the aggregate record of watched moments.

#### Run Time
number of moments (n) (during comparison against current segment) + number of moments (n) ( summation against aggregate moment data) + C (number moments watched / total moments)

This looks like 2n, or O(n) for each 'timeChanged' event to me. 

## Modularity / Flexibility

The player is built in a way to allow for multiple embeds on a single page. You can even pass them the same containerid!

Changing the target rewatch percentage is very easy. The player will default to 25%, but it can be changed by passing a rewatchThreshold value in the options object.

The player performs well on short and medium length videos. I have not tested a four hour long video but I have no reason to believe there would be issues. My implementation of the heat map may break down given an extraordinary amount of moments due to limitations with the DOM, but as discussed earlier it was just a proof of concept. 


### Thank you!!
This was a great project and I feel like it really let's you see how I code and what I'm about. My number one goal when I'm writing code is to make it as understandable and readable as possible (it's also nice if it actually does stuff!) and I hope that comes through in this project. I can't wait to hear what you have to say about it!

Neil
