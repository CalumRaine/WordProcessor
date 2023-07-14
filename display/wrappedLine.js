// Display line
class WrappedLine {
	wrappedWords = [];
	documentX = 0;
	documentY = 0;
	screenX = 0;
	screenY = 0;
	contentElement = null;

	constructor(contentElement, wrappedWords, x, y){
		this.contentElement = contentElement;
		this.wrappedWords = wrappedWords;
		this.documentX = x;
		this.documentY = y;
	}

	get Width(){
		return this.wrappedWords.reduce((sum, word) => sum + word.Width, 0);
	}

	get Height(){
		return this.wrappedWords.length == 0 ? this.contentElement.fallbackStyle.Size : Math.max(...this.wrappedWords.map(w => w.Height));
	}

	get LastIndex(){
		return this.wrappedWords.length - 1;
	}

	HasCaret(caret){
		return caret.element == this.contentElement && this.wrappedWords.some(w => w.HasCaret(caret));
	}

	RenderCursor(caret){
		if (caret.element != this.contentElement){
			return false;
		}
		else if (this.wrappedWords.length == 0){
			globalCanvasContext.beginPath();
			globalCanvasContext.moveTo(caret.style.IsItalic ? this.screenX + 1 : this.screenX, this.screenY - caret.style.Size);
			globalCanvasContext.lineTo(caret.style.IsItalic ? this.screenX - 1 : this.screenX, this.screenY);
			globalCanvasContext.lineWidth = caret.style.IsBold ? 2 : 1;
			globalCanvasContext.stroke();
			return true;
		}
		else {
			return this.wrappedWords.some(w => w.RenderCursor(caret));
		}
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
		caret.element = this.contentElement;
		if (x <= this.documentX){
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
