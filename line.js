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
		return true;
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
		return this.words.length == 1 && this.words[0].Empty;
	}

	CaretAtStart(caret){
		return caret.line == this && (this.Empty || this.words[0].CaretAtStart(caret));
	}

	CaretAtEnd(caret){
		return caret.line == this && (this.Empty || this.words[this.LastIndex].CaretAtEnd(caret));
	}

	AppendWords(newWords){
		if (this.Empty){
			this.words.pop();
			this.words = this.words.concat(newWords);
			return true;
		}

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

	ParseNext(maxWidth, maxHeight, x, y){ // not checked
		// Get the next set of wrapped words that can fit on a line
		let wrappedWords = [];
		for (let w = this.parseCursor; w < this.words.length; ++w){
			let wordToParse = this.words[w];
			do {
				let wrappedCharacters = wordToParse.ParseNext(maxWidth, maxHeight, x, y, wrappedWords.length == 0);
				if (wrappedCharacters == null){
					// Line must wrap.  No more characters can fit on line.
					return wrappedWords.length == 0 ? null : wrappedWords;
				}
				else if (this.parseCursor == 0 || wrappedWords.length > 0 || wordToParse.IsTrueWord) {	// Don't start a wrapped line with whitespace
					let wrappedWord = new WrappedWord(wordToParse, wrappedCharacters, x, y);
					x += wrappedWord.Width;
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
		if (word.InsertCharacter(caret, newCharacter)){
			return true;
		}
		else if (word.CaretAtStart(caret)){
			if (index == 0){
				let newWord = new Word([newCharacter]);
				this.words.splice(index, 0, newWord);
				newWord.PutCaretAtEnd(caret);
			}
			else {
				let previousWord = this.words[index-1];
				previousWord.PutCaretAtEnd(caret);
				previousWord.InsertCharacter(caret, newCharacter);
			}
		}
		else if (word.CaretAtEnd(caret)){
			if (index == this.LastIndex){
				let newWord = new Word([newCharacter]);
				this.words.splice(index + 1, 0, newWord);
				newWord.PutCaretAtEnd(caret);
			}
			else {
				let nextWord = this.words[index+1];
				nextWord.PutCaretAtStart(caret);
				nextWord.InsertCharacter(caret, newCharacter);
			}
		}
		else {
			let brokenWord = word.WordBreak(caret);
			this.words.splice(index + 1, 0, brokenWord);
			let newWord = new Word([newCharacter]);
			this.words.splice(index + 1, 0, newWord);
			newWord.PutCaretAtEnd(caret);
		}
		
		return true;
	}

	LineBreak(caret){
		if (this.CaretAtStart(caret)){
			let extractedWords = this.words.splice(0);
			this.words.push(new Word(null));
			return new Line(extractedWords);
		}
		else if (this.CaretAtEnd(caret)){
			return new Line(null);
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.CaretAtStart(caret)){
			let extractedWords = this.words.splice(index);
			return new Line(extractedWords);
		}
		else if (word.CaretAtEnd(caret)){
			let extractedWords = this.words.splice(index+1);
			return new Line(extractedWords);
		}
		else {
			let brokenWord = word.WordBreak(caret);
			this.words.splice(index + 1, 0, brokenWord);
			let extractedWords = this.words.splice(index + 1);
			return new Line(extractedWords);
		}
	}

	PutCaretAtStart(caret){
		caret.line = this;
		return this.words[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		caret.line = this;
		return this.words[this.LastIndex].PutCaretAtEnd(caret);
	}

	HandleBackspace(event, caret){
		if (this.CaretAtStart(caret)){
			// Caret already at start.  No can do.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.CaretAtStart(caret)){
			// Caret at start of word so backspace from end of previous word instead.
			--index;
			word = this.words[index];
			word.PutCaretAtEnd(caret);
		}

		if (event.ctrlKey && word.BackspaceWord(caret)){
			// Try backspace word
			return true;
		}
		else if (!event.ctrlKey && word.BackspaceCharacter(caret)){
			// Perhaps we were supposed to backspace character instead
			return true;
		}
		else if (this.Empty){
			// Backspace was successful.  But line is empty.  Leave as is.
			return true;
		}

		// Backspace left an empty word.  Delete it.  We have others.
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

	Left(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.Left(caret)){
			return true;
		}
		else if (index > 0){
			let previousWord = this.words[index-1];
			previousWord.PutCaretAtLast(caret);
			return true;
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
		else if (index < this.LastIndex) {
			let nextWord = this.words[index+1];
			nextWord.PutCaretAtFirst(caret);
			return true;
		}
		else {
			return false;
		}
	}

	getCaretIndex(caret){
		return this.words.findIndex(w => w == caret.word);
	}
}
