// Holds the page, line, word and character where the user is set to edit
class Caret {
	static RIGHT = 1;
	static LEFT = 2;
	page = null;
	line = null;
	word = null;
	character = null;
	rightSide = true;
	
	constructor(){

	}

	get OnRight(){
		return this.rightSide;
	}

	get OnLeft(){
		return !this.rightSide;
	}

	get DocumentX(){
		return this.rightSide ? (this.character.documentX + this.character.Width) : this.character.documentX;
	}

	set Side(value){
		if (value == Caret.RIGHT){
			this.rightSide = true;
		}
		else if (value == Caret.LEFT){
			this.rightSide = false;
		}
	}

	MoveRight(){
		if (this.OnRight){
			return false;
		}

		this.rightSide = true;
		return true;
	}

	MoveLeft(){
		if (this.OnLeft){
			return false;
		}

		this.rightSide = false;
		return true;
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
