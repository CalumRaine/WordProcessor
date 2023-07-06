class ContentCaret {
	content = null;
	page = null;
	line = null;
	word = null;
	character = null;

	constructor(){
		this.content = new Content();
		this.content.GrabCaret(this, false);
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

	HandleKey(event){
		event.preventDefault();
		let character = new Character(event.key);
		this.line.InsertCharacter(this, character);
	}

	HandleArrow(event){
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	HandleEnter(event){
		return event.ctrlKey ? this.content.PageBreak(this) : this.page.LineBreak(this);
	}

	HandleBackspace(event){
		return this.content.Backspace(this, event);
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
