// Display line
class WrappedLine {
	wrappedWords = [];
	documentX = 0;
	documentY = 0;
	screenX = 0;
	screenY = 0;
	contentLine = null;

	constructor(contentLine, wrappedWords, x, y){
		this.contentLine = contentLine;
		this.wrappedWords = wrappedWords;
		this.documentX = x;
		this.documentY = y;
	}

	get Width(){
		return this.wrappedWords.reduce((sum, word) => sum + word.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.wrappedWords.map(w => w.Ascent));
	}

	get LastIndex(){
		return this.wrappedWords.length - 1;
	}

	HasCaret(caret){
		return caret.line == this.contentLine && this.wrappedWords.some(w => w.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.line == this.contentLine && this.wrappedWords.some(w => w.RenderCursor(caret));
	}

	Render(x, y){
		this.screenX = x;
		this.screenY = y;
		for (let wrappedWord of this.wrappedWords){
			wrappedWord.Render(x, y);
			x += wrappedWord.Width;
		}
		return true;
	}

	PutCaretAtX(caret, x){
		caret.line = this.contentLine;
		if (x == null || x <= this.documentX){
			return this.wrappedWords[0].PutCaretAtStart(caret);
		}
		else if (this.wrappedWords.some(w => w.ClaimCaretAtX(caret, x))){
			return true;
		}
		else {
			return this.wrappedWords[this.LastIndex].PutCaretAtEnd(caret);
		}
	}

	getCaretIndex(caret){
		return this.wrappedWords.findIndex(w => w.HasCaret(caret));
	}
}
