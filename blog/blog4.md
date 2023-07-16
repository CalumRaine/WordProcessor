
# \#4



## Blank line nightmare

In [blog 3](blog3.md) I described how the caret adopts its styling from whichever character owns it.  This leaves an issue in that a blank line with no characters therefore has no height or styling, yet we all know how moving a caret to a blank line is a fundamental part of word processing.  



### Faux blank lines

I initially circumnavigated this problem by ensuring no line was ever truly blank but instead contained an invisible dummy character.  This led to many edge cases where the user would hit backspace on a blank line but, instead of having the desired result of deleting the line, would simply erase the dummy character and have no discernible effect.  After trying to catch so many edge cases that my hairline now looks like the golden arches, I decided to handle empty lines as though I know what I'm doing.



### Fallback styles

When entering or editing a line, each line will now adopt a fallback style from the caret or the first character it owns.  Even if that character is deleted (or no characters are added), the line will remember that style and pass it to the caret whenever typing resumes.
