// Display word
class WrappedWord {
	characters = [];
	screenX = 0;
	screenY = 0;
	documentX = 0;
	documentY = 0;
	contentWord = null;

	constructor(contentWord, characters, x, y){
		this.contentWord = contentWord;
		this.characters = characters;
		this.documentX = x;
		this.documentY = y;
	}

	get Width(){
		return this.characters.reduce((sum, character) => sum + character.Width, 0);
	}

	get Height(){
		return Math.max(...this.characters.map(c => c.Height));
	}

	get LastIndex(){
		return this.characters.length - 1;
	}

	HasCaret(caret){
		return caret.word == this.contentWord && this.characters.some(c => c.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.word == this.contentWord && this.characters.some(c => c.RenderCursor(caret));
	}

	Render(x, y){
		this.screenX = x;
		this.screenY = y;
		for (let character of this.characters){
			character.Render(x, y);
			globalCanvasContext.font = character.style.CssFont;
			globalCanvasContext.fillStyle = character.style.CssFill;
			globalCanvasContext.fillText(character.character, x, y);
			x += character.Width;
		}
		return true;
	}

	PutCaretAtStart(caret){
		caret.word = this.contentWord;
		return this.characters[0].GrabCaret(caret);
	}

	PutCaretAtEnd(caret){
		caret.word = this.contentWord;
		return this.characters[this.LastIndex].GrabCaret(caret);
	}

	ClaimCaretAtX(caret, x){
		if (this.characters.some(c => c.ClaimCaretAtX(caret, x))){
			caret.word = this.contentWord;
			return true;
		}
		return false;
	}

	getCaretIndex(caret){
		return this.characters.findIndex(c => c.HasCaret(caret));
	}

	drawCursor(){
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(this.screenX, this.screenY);
		globalCanvasContext.lineTo(this.screenX + this.Height);
		globalCanvasContext.stroke();
		return true;
	}
}
