class Caret {
	static START = -1;
	contentCaret = new ContentCaret();
	displayCaret = null; // not yet implemented
	
	constructor(){
		document.addEventListener("keydown", (event) => this.handleKey(event));
	}

	render(){
		globalCanvasContext.clearRect(0, 0, 1000, 1000);
		display.Parse(this.contentCaret.Pages);
		display.Render();
	}

	handleKey(event){
		const specialKeys = ["Control", "Alt", "Shift", "Meta"];
		if (event.key.includes("Arrow")){
			this.handleArrow(event);
		}
		else if (event.key == "Enter"){
			this.handleEnter(event);
		}
		else if (event.key == "Backspace"){
			this.contentCaret.HandleBackspace(event);
		}
		else if (!specialKeys.includes(event.key)){
			this.contentCaret.HandleKey(event);
		}
		this.render();
	}

	handleArrow(event){
		if (event.key.includes("Left") || event.key.includes("Right")){
			return this.contentCaret.HandleArrow(event);
		}
		else {
			return console.log(event.key, "Not yet handled");
		}
	}

	handleEnter(event){
		return this.contentCaret.HandleEnter(event);
	}
}
