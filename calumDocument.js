// Master object.  
// Coordinates content, display and caret.  
// Should really extend the HTML canvas element directly.
class CalumDocument {
	content = new DocumentContent();
	display = new DocumentDisplay();
	caret = new Caret();

	constructor(){
		this.content.PutCaretAtStart(this.caret);
		document.addEventListener("keydown", (event) => this.handleKey(event));
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
			this.content.HandleBackspace(event, this.caret);
		}
		else if (!specialKeys.includes(event.key)){
			this.caret.HandleKey(event);
		}
		this.render();
	}

	handleArrow(event){
		event.preventDefault();
		if (event.key.includes("Left") || event.key.includes("Right")){
			return this.content.HandleArrow(event, this.caret);
		}
		else {
			return this.display.HandleArrow(event, this.caret);
		}
	}

	handleEnter(event){
		return event.ctrlKey ? this.content.PageBreak(this.caret) : this.caret.HandleEnter();
	}

	render(){
		globalCanvasContext.clearRect(0, 0, 1000, 1000);
		this.display.Parse(this.content.Pages);
		this.display.Render();
		this.display.RenderCursor(this.caret);
	}
}
