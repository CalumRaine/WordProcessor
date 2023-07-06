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
				let wrappedPage = new WrappedPage(wrappedLines);
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
}

class WrappedPage {
	wrappedLines = [];
	lineGap = 5;
	bodyWidth = 500;
	bodyHeight = 700;
	vMargin = 50;
	hMargin = 70;

	constructor(wrappedLines){
		this.wrappedLines = wrappedLines;
	}

	get Height(){
		return this.bodyHeight + this.vMargin + this.vMargin;
	}

	get Width(){
		return this.bodyWidth + this.hMargin + this.hMargin;
	}

	Render(x, y){
		// draw page
		this.debugRect(x, y, this.Width, this.Height, "black");

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
	
	constructor(wrappedWords){
		this.wrappedWords = wrappedWords;
	}

	get Width(){
		return this.wrappedWords.reduce((sum, word) => sum + word.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.wrappedWords.map(w => w.Ascent));
	}

	Render(x, y){
		for (let wrappedWord of this.wrappedWords){
			wrappedWord.Render(x, y);
			x += wrappedWord.Width;
		}
		return true;
	}
}

class WrappedWord {
	wrappedCharacters = [];

	constructor(wrappedCharacters){
		this.wrappedCharacters = wrappedCharacters;
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
		for (let wrappedCharacter of this.wrappedCharacters){
			globalCanvasContext.fillText(wrappedCharacter.character, x, y);
			x += wrappedCharacter.Width;
		}
		return true;
	}
}
