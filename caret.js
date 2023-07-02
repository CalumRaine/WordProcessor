class Caret {
	contentCaret = new ContentCaret();
	
	constructor(){
		document.addEventListener("keydown", (event) => this.handleKey(event));
	}

	handleKey(event){
		const specialKeys = ["Ctrl", "Alt", "Shift"];
		if (event.key.includes("Arrow")){
			return this.handleArrow(event);
		}
		else if (event.key == "Enter"){
			return this.handleEnter(event);
		}
		else if (!specialKeys.includes(event.key)){
			return this.contentCaret.handleKey(event);
		}
	}

	handleArrow(event){
		if (event.key.includes("Left") || event.key.includes("Right")){
			return this.contentCaret.handleArrow(event);
		}
		else {
			return console.log(event.key, "Not yet handled");
		}
	}

	handleEnter(event){
		return this.contentCaret.handleEnter(event);
	}
}

class CalumDocumentContentCaret {
	documentContent = null;
	page = null;
	line = null;
	word = null;
	character = null;

	constructor(){
		this.documentContent = new CalumDocumentContent();
		this.documentContent.grabCaret(this, false);
	}

	handleKey(event){
		console.log("doc content caret", event.key);
		let character = new CalumDocumentContentCharacter(event.key);
		this.line.insert(this, character);
		document.querySelector("p").innerHTML = this.documentContent.Text;
		document.querySelector("input").value = this.documentContent.WordCount;
	}

	handleArrow(event){
		return event.key == "ArrowLeft" ? this.left() : this.right();
	}

	handleEnter(event){
		return event.isCtrl ? this.documentContent.pageBreak(this) : this.page.lineBreak(this);
	}

	left(){
		if (this.word.left(this) || this.line.left(this) || this.page.left(this)){
			return true;
		}
		else {
			return console.log("ArrowLeft ignored.  Already at start of document.");
		}
	}

	right(){
		if (this.word.right(this) || this.line.right(this) || this.page.right(this)){
			return true;
		}
		else {
			return console.log("ArrowRight ignored.  Already at end of document.");
		}
	}
}

class CalumDocumentContent {
	pages = [];
	
	constructor(pages){
		this.pages = pages == null ? [new CalumDocumentContentPage()] : pages;
	}

	adopt(pages){
		this.pages = pages;
		return true;
	}

	get Text(){
		return this.pages.map(p => p.Text).join("");
	}

	get WordCount(){
		return this.pages.reduce((sum, page) => sum + page.WordCount, 0);
	}

	get LastIndex(){
		return this.pages.length - 1;
	}

	grabCaret(caret, toEnd){
		caret.documentContent = this;
		return this.pages[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	getCaretIndex(caret){
		return this.pages.findIndex(p => caret.page == p);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.pages[index-1].grabCaret(caret, true);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.pages[index+1].grabCaret(caret, false);
	}

	pageBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenPage = this.pages[index].pageBreak(caret);
		this.pages.splice(index, 0, brokenPage);
		brokenPage.grabCaret(caret);
		return true;
	}
}

class CalumDocumentContentPage {
	lines = [];

	constructor(lines){
		this.lines = lines == null ? [new CalumDocumentContentLine()] : lines;
	}

	adopt(lines){
		this.lines = lines;
		return line;
	}

	get Text(){
		return this.lines.map(l => l.Text).join("");
	}

	get WordCount(){
		return this.lines.reduce((sum, line) => sum + line.WordCount, 0);
	}

	get LastIndex(){
		return this.lines.length - 1;
	}

	grabCaret(caret, toEnd){
		caret.page = this;
		return this.lines[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	getCaretIndex(caret){
		return this.lines.findIndex(l => l == caret.line);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.lines[index - 1].grabCaret(caret, true);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.lines[index + 1].grabCaret(caret, false);
	}

	split(caret){
		this.lineBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new CalumDocumentContentPage();
		newPage.adopt(extractedLines);
		return newPage;
	}

	lineBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenLine = this.lines[index].split(caret);
		this.lines.splice(index, 0, brokenLine);
		brokenLine.grabCaret(caret, false);
		return true;
	}
}

class CalumDocumentContentLine {
	words = [];

	constructor(words){
		this.words = words == null ? [new CalumDocumentContentWord()] : words;
	}

	adopt(words){
		this.words = words;
	}

	get Text(){
		return this.words.map(w => w.Text).join("");
	}

	get WordCount(){
		return this.words.filter(w => w.IsTrueWord).length;
	}

	get LastIndex(){
		return this.words.length - 1;
	}

	insert(caret, newCharacter){
		console.log("line.insert", newCharacter.character);
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.insert(caret, newCharacter)){
			console.log("insert successful");
			return true;
		}
		else if (word.caretAtEnd(caret)){
			// prepend to start of next word
			console.log("prepend to start of next word");
			if (index == this.LastIndex){
				console.log("no next word");
				let newWord = new CalumDocumentContentWord([newCharacter]);
				this.words.push(newWord);
				newWord.grabCaret(caret, true);
				console.log(caret);
				return true;
			}
			else {
				return this.words[index+1].insert(caret, newCharacter);
			}
		}
		else if (word.caretAtStart(caret)){
			// append to end of previous word
			console.log("append to end of previous word");
			if (index == 0){
				let newWord = new CalumDocumentContentWord([newCharacter]);
				this.words.splice(0, 0, newWord);
				newWord.grabCaret(caret, true);
				return true;
			}
			else {
				return this.words[index-1].insert(caret, newCharacter);
			}
		}
		else {
			// Split word and insert character between
			console.log("split word");
			this.wordBreak(caret);
			this.words.splice(1, 0, newWord);
			newWord.grabCaret(caret, true);
			return true;
		}
	}

	getCaretIndex(caret){
		return this.words.findIndex(w => w == caret.word);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.words[index-1].grabCaret(caret, true);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.words[index+1].grabCaret(caret, false);
	}

	grabCaret(caret, toEnd){
		caret.line = this;
		return this.words[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	split(caret){
		this.wordBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedWords = this.words.splice(index, toExtract);
		let brokenLine = new CalumDocumentContentLine();
		brokenLine.adopt(extractedWords);
		return brokenLine;
	}

	wordBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenWord = this.words[index].split(caret);
		this.words.splice(index, 0, brokenWord);
		brokenWord.grabCaret(caret);
		return true;
	}
}

class CalumDocumentContentWord {
	characters = [];

	constructor(characters){
		this.characters = characters == null ? [new CalumDocumentContentCharacter("C")] : characters;
	}

	adopt(characters){
		this.characters = characters;
	}

	get Text(){
		return this.characters.map(c => c.character).join("");
	}

	get IsTrueWord(){
		return this.characters.some(c => c.IsWordCharacter);
	}

	get Width(){
		return this.characters.reduce((sum, value) => sum + value, 0);
	}

	get Ascent(){
		return Math.max(...this.characters.map(c => c.Ascent));
	}

	get LastIndex(){
		return this.characters.length - 1;
	}

	insert(caret, newCharacter){
		console.log("word.insert", newCharacter.IsWordCharacter, this.IsTrueWord);
		if (newCharacter.IsWordCharacter != this.IsTrueWord){
			// Refuse to mix non-word characters with true word characters
			return false;
		}

		let index = this.getCaretIndex(caret);
		++index;
		this.characters.splice(index, 0, newCharacter);
		newCharacter.grabCaret(caret);
		return true;
	}

	getCaretIndex(caret){
		return this.characters.findIndex(c => c == caret.character);
	}

	caretAtStart(caret){
		return this.getCaretIndex(caret) == 0;
	}

	caretAtEnd(caret){
		return this.getCaretIndex(caret) == this.LastIndex;
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.characters[index-1].grabCaret(caret);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.characters[index+1].grabCaret(caret);
	}

	grabCaret(caret, toEnd){
		caret.word = this;
		return this.characters[toEnd ? this.LastIndex : 0].grabCaret(caret);
	}

	split(caret){
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedCharacters = this.characters.splice(index, toExtract);
		let brokenWord = new CalumDocumentContentWord();
		brokenWord.adopt(extractedCharacters);
		return brokenWord;
	}
}

class CalumDocumentContentCharacter {
	character = "";
	dimensions = null;
	caret = null;
	
	constructor(character){
		this.character = character;
		this.dimensions = globalCanvasContext.measureText(character);
	}

	get Width(){
		return this.dimensions.width;
	}

	get Ascent(){
		this.dimensions.actualBoundingBoxAscent;
	}

	grabCaret(caret){
		caret.character = this;
		return true;
	}

	get IsWordCharacter() {
		const specialWordCharacters = ["-", "'"];
		if (specialWordCharacters.includes(this.character)){
			// Hyphens and apostrophes do not break words
			return true;
		}

		let code = this.character.charCodeAt(0);
		if (code >= 97 && code <= 122){
			// a-z
			return true;
		}
		else if (code >= 65 && code <= 90){
			// A - Z
			return true;
		}

		return false;
	}
}
