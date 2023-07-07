// Content word
class Word {
	characters = [];
	parseCursor = 0;

	constructor(characters){
		this.characters = characters == null ? [new Character()] : characters;
	}

	get Empty(){
		return this.characters.every(c => c.Empty);
	}

	InitParse(){
		this.parseCursor = 0;
	}

	get Parsed(){
		return this.parseCursor == this.characters.length;
	}

	get Characters(){
		return this.characters;
	}

	get Text(){
		return this.characters.map(c => c.Text).join("");
	}

	get IsTrueWord(){
		return this.characters.some(c => c.IsWordCharacter);
	}

	get Width(){
		return this.characters.reduce((sum, character) => sum + character.Width, 0);
	}

	get Ascent(){
		return Math.max(...this.characters.map(c => c.Ascent));
	}

	get LastIndex(){
		return this.characters.length - 1;
	}

	CaretAtStart(caret){
		return caret.word == this && this.characters[0].CaretAtStart(caret);
	}

	GrabCaret(caret, toEnd){
		caret.word = this;
		if (toEnd){
			return this.characters[this.LastIndex].GrabCaret(caret);
		}

		caret.character = null;
		return true;
	}

	InsertCharacter(caret, newCharacter){
		if (this.Empty){
			let character = this.characters[0];
			character.Replace(newCharacter);
			character.GrabCaret(caret);
			return true;
		}
		else if (newCharacter.IsWordCharacter != this.IsTrueWord){
			// Refuse to mix non-word characters with true word characters
			return false;
		}
		else {
			let index = this.getCaretIndex(caret);
			this.characters.splice(index + 1, 0, newCharacter);
			newCharacter.GrabCaret(caret);
			return true;
		}
	}

	BackspaceCharacter(caret){
		// Return false if already empty or caret now at start of word
		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		if (this.characters.length == 1){
			// Don't leave yourself empty
			character.Clear();
		}
		else {
			// Remove character
			this.characters.splice(index, 1);
		}

		if (index == 0){
			// Inform parent line that caret now precedes word
			caret.character = null;
			return false;
		}
		else {
			let previousCharacter = this.characters[index-1];
			return previousCharacter.GrabCaret(caret);
		}
	}

	BackspaceWord(caret){
		let index = this.getCaretIndex(caret);
		let toDelete = index + 1;
		this.characters.splice(0, toDelete);
		caret.character = null;
		return false;
	}

	AppendCharacters(newCharacters){
		this.characters = this.characters.concat(newCharacters);
		return true;
	}

	Left(caret){
		let index = this.getCaretIndex(caret);
		if (index == Caret.START){
			return false;
		}
		else if (index == 0){
			caret.character = null;
			return true;
		}
		else {
			return this.characters[index-1].GrabCaret(caret);
		}
	}

	Right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.characters[index+1].GrabCaret(caret);
	}

	WordBreak(caret){
		if (this.Empty){
			return new Word(null);
		}

		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedCharacters = this.characters.splice(index + 1, toExtract);
		let brokenWord = new Word(extractedCharacters.length == 0 ? null : extractedCharacters);
		return brokenWord;
	}

	ParseNext(maxWidth, maxHeight, forceBreak){
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

	getCaretIndex(caret){
		return this.characters.findIndex(c => c == caret.character);
	}
}
