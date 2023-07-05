class Display {
	wrappedPages = [];
	pageGap = 20;
	
	constructor(){

	}

	parse(contentPages){
		this.wrappedPages = [];
		for (let contentPage of contentPages){
			contentPage.initParse();
			do {
				let wrappedLines = contentPage.parseNext();
				let wrappedPage = new WrappedPage(wrappedLines);
				this.wrappedPages.push(wrappedPage);
			} while (!contentPage.Parsed);
		}
	}

	render(){
		let x = 0;
		let y = 0;
		for (let wrappedPage of this.wrappedPages){
			wrappedPage.render(x, y);
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
		return this.bodyHeight + this.hMargin + this.hMargin;
	}

	get Width(){
		return this.bodyWidth + this.vMargin + this.vMargin;
	}

	render(x, y){
		// draw page
		globalCanvasContext.beginPath();
		globalCanvasContext.rect(x, y, this.Width, this.Height);
		globalCanvasContext.stroke();

		// draw body
		x += this.hMargin;
		y += this.vMargin;
		globalCanvasContext.beginPath();
		globalCanvasContext.rect(x, y, this.bodyWidth, this.bodyHeight);
		globalCanvasContext.stroke();

		for (let wrappedLine of this.wrappedLines){
			y += wrappedLine.Ascent;
			wrappedLine.render(x, y);
			y += this.lineGap;
		}
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

	render(x, y){
		for (let wrappedWord of this.wrappedWords){
			wrappedWord.render(x, y);
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

	render(x, y){
		for (let wrappedCharacter of this.wrappedCharacters){
			globalCanvasContext.fillText(wrappedCharacter.character, x, y);
			x += wrappedCharacter.Width;
		}
		return true;
	}
}
