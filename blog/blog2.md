
# \#2



## Canvas or HTML?

There seem to be two obvious routes to approaching this browser-based problem.
1. Reinventing the wheel and rendering every pixel to the canvas
2. Simply adding an editing capability to the existing markup formats (HTML) and rendering solutions (browsers), which are already excellent



### Choose canvas

This gives us full control.  

* Design an object structure with elements and text nodes.  
* Keep track of the actively focused element 
* Introduce a caret feature...  

...Yes, this _does_ sound familiar because browsers have already implemented these concepts.



### No, choose HTML

Browsers already offer the `contenteditable` and `designMode` attributes, which are highly exciting and offer a lot of promise.  Both of these methods appear to leap you toward 90% completion but unfortunately both fall down for similar reasons.  

The `contenteditable` attribute falls down when navigating via the arrow keys.  It handles movement within the active element very well but moving up and down between elements requires knowledge of character position.  This is not impossible but certainly isn't trivial.  It leads me back to the question from [blog 1](blog1.md): which kind of challenge do you want to solve?

The `designMode` attribute handles caret navigation brilliantly but does rely on a deprecated `execCommand` API.  Realistically, it will probably remain safe to use for quite some time but do you want to invest so many hours into a deprecated API?  It also handles nested lists marvellously but does come with quirks, such as adding `<br>` and `<div>` elements when leaping out of lists.  If we agree that any route I choose will consume hours of my life, would I prefer to use those hours being creative or use those hours tackling hacky workarounds?



### No, choose canvas

If we predict that both methods will eventually conclude in failure, this is the method I will learn most from.  Learning how to manage GUI rendering and line wrapping could well be transferred to other projects.  It's also the method apparently used by Google for their Docs suite, so it must be possible.
