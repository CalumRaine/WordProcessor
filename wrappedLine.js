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
		this.screenX = x;
		this.screenY = y;
		for (let wrappedWord of this.wrappedWords){
			wrappedWord.Render(x, y);
			x += wrappedWord.Width;
		}
		return true;
	}
}
