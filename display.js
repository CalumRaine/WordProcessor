class Display {
	wrappedPages = [];
	
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
}

class WrappedPage {
	wrappedLines = [];

	constructor(wrappedLines){
		this.wrappedLines = wrappedLines;
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
}
