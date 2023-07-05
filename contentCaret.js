class ContentCaret {
	content = null;
	page = null;
	line = null;
	word = null;
	character = null;

	constructor(){
		this.content = new Content();
		this.content.grabCaret(this, false);
	}

	get Pages(){
		return this.content.Pages;
	}

	get Characters(){
		return this.content.Characters;
	}

	get Text(){
		return this.content.Text;
	}

	get WordCount(){
		return this.content.WordCount;
	}

	handleKey(event){
		event.preventDefault();
		let character = new Character(event.key);
		this.line.insertCharacter(this, character);
	}

	handleArrow(event){
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	handleEnter(event){
		return event.ctrlKey ? this.content.pageBreak(this) : this.page.lineBreak(this);
	}

	handleBackspace(event){
		return this.content.backspace(this, event);
	}

	left(){
		if (this.word.left(this) || this.line.left(this) || this.page.left(this)){
			return true;
		}
		else {
			return console.log("ArrowLeft ignored.  Already at start of document.");
		}
	}

	right(){
		if (this.word.right(this) || this.line.right(this) || this.page.right(this)){
			return true;
		}
		else {
			return console.log("ArrowRight ignored.  Already at end of document.");
		}
	}
}
