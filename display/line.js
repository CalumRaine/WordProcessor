// Display line (element content wrapped into lines)
class Line {
	wrappedWords = [];
	documentX = 0;
	documentY = 0;
	screenX = 0;
	screenY = 0;
	element = null;

	constructor(element, wrappedWords, x, y){
		this.element = element;
		this.wrappedWords = wrappedWords;
		this.documentX = x;
		this.documentY = y;
	}

	get Width(){
		return this.wrappedWords.reduce((sum, word) => sum + word.Width, 0);
	}

	get Height(){
		return this.wrappedWords.length == 0 ? this.element.fallbackStyle.Size : Math.max(...this.wrappedWords.map(w => w.Height));
	}

	get LastIndex(){
		return this.wrappedWords.length - 1;
	}

	HasCaret(caret){
		return caret.element == this.element && (caret.word == null || this.wrappedWords.some(w => w.HasCaret(caret)));
	}

	RenderCursor(caret){
		if (caret.element != this.element){
			return false;
		}
		else if (this.wrappedWords.length == 0){
			globalCanvasContext.beginPath();
			globalCanvasContext.moveTo(caret.Style.IsItalic ? this.screenX + 1 : this.screenX, this.screenY - caret.Style.Size);
			globalCanvasContext.lineTo(caret.Style.IsItalic ? this.screenX - 1 : this.screenX, this.screenY);
			globalCanvasContext.lineWidth = caret.Style.IsBold ? 2 : 1;
			globalCanvasContext.strokeStyle = caret.Style.Color;
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
		caret.element = this.element;
		if (x <= this.documentX){
			return this.wrappedWords.length == 0 ? this.element.PutCaretAtStart(caret) : this.wrappedWords[0].PutCaretAtStart(caret);
		}
		else if (this.wrappedWords.some(w => w.ClaimCaretAtX(caret, x))){
			return true;
		}
		else {
			return this.wrappedWords.length == 0 ? this.element.PutCaretAtEnd(caret) : this.wrappedWords[this.LastIndex].PutCaretAtEnd(caret);
		}
	}

	getCaretIndex(caret){
		return this.wrappedWords.findIndex(w => w.HasCaret(caret));
	}
}
