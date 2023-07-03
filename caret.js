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

	render(){
		// Just for debugging
		globalCanvasContext.clearRect(0, 0, 1000, 1000);
		let x = 20;
		let y = 20;
		let characters = this.contentCaret.Characters;
		for (let character of characters){
			globalCanvasContext.font = character == this.contentCaret.character ? "bold 20px sans-serif" : "20px sans-serif";
			globalCanvasContext.fillText(character.character, x, y);
			x += character.Width;
		}
		document.querySelector("input").value = this.contentCaret.WordCount;
	}

	handleKey(event){
		const specialKeys = ["Ctrl", "Alt", "Shift", "Meta"];
		if (event.key.includes("Arrow")){
			this.handleArrow(event);
		}
		else if (event.key == "Enter"){
			this.handleEnter(event);
		}
		else if (event.key == "Backspace"){
			this.handleBackspace(event);
		}
		else if (!specialKeys.includes(event.key)){
			this.contentCaret.handleKey(event);
		}
		this.render();
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

	handleBackspace(event){
		
	}
}
