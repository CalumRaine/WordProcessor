// Content word
class Word {
	characters = [];
	parseCursor = 0;

	constructor(characters){
		this.characters = characters == null ? [new Character()] : characters;
	}

	get Empty(){
		return this.characters[0].Empty;
	}

	InitParse(){
		this.parseCursor = 0;
		this.characters.forEach(c => c.InitParse());
		return true;
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
		return this.characters[0].IsWordCharacter;
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

	CaretAtEnd(caret){
		return caret.word == this && this.characters[this.LastIndex].CaretAtEnd(caret);
	}

	PutCaretAtStart(caret){
		caret.word = this;
		this.characters[0].GrabCaret(caret, Caret.LEFT);
		return true;
	}

	PutCaretAtFirst(caret){
		caret.word = this;
		this.characters[0].GrabCaret(caret, Caret.RIGHT);
		return true;
	}

	PutCaretAtEnd(caret){
		caret.word = this;
		return this.characters[this.LastIndex].GrabCaret(caret, Caret.RIGHT);
	}

	PutCaretAtLast(caret, side){
		caret.word = this;
		return this.characters[this.LastIndex].GrabCaret(caret, Caret.LEFT);
	}

	InsertCharacter(caret, newCharacter){
		if (this.Empty){
			let character = this.characters[0];
			character.Replace(newCharacter);
			character.GrabCaret(caret, Caret.RIGHT);
			return true;
		}
		else if (newCharacter.IsWordCharacter != this.IsTrueWord){
			// Refuse to mix non-word characters with true word characters
			return false;
		}
		else if (caret.OnLeft){
			let index = this.getCaretIndex(caret);
			this.characters.splice(index, 0, newCharacter);
			return true;
		}
		else {
			let index = this.getCaretIndex(caret);
			this.characters.splice(index + 1, 0, newCharacter);
			newCharacter.GrabCaret(caret, Caret.RIGHT);
			return true;
		}
	}

	BackspaceCharacter(caret){
		// Return false if empty after backspace
		let index = this.getCaretIndex(caret);
		if (index == 0 && caret.OnLeft){
			// Caret on left of first character.  No can do.
			// This should be impossible because parent Line supposed to precheck.
			return false;
		}
		else if (this.characters.length == 1 && caret.OnRight){
			// Don't leave yourself empty
			let character = this.characters[0];
			character.Clear();
			character.GrabCaret(caret, Caret.LEFT);
			return false;
		}
		
		let character = this.characters[index];
		if (caret.OnRight){
			this.characters.splice(index, 1);
			if (this.Empty){
				return false;
			}
			else if (index > this.LastIndex){
				let previousCharacter = this.characters[index-1];
				previousCharacter.GrabCaret(caret, Caret.RIGHT);
			}
			else {
				let nextCharacter = this.characters[index];
				nextCharacter.GrabCaret(caret, Caret.LEFT);
			}
		}
		else {
			this.characters.splice(index-1, 1);
		}

		return true;
	}

	BackspaceWord(caret){
		let index = this.getCaretIndex(caret);
		if (index == 0 && caret.OnLeft){
			// Caret on left of first character.  No can do.
			// Should be impossible because parent Line supposed to precheck.
			return false;
		}
		else if (caret.OnLeft){
			// Delete characters prior to this one
			this.characters.splice(0, index);
		}
		else if (index == this.LastIndex){
			// Delete entire word
			this.characters.splice(1);
			let firstCharacter = this.characters[0];
			firstCharacter.Clear();
			firstCharacter.GrabCaret(caret, Caret.LEFT);
		}
		else {
			// Delete characters up to and including this one
			let toDelete = index + 1;
			this.characters.splice(0, toDelete);
			this.character[0].GrabCaret(Caret.LEFT);
		}

		return true;
	}

	AppendCharacters(newCharacters){
		this.characters = this.characters.concat(newCharacters);
		return true;
	}

	Left(caret){
		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		if (character.Left(caret)){
			return true;
		}
		else if (index > 0) {
			let previousCharacter = this.characters[index-1];
			previousCharacter.GrabCaret(caret, Caret.LEFT);
			return true;
		}
		else {
			return false;
		}
	}

	Right(caret){
		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		if (character.Right(caret)){
			return true;
		}
		else if (index < this.LastIndex) {
			let nextCharacter = this.characters[index+1];
			nextCharacter.GrabCaret(caret, Caret.RIGHT);
			return true;
		}
		else {
			return false;
		}
	}

	WordBreak(caret){
		if (this.Empty){
			return new Word(null);
		}

		let index = this.getCaretIndex(caret);
		if (caret.OnRight){
			let toExtract = this.LastIndex - index;
			let extractedCharacters = this.characters.splice(index + 1, toExtract);
			return new Word(extractedCharacters.length == 0 ? null : extractedCharacters);
		}
		else {
			let toExtract = this.characters.length - index;
			let extractedCharacters = this.characters.splice(index, toExtract);
			return new Word(extractedCharacters.length == 0 ? null : extractedCharacters);
		}
	}

	ParseNext(maxWidth, maxHeight, x, y, forceBreak){
		// Get the next set of characters that can fit on a line
		if (this.Width <= maxWidth){
			// Word fits on page
			this.characters.forEach(c => { c.Parse(x, y); x += c.Width; });
			this.parseCursor = this.characters.length;
			return this.characters;
		}
		else if (this.Ascent > maxHeight){
			// This word won't fit on the page
			return null;
		}
		else if (forceBreak){
			// Word forced to split to fit on line
			return this.forceRenderNext(maxWidth, maxHeight, x, y);
		}
		else {
			// Line must break to fit this word
			return null;
		}
	}

	forceRenderNext(maxWidth, maxHeight, x, y){
		// Word can be forced to break if it is longer than line length
		let wrappedCharacters = [];
		for (let c = this.parseCursor; c < this.characters.length; ++c){
			let wrappedCharacter = this.characters[c];
			if (wrappedCharacter.Ascent > maxHeight || wrappedCharacter.Width > maxWidth){
				return wrappedCharacters.length == 0 ? null : wrappedCharacters;
			}
			wrappedCharacter.Parse(x, y);
			wrappedCharacters.push(wrappedCharacter);
			x += wrappedCharacter.Width;
			maxWidth -= wrappedCharacter.Width;
			++this.parseCursor;
		}
		return wrappedCharacters;
	}

	getCaretIndex(caret){
		return this.characters.findIndex(c => c == caret.character);
	}
}
