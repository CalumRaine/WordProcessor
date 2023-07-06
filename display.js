class Display {
	wrappedPages = [];
	pageGap = 20;
	
	constructor(){

	}

	Parse(contentPages){
		this.wrappedPages = [];
		for (let contentPage of contentPages){
			contentPage.InitParse();
			do {
				let wrappedLines = contentPage.ParseNext();
				let wrappedPage = new WrappedPage(contentPage, wrappedLines);
				this.wrappedPages.push(wrappedPage);
			} while (!contentPage.Parsed);
		}
	}

	Render(){
		let x = 20;
		let y = 20;
		for (let wrappedPage of this.wrappedPages){
			wrappedPage.Render(x, y);
			y += wrappedPage.Height;
			y += this.pageGap;
		}
	
		return true;
	}

	RenderCursor(caret){
		return this.wrappedPages.some(p => p.RenderCursor(caret));
	}
}

class WrappedPage {
	wrappedLines = [];
	lineGap = 5;
	bodyWidth = 500;
	bodyHeight = 700;
	vMargin = 50;
	hMargin = 70;
	topLeftX = 0;
	topLeftY = 0;
	contentPage = null

	constructor(contentPage, wrappedLines){
		this.contentPage = contentPage;
		this.wrappedLines = wrappedLines;
	}

	get Height(){
		return this.bodyHeight + this.vMargin + this.vMargin;
	}

	get Width(){
		return this.bodyWidth + this.hMargin + this.hMargin;
	}

	RenderCursor(caret){
		return caret.page == this.contentPage && this.wrappedLines.some(l => l.RenderCursor(caret));
	}

	Render(x, y){
		// draw page
		this.debugRect(x, y, this.Width, this.Height, "black");
		this.topLeftX = x;
		this.topLeftY = y;

		// draw body
		x += this.hMargin;
		y += this.vMargin;
		this.debugRect(x, y, this.bodyWidth, this.bodyHeight, "gray");

		for (let wrappedLine of this.wrappedLines){
			y += wrappedLine.Ascent;
			this.debugLine(x, y, wrappedLine.Width, "gray");
			wrappedLine.Render(x, y);
			y += this.lineGap;
			this.debugLine(x, y, wrappedLine.Width, "gray");
		}
		return true;
	}

	debugRect(x, y, width, height, color){
		globalCanvasContext.strokeStyle = color;
		globalCanvasContext.beginPath();
		globalCanvasContext.rect(x, y, width, height);
		globalCanvasContext.stroke();
		return true;
	}

	debugLine(x, y, width, color){
		globalCanvasContext.strokeStyle = color;
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(x, y);
		globalCanvasContext.lineTo(x + width, y);
		globalCanvasContext.stroke();
		return true;
	}
}

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
