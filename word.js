class Word {
	characters = [];
	parseCursor = 0;

	constructor(characters){
		this.characters = characters == null ? [] : characters;
	}

	initParse(){
		this.parseCursor = 0;
	}

	get Parsed(){
		return this.parseCursor == this.characters.length;
	}

	parseNext(maxWidth, maxHeight, forceBreak){
		// Get the next set of characters that can fit on a line
		if (this.Width <= maxWidth){
			// Word fits on page
			this.parseCursor = this.characters.length;
			return this.characters;
		}
		else if (this.Ascent > maxHeight){
			// This word won't fit on the page
			return null;
		}
		else if (forceBreak){
			// Word forced to split to fit on line
			return this.forceRenderNext(maxWidth, maxHeight);
		}
		else {
			// Line must break to fit this word
			return null;
		}
	}

	forceRenderNext(maxWidth, maxHeight){
		// Word can be forced to break if it is longer than line length
		let wrappedCharacters = [];
		for (let c = this.parseCursor; c < this.characters.length; ++c){
			let wrappedCharacter = this.characters[c];
			if (wrappedCharacter.Ascent > maxHeight || wrappedCharacter.Width > maxWidth){
				return wrappedCharacters.length == 0 ? null : wrappedCharacters;
			}
			wrappedCharacters.push(wrappedCharacter);
			maxWidth -= wrappedCharacter.Width;
			++this.parseCursor;
		}
		return wrappedCharacters;
	}

	get Empty(){
		return this.characters.length == 0;
	}

	get Text(){
		return this.characters.map(c => c.character).join("");
	}

	get IsTrueWord(){
		return this.characters.some(c => c.IsWordCharacter);
	}

	get Width(){
		return this.characters.reduce((sum, value) => sum + value.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.characters.map(c => c.Ascent));
	}

	get LastIndex(){
		return this.characters.length - 1;
	}

	insert(caret, newCharacter){
		if (this.Empty){
			this.characters.push(newCharacter);
			newCharacter.grabCaret(caret);
			return true;
		}
		else if (newCharacter.IsWordCharacter != this.IsTrueWord){
			// Refuse to mix non-word characters with true word characters
			return false;
		}
		else {
			let index = this.getCaretIndex(caret);
			this.characters.splice(index + 1, 0, newCharacter);
			newCharacter.grabCaret(caret);
			return true;
		}
	}

	prepend(caret, newCharacter){
		this.characters.splice(0, 0, newCharacter);
		this.grabCaret(caret, false);
		return true;
	}

	append(caret, newCharacter){
		this.characters.splice(this.LastIndex, 0, newCharacter);
		this.grabCaret(caret, true);
		return true;
	}

	appendCharacters(caret, newCharacters){
		this.characters = this.characters.concat(newCharacters);
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

	backspaceCharacter(caret){
		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		this.characters.splice(index, 1);
		return index == 0 ? false : this.characters[index-1].grabCaret(caret);
	}

	backspaceWord(caret){
		let index = this.getCaretIndex(caret);
		let toDelete = index + 1;
		this.characters.splice(0, toDelete);
		return this.Empty ? false : this.grabCaret(caret, false);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index <= 0 ? false : this.characters[index-1].grabCaret(caret);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.characters[index+1].grabCaret(caret);
	}

	grabCaret(caret, toEnd){
		caret.word = this;
		return this.Empty ? true : this.characters[toEnd ? this.LastIndex : 0].grabCaret(caret);
	}

	split(caret){
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedCharacters = this.characters.splice(index + 1, toExtract);
		let brokenWord = new Word(extractedCharacters);
		return brokenWord;
	}
}
