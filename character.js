class Character {
	character = "";
	dimensions = null;
	caret = null;
	
	constructor(character){
		this.character = character;
		this.dimensions = globalCanvasContext.measureText(character);
	}

	get Width(){
		return this.dimensions.width;
	}

	get Ascent(){
		this.dimensions.actualBoundingBoxAscent;
	}

	grabCaret(caret){
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
