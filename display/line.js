// Display line (element content wrapped into lines)
class Line {
	wrappedWords = [];
	documentX = 0;
	documentY = 0;
	screenY = 0;
	onScreen = false;
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

	set OnScreen(value){
		this.onScreen = value;
		this.wrappedWords.forEach(w => w.OnScreen = value);
		return true;
	}

	ClaimCaretAtXY(caret, x, y){
		if (!this.onScreen || y > (this.screenY + this.Height)){
			return false;
		}
		return this.PutCaretAtX(caret, x);
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
			globalCanvasContext.moveTo(caret.Style.IsItalic ? this.documentX + 1 : this.documentX, this.screenY - caret.Style.Size);
			globalCanvasContext.lineTo(caret.Style.IsItalic ? this.documentX - 1 : this.documentX, this.screenY);
			globalCanvasContext.lineWidth = caret.Style.IsBold ? 2 : 1;
			globalCanvasContext.strokeStyle = caret.Style.Color;
			globalCanvasContext.stroke();
			return true;
		}
		else {
			return this.wrappedWords.some(w => w.RenderCursor(caret));
		}
	}

	Render(scrollTop, scrollBottom){
		if (this.documentY > (scrollBottom+this.Height) || (this.documentY + this.Height) < scrollTop){
			this.OnScreen = false;
			return false;
		}

		this.onScreen = true;
		this.screenY = this.documentY - scrollTop;
		this.wrappedWords.forEach(w => w.Render(scrollTop));
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
