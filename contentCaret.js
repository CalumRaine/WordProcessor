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
		event.preventDefault();
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	HandleEnter(event){
		return event.ctrlKey ? this.content.PageBreak(this) : this.page.LineBreak(this);
	}

	HandleBackspace(event){
		return this.content.Backspace(this, event);
	}

	left(){
		return this.page.Left(this) ? true : console.log("Already at start of document");
	}

	right(){
		return this.page.Right(this) ? true : console.log("Already at end of document");
	}
}
