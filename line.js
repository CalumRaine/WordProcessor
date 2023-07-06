class Line {
	words = [];
	parseCursor = 0;

	constructor(words){
		this.words = words == null ? [new Word()] : words;
	}

	InitParse(){
		this.parseCursor = 0;
		this.words.forEach(w => w.InitParse());
	}

	get Parsed(){
		return this.parseCursor == this.words.length;
	}

	get Words(){
		return this.words;
	}

	appendWords(newWords){
		this.words.concat(newWords);
		return true;
	}

	get Characters(){
		return this.words.flatMap(w => w.Characters);
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

	get Empty(){
		return this.words.every(w => w.Empty);
	}

	ParseNext(maxWidth, maxHeight){
		// Get the next set of wrapped words that can fit on a line
		let wrappedWords = [];
		for (let w = this.parseCursor; w < this.words.length; ++w){
			let wordToParse = this.words[w];
			do {
				let wrappedCharacters = wordToParse.ParseNext(maxWidth, maxHeight, wrappedWords.length == 0);
				if (wrappedCharacters == null){
					// Line must wrap.  No more characters can fit on line.
					return wrappedWords.length == 0 ? null : wrappedWords;
				}
				else if (this.parseCursor == 0 || wrappedWords.length > 0 || wordToParse.IsTrueWord) {	// Don't start a wrapped line with whitespace
					let wrappedWord = new WrappedWord(wordToParse, wrappedCharacters);
					maxWidth -= wrappedWord.Width;
					wrappedWords.push(wrappedWord);
				}
			} while (!wordToParse.Parsed);

			// Word successfully parsed.  Safe to advance
			++this.parseCursor;
		}

		return wrappedWords;
	}

	InsertCharacter(caret, newCharacter){
		let index = this.getCaretIndex(caret);
		if (index == Caret.START){
			// Caret at beginning of line
			let word = this.words[0];
			word.GrabCaret(caret, false);
			
			// Try to prepend character to first word
			if (!word.InsertCharacter(caret, newCharacter)){
				// Failed: Insert character as new first word
				word = new Word([newCharacter]);
				this.splice(0, 0, word);
				word.GrabCaret(caret, true);
			}

			return true;
		}

		let word = this.words[index];
		if (!word.InsertCharacter(caret, newCharacter)){
			// Character rejected: Cannot mix whitespace with characters.
			// Split word and insert new between
			this.wordBreak(caret);
			let newWord = new Word([newCharacter]);
			this.insertWordAfter(caret, newWord, index);
			newWord.GrabCaret(caret, true);
		}
		
		return true;
	}

	Split(caret){
		let index = this.getCaretIndex(caret);
		this.wordBreak(caret);
		let toExtract = this.LastIndex - index;
		let extractedWords = this.words.splice(index + 1, toExtract);
		let brokenLine = new Line(extractedWords.length == 0 ? null : extractedWords);
		return brokenLine;
	}

	GrabCaret(caret, toEnd){
		caret.line = this;
		return this.words[toEnd ? this.LastIndex : 0].GrabCaret(caret, toEnd);
	}

	Backspace(caret, event){
		if (this.Empty){
			// Line empty.  Nothing to backspace.
			// Report to parent so can be removed.
			return false;
		}

		let index = this.getCaretIndex(caret);
		if (index == Caret.START){
			// Caret at start of line.  Nothing to backspace.
			// Report to parent so can be concatenated with previous
			return false;
		}

		let word = this.words[index];
		if (!event.ctrlKey && word.BackspaceCharacter(caret) || event.ctrlKey && word.BackspaceWord(caret) || this.Empty){
			return true;
		}
		else if (word.Empty){
			// Word is empty but there are others on this line
			// Delete word 
			// Give caret to end of previous word, if exists
			// Else give caret to start of next word
			this.words.splice(index, 1);
			if (index == 0){
				// Deleted first word.  Pass caret to beginning of next word.
				return this.words[index].GrabCaret(caret, false);
			}
			else if (index > this.LastIndex){
				// Deleted last word.  Pass caret to end of previous word.
				return this.words[index-1].GrabCaret(caret, true);
			}
			
			// Deleted word in middle
			// Join two words together
			let previousWord = this.words[index-1];
			previousWord.GrabCaret(caret, true);

			let nextWord = this.words[index];
			previousWord.AppendCharacters(nextWord.Characters);
			this.words.splice(index, 1);
			return true;
		}
		else if (index > 0) {
			// Word is not empty but caret is at beginning
			// Pass caret to end of previous word
			let previousWord = this.words[index-1];
			return previousWord.GrabCaret(caret, true);
		}
		
		// Caret now precedes line
		caret.word = null;
		return true;
	}

	getCaretIndex(caret){
		return this.words.findIndex(w => w == caret.word);
	}

	wordBreak(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		let newWord = word.Split(caret);
		return newWord.Empty ? true : this.insertWordAfter(caret, newWord, index);
	}

	insertWordAfter(caret, newWord, index){
		this.words.splice(index + 1, 0, newWord);
		//newWord.GrabCaret(caret, true);
		return true;
	}

	Left(caret){
		let index = this.getCaretIndex(caret);
		if (index == Caret.START){
			return false;
		}

		let word = this.words[index];
		if (word.Left(caret)){
			return true;
		}
		else if (index == 0){
			caret.word = null;
			return true;
		}
		else {
			let previousWord = this.words[index-1];
			return previousWord.GrabCaret(caret, true);
		}
	}

	Right(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.Right(caret)){
			return true;
		}
		else if (index == this.LastIndex){
			return false;
		}
		else {
			let nextWord = this.words[index+1];
			return nextWord.GrabCaret(caret, false);
		}
	}
}
