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
}
