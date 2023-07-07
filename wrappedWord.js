// Display word
class WrappedWord {
	wrappedCharacters = [];
	topLeftX = 0;
	topLeftY = 0;
	contentWord = null;

	constructor(contentWord, wrappedCharacters){
		this.contentWord = contentWord;
		this.wrappedCharacters = wrappedCharacters;
	}

	RenderCursor(caret){
		if (caret.word != null && caret.word != this.contentWord){
			return false;
		}
		return this.wrappedCharacters.some(c => c.RenderCursor(caret));
	}

	drawCursor(){
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(this.topLeftX, this.topLeftY);
		globalCanvasContext.lineTo(this.topLeftX + this.Ascent);
		globalCanvasContext.stroke();
		return true;
	}

	get Width(){
		return this.wrappedCharacters.reduce((sum, character) => sum + character.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.wrappedCharacters.map(c => c.Ascent));
	}

	get Empty(){
		return this.wrappedCharacters[0].Empty;
	}

	Render(x, y){
		this.topLeftX = x;
		this.topLeftY = y;
		for (let wrappedCharacter of this.wrappedCharacters){
			wrappedCharacter.topLeftX = x;
			wrappedCharacter.topLeftY = y;
			globalCanvasContext.fillText(wrappedCharacter.character, x, y);
			x += wrappedCharacter.Width;
		}
		return true;
	}
}
