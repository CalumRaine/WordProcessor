// Display word
class WrappedWord {
	wrappedCharacters = [];
	screenX = 0;
	screenY = 0;
	documentX = 0;
	documentY = 0;
	contentWord = null;

	constructor(contentWord, wrappedCharacters, x, y){
		this.contentWord = contentWord;
		this.wrappedCharacters = wrappedCharacters;
		this.documentX = x;
		this.documentY = y;
	}

	get Width(){
		return this.wrappedCharacters.reduce((sum, character) => sum + character.Width, 0);
	}

	get Height(){
		return Math.max(...this.wrappedCharacters.map(c => c.Height));
	}

	get Empty(){
		return this.wrappedCharacters[0].Empty;
	}

	get LastIndex(){
		return this.wrappedCharacters.length - 1;
	}

	HasCaret(caret){
		return caret.word == this.contentWord && this.wrappedCharacters.some(c => c.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.word == this.contentWord && this.wrappedCharacters.some(c => c.RenderCursor(caret));
	}

	Render(x, y){
		this.screenX = x;
		this.screenY = y;
		for (let wrappedCharacter of this.wrappedCharacters){
			wrappedCharacter.Render(x, y);
			globalCanvasContext.font = wrappedCharacter.style.CssFont;
			globalCanvasContext.fillStyle = wrappedCharacter.style.CssFill;
			globalCanvasContext.fillText(wrappedCharacter.character, x, y);
			x += wrappedCharacter.Width;
		}
		return true;
	}

	PutCaretAtStart(caret){
		caret.word = this.contentWord;
		// This is not gonna work
		return this.wrappedCharacters[0].GrabCaret(caret);
	}

	PutCaretAtEnd(caret){
		caret.word = this.contentWord;
		return this.wrappedCharacters[this.LastIndex].GrabCaret(caret);
	}

	ClaimCaretAtX(caret, x){
		if (this.wrappedCharacters.some(c => c.ClaimCaretAtX(caret, x))){
			caret.word = this.contentWord;
			return true;
		}
		return false;
	}

	getCaretIndex(caret){
		return this.wrappedCharacters.findIndex(c => c.HasCaret(caret));
	}

	drawCursor(){
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(this.screenX, this.screenY);
		globalCanvasContext.lineTo(this.screenX + this.Height);
		globalCanvasContext.stroke();
		return true;
	}
}
