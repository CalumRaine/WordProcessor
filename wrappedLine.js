// Display line
class WrappedLine {
	wrappedWords = [];
	topLeftX = 0;
	topLeftY = 0;
	contentLine = null;

	constructor(contentLine, wrappedWords){
		this.contentLine = contentLine;
		this.wrappedWords = wrappedWords;
	}

	RenderCursor(caret){
		return caret.line == this.contentLine && this.wrappedWords.some(w => w.RenderCursor(caret));
	}

	get Width(){
		return this.wrappedWords.reduce((sum, word) => sum + word.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.wrappedWords.map(w => w.Ascent));
	}

	Render(x, y){
		this.topLeftX = x;
		this.topLeftY = y;
		for (let wrappedWord of this.wrappedWords){
			wrappedWord.Render(x, y);
			x += wrappedWord.Width;
		}
		return true;
	}
}
