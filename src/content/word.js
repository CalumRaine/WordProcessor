// Content word
class Word {
	characters = [];
	parseCursor = 0;

	constructor(characters){
		this.characters = (characters == null ? [] : characters);
	}

	get Empty(){
		return this.characters.length == 0;
	}

	InitParse(){
		this.parseCursor = 0;
		this.characters.forEach(c => c.InitParse());
		return true;
	}

	get IsParsed(){
		return this.parseCursor == this.characters.length;
	}

	get Characters(){
		return this.characters;
	}

	get IsTrueWord(){
		return this.characters[0].IsWordCharacter;
	}

	get Width(){
		return this.characters.reduce((sum, character) => sum + character.Width, 0);
	}

	get Height(){
		return Math.max(...this.characters.map(c => c.Height));
	}

	get LastIndex(){
		return this.characters.length - 1;
	}

	get Style(){
		return this.characters[0].Style;
	}

	IsCaretAtStart(caret){
		return caret.word == this && this.characters[0].IsCaretAtStart(caret);
	}

	IsCaretAtEnd(caret){
		return caret.word == this && this.characters[this.LastIndex].IsCaretAtEnd(caret);
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
		// Possibilities:
		// 	(1) newCharacter is whitespace but this is "true" word.  Reject
		// 	(2) Caret on right of character.  Insert ahead of it and move caret.
		// 	(3) Caret on left of character.  Insert behind it.

		if (newCharacter.IsWordCharacter != this.IsTrueWord){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		if (caret.OnRight){
			// (2)
			++index;
			newCharacter.GrabCaret(caret, Caret.RIGHT);
		}

		// (3)
		this.characters.splice(index, 0, newCharacter);

		return true;
	}

	BackspaceCharacter(caret){
		// Possibilities:
		// 	(1) Caret on left of first character.  Nothing to backspace.
		//	(2) Caret on left of character.  Delete previous.
		//	(3) Caret on right of character.  Delete itself and move caret.

		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		if (caret.OnLeft){
			// (2)
			this.characters.splice(index-1, 1);
		}
		else {
			// (3)
			this.characters.splice(index, 1);
			if (index < this.LastIndex){
				let nextCharacter = this.characters[index];
				nextCharacter.GrabCaret(caret, Caret.LEFT);
			}
			else if (!this.Empty && index > this.LastIndex){
				let previousCharacter = this.characters[index-1];
				previousCharacter.GrabCaret(caret, Caret.RIGHT);
			}
		}

		return true;
	}

	BackspaceWord(caret){
		// Possibilities:
		// 	(1) Caret on left of first character.  Nothing to backspace.
		// 	(2) Caret on left of character.  Delete preceding characters.
		// 	(3) Caret on right of last character.  Delete prior and itself.
		// 	(4) Caret on right of character.  Delete prior and itself.  Move caret.

		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		if (caret.OnLeft){
			// (2)
			this.characters.splice(0, index);
		}
		else if (this.IsCaretAtEnd(caret)){
			// (3)
			this.characters.splice(0);
		}
		else {
			// (4)
			let toDelete = index + 1;
			this.characters.splice(0, toDelete);
			this.characters[0].GrabCaret(caret, Caret.LEFT);
		}

		return true;
	}

	AppendCharacters(newCharacters){
		this.characters = this.characters.concat(newCharacters);
		return true;
	}

	LeftCharacter(caret){
		// Possibilities:
		// 	(1) Caret at start of word.  Can move no further left.
		// 	(2) Caret on right of character.  Simply swap sides.
		// 	(3) Caret on left of character. Move caret to prior character.

		if (this.IsCaretAtStart(caret)){
			return false;
		}

		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		if (!character.Left(caret)){	// (2)
			// (3)
			let previousCharacter = this.characters[index-1];
			previousCharacter.GrabCaret(caret, Caret.LEFT);
		}

		return true;
	}

	LeftWord(caret){
		return this.IsCaretAtStart(caret) ? false : this.PutCaretAtStart(caret);
	}

	RightCharacter(caret){
		// Possibilities:
		// 	(1) Caret at end of word.  Can move no further right.
		// 	(2) Caret on left of character.  Simply swap sides.
		// 	(3) Caret on right of character.  Move to next character.

		if (this.IsCaretAtEnd(caret)){
			return false;
		}

		let index = this.getCaretIndex(caret);
		let character = this.characters[index];
		if (!character.Right(caret)){ // (2)
			// (3)
			let nextCharacter = this.characters[index+1];
			nextCharacter.GrabCaret(caret, Caret.RIGHT);
		}

		return true;
	}

	RightWord(caret){
		return this.IsCaretAtEnd(caret) ? false : this.PutCaretAtEnd(caret);
	}

	WordBreak(caret){
		// Possibilities:
		// 	(1) Caret at start of word.  Return the entire word itself.
		// 	(2) Caret at end of word.  Return blank word.
		// 	(3) Caret on left of character.  Return up to but excluding the current character.
		// 	(4) Caret on right of word.  Return up to and including the current character.

		let index = this.getCaretIndex(caret);
		let extractedCharacters = [];
		if (caret.OnRight){
			// (2) and (4)
			let toExtract = this.LastIndex - index;
			extractedCharacters = this.characters.splice(index + 1, toExtract);
		}
		else {
			// (1) and (3)
			let toExtract = this.characters.length - index;
			extractedCharacters = this.characters.splice(index, toExtract);
		}

		return new Word(extractedCharacters);
	}

	ParseNext(maxWidth, maxHeight, x, y, forceBreak){
		// Possibilities:
		// 	(1) Entire word fits on page.  Return all characters as parsed.
		//	(2) Word too tall to fit on page.  Return null.
		// 	(3) Word too long to fit on one line but can be forced to break 
		//	(4) Word too long to fit on page but not forced to break

		// Get the next set of characters that can fit on a line
		if (this.Width <= maxWidth && this.Height <= maxHeight){
			// (1)
			for (let character of this.characters){
				character.Parse(x, y);
				x += character.Width;
				++this.parseCursor;
			}

			return this.characters;
		}
		else if (this.Height > maxHeight){
			// (2)
			return null;
		}
		else if (forceBreak){
			// (3)
			return this.forceRenderNext(maxWidth, maxHeight, x, y);
		}
		else {
			// (4)
			return null;
		}
	}

	forceRenderNext(maxWidth, maxHeight, x, y){
		// Word can be forced to break if it is longer than line length
		let wrappedCharacters = [];
		for (let c = this.parseCursor; c < this.characters.length; ++c){
			let wrappedCharacter = this.characters[c];
			if (wrappedCharacter.Height > maxHeight || wrappedCharacter.Width > maxWidth){
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
