class Word {
	characters = [];

	constructor(characters){
		this.characters = characters == null ? [new Character("C")] : characters;
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
		let brokenWord = new Word();
		brokenWord.adopt(extractedCharacters);
		return brokenWord;
	}
}
