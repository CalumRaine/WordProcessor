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

	handleKey(event){
		let character = new Character(event.key);
		this.line.insert(this, character);
		document.querySelector("p").innerHTML = this.content.Text;
		document.querySelector("input").value = this.content.WordCount;
	}

	handleArrow(event){
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	handleEnter(event){
		return event.isCtrl ? this.content.pageBreak(this) : this.page.lineBreak(this);
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
