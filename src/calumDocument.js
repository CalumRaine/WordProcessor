// Master object.  
// Coordinates content, display and caret.  
// Should really extend the HTML canvas element directly.
class CalumDocument extends HTMLCanvasElement {
	content = new DocumentContent();
	display = new DocumentDisplay();
	caret = new Caret();

	constructor(){
		super();
		this.width = 750;
		this.height = 600;
		this.display = new DocumentDisplay(this.width, this.height);
		this.content.PutCaretAtStart(this.caret);
		globalCanvasContext = this.getContext("2d");
		globalCanvasContext.font = "20px sans-serif";
		this.onclick = (event) => this.handleClick(event);
		document.addEventListener("wheel", (event) => this.handleScroll(event));
		document.addEventListener("keydown", (event) => this.handleKey(event));
	}

	handleClick(event){
		return this.display.HandleClick(event, this.caret);
	}

	handleScroll(event){
		return this.display.HandleScroll(event, this.caret);
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
		else if (event.ctrlKey){
			this.handleCtrl(event);
		}
		else if (!specialKeys.includes(event.key)){
			this.caret.HandleKey(event);
		}
		this.render();
	}

	handleCtrl(event){
		event.preventDefault();
		switch (event.key){
			case "b":
				return this.caret.style.ToggleBold();
			case "i":
				return this.caret.style.ToggleItalic();
			case "=":
				return this.caret.style.Inc();
			case "-":
				return this.caret.style.Dec();
			case "v":
				Array.from(this.dummyText).forEach(c => this.caret.InsertCharacter(c));
				return true;
		}
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
		return event.ctrlKey ? this.content.SectionBreak(this.caret) : this.caret.HandleEnter();
	}

	render(){
		this.display.Parse(this.content.Sections);
		this.display.Render();
		this.display.RenderCursor(this.caret);
	}

	dummyText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}

customElements.define("calum-document", CalumDocument, { extends: "canvas" });
