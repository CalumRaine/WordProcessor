class CalumDocument extends HTMLCanvasElement {
	context = null;
	characters = [];
	lines = [];
	modifierKeys = ["Shift", "Control", "Alt", "Meta"];
	nodes = [];
	styles = [];
	margin = 200;
	lineGap = 5;
	caret = new CalumPen(0, this.margin, this.margin);

	constructor(){
		super();
		this.context = this.getContext("2d");
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		document.addEventListener("keydown", (event) => this.handleKey(event));
	}

	get BodyWidth(){
		return this.width - this.margin - this.margin;
	}

	render(){
		this.context.clearRect(0, 0, this.width, this.height);
		this.lines = [];
		let pen = new CalumPen(0, this.margin, this.margin);
		while (pen.position < this.characters.length){
			let line = new CalumLine(this.characters, pen, this.BodyWidth);
			this.lines.push(line);
			line.render(this.context, pen);
			pen.y += this.lineGap;
		}
	}

	handleKey(event){
		console.log(event.key);
		event.preventDefault();
		if (this.modifierKeys.includes(event.key)){
			return;
		}
		else if (event.key == "Backspace"){
			this.handleBackspace();
		}
		else if (event.key.includes("Arrow")){
			this.handleArrow(event.key);
		}
		else {
			this.handleCharacter(event.key);
		}
		this.render();
	}

	handleCharacter(ch){
		let character = new CalumCharacter(this.context, ch);
		this.characters.splice(this.caret.position, 0, character);
		++this.caret.position;
	}

	handleBackspace(){
		if (this.characters.length == 0){
			console.log("Backspace ignored because document blank");
			return;
		}
		else {
			--this.caret.position;
			this.characters.splice(this.caret.position, 1);
		}
	}

	handleArrow(key){
		if (key.includes("Left")){
			this.handleArrowLeft();
		}
		else if (key.includes("Right")){
			this.handleArrowRight();
		}
		else {
			console.log(key, "Not yet implemented");
		}
	}

	handleArrowLeft(){
		if (this.caret.position > 0){
			--this.caret.position;
		}
		else {
			console.log("Cannot shift left.  Already at start.");
		}
	}

	handleArrowRight(){
		if (this.caret.position < this.characters.length){
			++this.caret.position;
		}
		else {
			console.log("Cannot shift right.  Already at end.");
		}
	}
}

customElements.define("calum-document", CalumDocument, { extends: "canvas"});
