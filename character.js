class Character {
	static DUMMY = "";
	character = "";
	dimensions = null;
	documentX = 0;
	documentY = 0;
	screenX = 0;
	screenY = 0;
	
	constructor(character){
		this.character = character == null ? Character.DUMMY : character;
		this.dimensions = globalCanvasContext.measureText(this.character);
	}

	get Width(){
		return this.dimensions.width;
	}

	get Ascent(){
		return this.dimensions.fontBoundingBoxAscent;
	}

	get Empty(){
		return this.character == Character.DUMMY;
	}

	get Text(){
		return this.character;
	}

	Left(caret){
		return caret.MoveLeft();
	}

	Right(caret){
		return caret.MoveRight();
	}

	HasCaret(caret){
		return caret.character == this;
	}

	InitParse(){
		this.documentX = 0;
		this.documentY = 0;
		this.screenX = 0;
		this.screenY = 0;
		return true;
	}

	Parse(x, y){
		this.documentX = x;
		this.documentY = y;
	}

	Render(x, y){
		this.screenX = x;
		this.screenY = y;
	}

	CaretAtStart(caret){
		return caret.character == this && caret.OnLeft;
	}

	Clear(){
		this.character = Character.DUMMY;
		this.dimensions = globalCanvasContext.measureText(this.character);
		return true;
	}

	ClaimCaretAtX(caret, x){
		if (x < this.documentX || x > (this.documentX + this.Width)){
			return false;
		}

		caret.character = this;
		if ((x - this.documentX) < ((this.documentX + this.Width) - x)){
			caret.MoveLeft();
		}
		else {
			caret.MoveRight();
		}

		return true;
	}

	RenderCursor(caret){
		if (caret.character != this){
			return false;
		}
		else if (caret.OnLeft){
			return this.drawCursor(this.screenX, this.screenY);
		}
		else {
			return this.drawCursor(this.screenX + this.Width, this.screenY);
		}
	}

	drawCursor(x, y){
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(x, y - this.Ascent);
		globalCanvasContext.lineTo(x, y);
		globalCanvasContext.stroke();
		return true;
	}

	Replace(newCharacter){
		this.character = newCharacter.character;
		this.dimensions = globalCanvasContext.measureText(this.character);
		return true;
	}

	GrabCaret(caret, side){
		caret.character = this;
		caret.Side = side;
		return true;
	}

	get IsWordCharacter() {
		const specialWordCharacters = ["-", "'"];
		if (specialWordCharacters.includes(this.character)){
			// Hyphens and apostrophes do not break words
			return true;
		}

		let code = this.character.charCodeAt(0);
		if (code >= 97 && code <= 122){
			// a-z
			return true;
		}
		else if (code >= 65 && code <= 90){
			// A - Z
			return true;
		}

		return false;
	}
}
