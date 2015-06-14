# Wistia Video Player
Hi ladies and gents! Below are my thoughts on the video player project. I found it fun, challeneging, and think we got a pretty cool player out of it. 


## Most challenging Aspects

### 1 - Making the play head draggable

It took lots of playing around and sketches to figure out what was actually happening here. The most difficult part was translating the current x position of the mouse to a percentage based on the scroll bar width. Lots of things have to be take into account, namely the position of the player itself, the play bars dimensions, and how wide the play head is. I ended up with a flexible implementation – I can dynamically set the play head width in code and resize the player's container and everything still works.

### 2 - Building the segments representing continuous views

The biggest issue here was determining what constituted a view-segment and then accurately recording them. I arrived at a definiton that was: anything recorded between a play event and a pause/stop event is a view-segment. In the player, events are flying around frequently – sometimes many a second. I like using events to communicate between different modules in my code, but this time I had so many events and their ordering was so important that I actually got burned by the technique. The logical order that I assumed the callbacks would fire in did not end up being a reality. Not sure if it was an issue with the event loop, my event dispatcher or just my logic, but my "end segment" event was arriving too late to yeild the correct result. In the interest of time I decided to just change the way I was dispatching the event, moving those important callbacks into direct method invokations solved the problem. I would like to look into it a bit further though. 

### 3 - Determining the best way to derive meaning from those segments.

My initial approach to the analytics problem was to compare continuously viewed segments (we'll call them *view-segments*) to each other, detecting their overlapping portions, and using that data to build a table which I could then further analyze. The issue with this however is that not only did I have to detect *IF* they overlapped, I also had to detect by how much, where exactly that overlap was in time, and ultimately how many other segments were already overlapping in that space. That seemed really messy, and it also didn't seem like it would scale well – What if I wanted to know what percentage of the video that was viewed 3 times? n times?

Then I started thinking – it's not really overlaps that we care about here, its whether a specific moment was viewed or not. I could keep track of all the moments in the video in the form of segments which we'll call *moment-segments* (start of the moment to end of the moment) then if a moment-segment overlapped a view-segment, we'd know that moment was watched! Detecting the overlaps was easy because we could just test if they don't overlap, then return the inverse. Better still, detecting different numbers of rewatches became trivial – any time an overlap was detected, we'd just increment that moment's play count! 

To get a percentage of moments watched n times, just find all moments with a play count >= n and divide by the total number of moments. 

#### Drawbacks

If more percise accuracy was a requirement, this approach would not work. The very act of splitting the video up into segments means that we can only gather data as granular as those segments are defined. Of course we have the ability to set that granularity to anything we want, but at some point the performance would likely force a different solution – potentially more along the lines of my initial approach. 

The percentage calculation is also almost guaranteed to be a little bit off. Since it's likely that the length of a video will not be evenly divisible by the chosen moment-segment legnth, the last moment-segment of any run of this algorithm will almost always be different from the others. Thus using just the number of moment-segments played / total segments will be slightly off, the severity of which depends on (video length in seconds % num segments per second) and the number of moment-segments that get generated.

The clarity of the algorithm, as well as the flexibility to track an arbitrary number of rewatches seemed like a fair tradeoff for more precision in this case.

### 4 – Replacing jQuery

I initially built this on jQuery. Once I realized that wasn't an option, I went through piece by piece replacing the DOM code with native JS. I was then left with two components to swap out: the $.extends method and a custom eventemitter that leverages jquery's event system. The $.extends method was easy, but replacing the event system was a bit more difficult. I built an object that held a few different methods for wiring up and firing events. That object also had an _callbacks property where I stored the callbacks for registered events. I would then mix that object into the prototype of whatever function I wanted to have event capabilities. This worked great, but once I added a second video instance all my callbacks would fire twice. 

To figure out what was happeneing I created a minimal test case reproducing the problem. I tried a few different ways of mixing methods into the prototype before I realized what was going on. I was mixing the instance relevant _callbacks property into the prototype of my function meaning that it would be shared by all instances of that function. The fix was easy, just remove the _callbacks property from the prototype and add it after instantiaton. 


### What was new to me
Prior to this project I had limited experience with the video tag. I essentially only used it for background videos on websites and didn't much care about anything other than its canplay event. For this project I had to deal with lots more methods and learn more about how video loads and plays. I also hadn't built an algorithm to collect information like this – most of the time I'm dealing problems more concerned with UI and not raw data. Getting rid of jQuery was also a new and surprisingly rewarding experience. 

### What I would change
I'm always driving toward more modular code with logically derived boundaries. I think I did an okay job here, but something that kept bugging me was how I was passing options down from the main module to sub modules. On some ocassions, I'm passing options through 4 modules. Not sure what could be done about it, perhaps I need to make my module structure flatter vs. deeper. 

During development I built each of the modules independently in their own files, then used a build system to concatenate them together. If I had a little more time, I would have tweaked the build to export each module onto a non-global object, then only expose the embedvideo function to the window. Reducing the number of objects on the window is always good. 

It would be nice to expose a more thought out interface for the VideoObject instance returned by the embedvideo function. Adding play, pause, stop, and volume would be at the top of the list so another program could control the player. Adding destroy methods to all my objects would also be a huge win for people embedding in SPAs. 

### Support
Since this is an HTML5 player, browsers that don't support html5 video will not display the video. Furthermore since I'm using .addEventListener directly this code would blow up on any broswer that didn't support it (ie8 comes to mind). I'm also using some css3 stuff ( like repeating-linear-gradient ). I can't imagine this working too well on tablets either. I did not factor in any touch event handlers. The player is only provided with one source tag for mp4 format, so this wont work on any browsers that don't support that format ( know old firefox doesn't – are they still only OGG? )

## How the analyzer works / performance analysis
  
### Initialization
  
- Get the legnth of the video and slice it up into x-length segments (called moments in my code)
- Create an object for each moment with a start, end, plays, and index property
- shove them an an array.


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
number of moments (n —  comparison against segment) + number of moments (n —  summation) 

This looks like 2n, or O(n) for each 'timeChanged' event to me. 

