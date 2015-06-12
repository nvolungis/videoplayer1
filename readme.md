# Wistia Video Player
Hi ladies and gents! Below are my thoughts and responses on the video player project. I found it fun, challeneging, and an all around good time. 


## Most challenging Aspects

I had built something akin to a video player before so I was aware of the obstacles concerning progress bars – specifically how they behave as both slave and master. On the analytics side, two challeneges stand out:


### 1 - Building the segments representing continuous views

The biggest issue here was determining what constituted a segment view and then accurately recording them. I arrived at a definiton that was: anything recorded between a play event and a pause/stop event is a view-segment. In the player, events are flying around frequently – sometimes many a second. I like using events to communicate between different modules in my code, but this time I had so many events and their ordering was so important that I actually got burned by the technique. The logical order that I assumed the callbacks would fire in did not end up being a reality. Not sure if it was an issue with the event loop, my event dispatcher or just my logic, but my "end segment" event was arriving too late to yeild the correct result. In the interest of time I decided to just change the way I was dispatching the event, moving those important callbacks into direct method invokations solved the problem. I would like to look into it a bit further though. 

### 2 - Determining the best way to derive meaning from those segments.

My initial approach to the analytics problem was to compare continuously viewed segments (we'll call them *view-segments*) to each other, detecting their overlapping portions, and using that data to build a table which I could then further analyze. The issue with this however is that not only did I have to detect *IF* they overlapped, I also had to detect by how much, where exactly that overlap was in time, and ultimately how many other segments were already overlapping in that space. That seemed really messy, and it also didn't seem like it would scale well – What if I wanted to know what percentage of the video that was viewed 3 times? n times?

Then I started thinking – it's not really overlaps that we care about here, its whether a specific moment was viewed or not. I could keep track of all the moments in the video in the form of segments which we'll call *moment-segments* (start of the moment to end of the moment) then if a moment-segment overlapped a view-segment, we'd know that moment was watched! Detecting the overlaps was easy because we could just test if they don't overlap, then return the inverse. Better still, detecting different numbers of rewatches became trivial – any time an overlap was detected, we'd just increment that moment's play count! 

To get a percentage of moments watched n times, just find all moments with a play count >= n and divide by the total number of moments. 


### Drawbacks
If more percise accuracy was a requirement, this approach would not work. The very act of splitting the video up into segments means that we can only gather data as granular as those segments are defined. Of course we have the ability to set that granularity to anything we want, but at some point the performance would likely force a different solution – potentially more along the lines of my initial approach. 

The percentage calculation is also almost guaranteed to be a little bit off. Since it's likely that the length of a video will not be evenly divisible by the chosen moment-segment legnth, the last moment-segment of any run of this algorithm will almost always be different from the others. Thus using just the number of moment-segments played / total segments will be slightly off, the severity of which depends on (video length in seconds % num segments per second) and the number of moment-segments that get generated.

The clarity of the algorithm, as well as the flexibility to track an arbitrary number of rewatches seemed like a fair tradeoff for more precision in this case.

### What was new to me
Prior to this project I had limited experience with the video tag. I essentially only used it for background videos on websites and didn't much care about anything other than its canplay event. I also hadn't built an algorithm to collect information like this, so that was fun and new.

### What I would change
I'm always driving toward more modular code with logically derived boundaries. I think I did an okay job here, but the boundaries maybe weren't drawn as well as the should have been. One thing I noted was having to reach into my video object (wraps the native video object) and pull out the duraiton to pass through to other modules. That felt a little funky. 

If this were a real player, I also wouldn't want to depend on jquery. I learn hard on the $ for my event bus, but if there were real reasons not to use jquery I'd say pulling that would would on the list. 

It would also be smart to use a proper module system. I used requirejs a while ago to build a backbone app, but i hated the way it looked and worked, and when I started using rails as my back end for most projects I could dictate the load order in my manifest file. I suppose I've been stuck in that paradigm ever since for the most part. One place that I do use modules however is in my pet embercli projects. Having that pipeline set up for ES6 transpiling is AWESOME and I've really enjoyed my limited experience with it. If I were to incorporate a module system into any of my projects at this point, it would probably be transpiled ES6 to globals. 

I also would try to avoid building so much DOM in js directly. Although the DOM Im building is purely for show and, if this were a real project, would probably exists already outside of this module, it still felt a little ugly to me. 

### Support
Since this is an HTML5 player, browsers that don't support html5 video will not display the video. Furthermore since I'm using .addEventListener directly this code would blow up on any broswer that didn't support it (ie8 comes to mind). It would have diferent issues accross the 

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
- each time more than two uninterupted 'timeChanged' events are detected, a segment is defined composed of the starttime and endtime of the uniterupted portion of video currently being viewed.
- each subsequent uniterrupted 'timeChanged' event will overwrite the endtime of that segment. 
- loop through each moment and determine if it touches the segment currently being viewed
- if so, record that that moment was watched for this segment.
- after all moments have been compared, add that segments watched moments to the aggregate watched moments (just temporarily, dont mutate the actual aggregate watches yet) and compare the number of moments with plays > (target play count) to the total number of moments, resulting in the percentage of the video with as least (target play count) views.
- compare that percentage with the threshold for (target play count) view percentages and fire an event if its exceeded.
- when watching is interupted (pause, stop, playehead drag, playbar clicked) add its watched moments to an aggregate record of watched moments.

#### Run Time
number of moments (n —  comparison against segment) + number of moments (n —  summation) 

This looks like 2n, or O(n) to me. 









