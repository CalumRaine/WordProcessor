/*
	You have to separate document content responsibilities from document display responsibilities.
	The document caret interfaces between both.  
		-- User presses left arrow?  Means move caret left in document buffer.
		-- User presses up arrow?  Means move caret upward in document display.
	A new line in the document content forces a new line.  But the display can also wrap lines as it needs to.
 */ 

class Caret {
	contentCaret = new ContentCaret();
	displayCaret = null; // not yet implemented
	
	constructor(){
		document.addEventListener("keydown", (event) => this.handleKey(event));
	}

	handleKey(event){
		const specialKeys = ["Ctrl", "Alt", "Shift", "Meta"];
		if (event.key.includes("Arrow")){
			return this.handleArrow(event);
		}
		else if (event.key == "Enter"){
			return this.handleEnter(event);
		}
		else if (!specialKeys.includes(event.key)){
			return this.contentCaret.handleKey(event);
		}
	}

	handleArrow(event){
		if (event.key.includes("Left") || event.key.includes("Right")){
			return this.contentCaret.handleArrow(event);
		}
		else {
			return console.log(event.key, "Not yet handled");
		}
	}

	handleEnter(event){
		return this.contentCaret.handleEnter(event);
	}
}
