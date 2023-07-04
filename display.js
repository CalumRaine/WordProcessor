class Display {
	wrappedPages = [];
	
	constructor(){

	}

	render(contentPages){
		this.wrappedPages = [];
		for (let contentPage of contentPages){
			contentPage.initRender():
			do {
				let wrappedLines = contentPage.renderNext();
				let wrappedPage = new WrappedPage(wrappedLines);
				this.wrappedPages.push(wrappedPage);
			} while (!contentPage.Rendered);
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
}

class WrappedWord {
	wrappedCharacters = [];

	constructor(wrappedCharacters){
		this.wrappedCharacters = wrappedCharacters;
	}

	get Width(){
		return this.wrappedCharacters.reduce((sum, character) => sum + character.Width, 0);
	}
}
