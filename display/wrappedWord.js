// Display word
class WrappedWord {
	characters = [];
	documentX = 0;
	documentY = 0;
	screenY = 0;
	onScreen = false;
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

	set OnScreen(value){
		this.onScreen = value;
		this.characters.forEach(c => c.OnScreen = value);
		return true;
	}

	HasCaret(caret){
		return caret.word == this.contentWord && this.characters.some(c => c.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.word == this.contentWord && this.characters.some(c => c.RenderCursor(caret));
	}

	Render(scrollTop){
		this.onScreen = true;
		this.screenY = this.documentY - scrollTop;
		let screenX = this.documentX;
		for (let character of this.characters){
			character.Render(scrollTop);
			globalCanvasContext.font = character.style.CssFont;
			globalCanvasContext.fillStyle = character.style.CssFill;
			globalCanvasContext.fillText(character.character, screenX, this.screenY);
			screenX += character.Width;
		}
		return true;
	}

	PutCaretAtStart(caret){
		caret.word = this.contentWord;
		return this.characters[0].GrabCaret(caret, Caret.LEFT);
	}

	PutCaretAtEnd(caret){
		caret.word = this.contentWord;
		return this.characters[this.LastIndex].GrabCaret(caret, Caret.RIGHT);
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
}
