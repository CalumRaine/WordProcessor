// Content element (p, ul, ol, etc)
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

	get Ascent(){
		return Math.max(...this.words.map(w => w.Ascent));
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

	CaretAtStart(caret){
		return caret.line == this && this.words[0].CaretAtStart(caret);
	}

	AppendWords(newWords){
		let leftWord = this.words[this.LastIndex];
		let rightWord = newWords[0];
		if (leftWord.IsTrueWord == rightWord.IsTrueWord){
			// Join words[last] to new[first] if they are the same
			leftWord.AppendCharacters(rightWord.Characters);
			newWords.splice(0,1);
		}

		this.words = this.words.concat(newWords);
		return true;
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
		let word = this.words[index];
		if (!word.InsertCharacter(caret, newCharacter)){
			// Character rejected: Cannot mix whitespace with characters.
			// Split word and insert new between
			this.wordBreak(caret);
			let newWord = new Word([newCharacter]);
			this.insertWordAfter(caret, newWord, index);
			newWord.PutCaretAtEnd(caret);
		}
		
		return true;
	}

	LineBreak(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		let secondHalfOfWord = word.WordBreak(caret);
		this.words.splice(index+1, 0, secondHalfOfWord);
		let extractedWords = this.words.splice(index + 1);
		let brokenLine = new Line(extractedWords.length == 0 ? null : extractedWords);
		return brokenLine;
	}

	PutCaretAtStart(caret){
		caret.line = this;
		return this.words[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		caret.line = this;
		return this.words[this.LastIndex].PutCaretAtEnd(caret);
	}

	Backspace(caret, event){
		if (this.CaretAtStart(caret)){
			// Caret already at start.  No can do.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!event.ctrlKey && word.BackspaceCharacter(caret) || event.ctrlKey && word.BackspaceWord(caret) || this.Empty){
			return true;
		}
		else if (word.Empty){
			// Delete empty word.  There are others on this line.
			this.words.splice(index, 1);
			if (index == 0){
				// Deleted first word.  Pass caret to beginning of next word.
				return this.words[index].PutCaretAtStart(caret);
			}

			// Pass caret to end of previous word
			let previousWord = this.words[index-1];
			previousWord.PutCaretAtEnd(caret);

			if (index <= this.LastIndex){
				// Merge with adjacent word
				let nextWord = this.words[index];
				previousWord.AppendCharacters(nextWord.Characters);
				this.words.splice(index, 1);
			}

			return true;
		}
		else if (index > 0) {
			// Word is not empty but caret is at beginning
			// Pass caret to end of previous word
			let previousWord = this.words[index-1];
			return previousWord.PutCaretAtEnd(caret);
		}
		else {
			// Caret at beginning of line
			return true;
		}
	}

	getCaretIndex(caret){
		return this.words.findIndex(w => w == caret.word);
	}

	wordBreak(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		let newWord = word.WordBreak(caret);
		return newWord.Empty ? true : this.insertWordAfter(caret, newWord, index);
	}

	insertWordAfter(caret, newWord, index){
		this.words.splice(index + 1, 0, newWord);
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
		else if (index > 0){
			let previousWord = this.words[index-1];
			return previousWord.PutCaretAtEnd(caret);
		}
		else {
			return false;
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
			return nextWord.PutCaretAtStart(caret);
		}
	}
}
