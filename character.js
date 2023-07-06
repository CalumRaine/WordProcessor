class Character {
	static DUMMY = "";
	character = "";
	dimensions = null;
	caret = null;
	
	constructor(character){
		this.character = character == null ? Character.DUMMY : character;
		this.dimensions = globalCanvasContext.measureText(this.character);
	}

	get Width(){
		return this.dimensions.width;
	}

	get Ascent(){
		return this.dimensions.actualBoundingBoxAscent;
	}

	get Empty(){
		return this.character == Character.DUMMY;
	}

	get Text(){
		return this.character;
	}

	RenderCursor(caret){
		if (caret.character == null){
			return this.drawCursor(this.topLeftX, this.topLeftY);
		}
		else if (caret.character == this){
			return this.drawCursor(this.topLeftX + this.Width, this.topLeftY);
		}
		else {
			return false;
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

	GrabCaret(caret){
		caret.character = this;
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
