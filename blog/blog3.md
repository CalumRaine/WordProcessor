
# \#3



## Encapsulation of Responsibilities

Coding is beautiful when each object can carry out its function while remaining blind to the outside world.  It's been said _(perhaps by Linus Torvalds?)_ that each blank project signifies an empty universe in which we will create the rules.  When a project becomes taut and difficult, I believe it's usually a sign that you have failed to truly understand your own universe and are therefore tripping over your own laws of physics.

This is one of those projects where writing well-encapsulated objects is challenging.

I've come to realise that the management of document `content` should be segregated from document `display`.  This is challenging for a number of reasons:



### The caret interfaces between two worlds

Generally speaking, the caret is very much a document `content` concern.  It represents where the next character should be inserted in the text buffer and navigating left and right simply transfers the caret back and forth within that buffer.  However, navigating up and down via the arrow keys is very much a document `display` concern because it requires knowledge of character position in a line (which is wrapped with respect to page width).  This leads to the next problem.



### What is a line?

If you've been programming with ASCII files for a long time then it's easy to define a line as a string of text that continues up until the user enters a carriage return.  However, when displaying text, it very quickly becomes clear that one _text_ line can become many _wrapped_ lines on-screen.

The same is true of pages.  While the user may insert a page break after 3000 words, that first page may actually wrap into six pages on-screen.



### Structure

I have currently settled on the following structure:

* Document
    * Content
        * Sections
            * Elements
                * Words
                    * Characters\*
    * Display
        * Pages
            * Lines
                * Wrapped words
                    * Characters\*
    * Caret

\* _(Same object, shared)_

The `caret` object contains properties that reference the `section`, `element`, `word` and `character` that owns it in the `content` tree.  As discussed at the end of this blog post, characters bridge both worlds too and so the `display` tree can also locate the caret by sourcing the `character` that owns it.


### Why words?

The decision to implement `word` objects instead of just a general text buffer could be seen as excessive and does bring difficulties, however text is very rarely treated as a single block of characters.  Lines try to avoid wrapping within words and instead break at whitespace characters.  Similarly, wrapped lines usually omit any whitespace from the beginning and commence at the first true word instead.  Furthermore, holding `Ctrl` while navigating or hitting backspace will skip/erase entire words.  Instead of repeatedly scanning for words and whitespace on-the-fly, I parse the text buffer into `word` objects.  These `word` objects interleave as two types: whitespace words and _true_ words.  

This method does involve frequently clearing empty words and concatenating adjacent words of the same type but I think it's worth it.  One day I will thank myself for how easily I can report a word count.  Until then, I shall berate myself for how complicated I have made a text buffer.



### Who owns the caret?

I have often found myself drowning in life's great philosophical question of: what is a caret?  At first glance, it sits between two characters and therefore probably requires a `before` and `after` property - a little bit like linked lists - where one or both become null at the beginning/end of lines.  It only takes one more sip of coffee before we realise how tiring that will be to manage and how it will spell trouble for our _"blind to the outside world"_ mantra.  

I first cowered from this fear by deciding that one character can own the caret, which is always positioned _after_ that character, thereby marking where text should be inserted.  I shan't confess how long I spent coding this idea before encountering how impossible it is to position the caret at the start of a line, prior to all text.

I've now settled on a system where one character owns the caret, which can be positioned on either side of it.



### Characters also bridge two worlds

Much like the caret, characters seem to obviously fall under the `content` umbrella and yet their `display` duties are inescapable.  Parsing the document `content` into a document `display` requires many height and width calculations, which are all dependent on the dimensions of constituent characters.  Likewise, displaying the length, slant, thickness and colour of the caret also depends on the format of the character that owns it.

Each character therefore owns a `style` object and is rendered individually.  Even if it would be more efficient to render similarly-styled characters in one action, the rendering calculation must still be carried out in order to gain knowledge of character position and width (as mentioned in [blog 2](blog2.md)).  Having said that, I don't think I'll get away with rendering characters individually for much longer and so must soon face up to the prospect of implementing a system akin to HTML `<span>` elements and CSS classes.  If only someone had already invented that wheel...
