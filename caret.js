// Holds the page, line, word and character where the user is set to edit
class Caret {
	static START = -1;
	page = null;
	line = null;
	word = null;
	character = null;
	
	constructor(){

	}

	HandleKey(event){
		event.preventDefault();
		let character = new Character(event.key);
		this.line.InsertCharacter(this, character);
	}

	HandleEnter(){
		return this.page.LineBreak(this);
	}

	HandleArrow(event){
		event.preventDefault();
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	left(){
		return this.page.Left(this) ? true : console.log("Already at start of document");
	}

	right(){
		return this.page.Right(this) ? true : console.log("Already at end of document");
	}
}
