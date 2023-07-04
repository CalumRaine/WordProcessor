class Line {
	words = [];
	renderCursor = 0;

	constructor(words){
		this.words = words == null ? [new Word()] : words;
	}

	initRender(){
		this.renderCursor = 0;
		this.words.forEach(w => w.initRender());
	}

	get Rendered(){
		this.renderCursor == this.words.length;
	}

	renderNext(maxWidth, maxHeight){
		// Get the next set of wrapped words that can fit on a line
		let wrappedWords = [];
		for (let w = this.renderCursor; w < this.words.length; ++w){
			let wordToRender = this.words[w];
			do {
				let wrappedCharacters = wordToRender.renderNext(maxWidth, maxHeight, wrappedWords.length == 0);
				if (wrappedCharacters == null){
					// Line must wrap.  No more characters can fit on line.
					return wrappedWords.length == 0 ? null : wrappedWords;
				}
				else {
					let wrappedWord = new WrappedWord(wrappedCharacters);
					maxWidth -= wrappedWord.Width;
					wrappedWords.push(wrappedWord);
				}
			} while (!wordToRender.Rendered);

			// Word successfully rendered.  Safe to advance
			++this.renderCursor;
		}

		return wrappedWords;
	}

	get Characters(){
		return this.words.flatMap(w => w.characters);
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
		return this.words.length == 0;
	}

	insertCharacter(caret, newCharacter){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!word.insert(caret, newCharacter)){
			// Character rejected: Cannot mix whitespace with characters.
			// Split word and insert new between
			this.wordBreak(caret);
			this.insertWordAfter(caret, new Word([newCharacter]), index);
		}
		
		return true;
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

	backspace(caret, event){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!event.ctrlKey && word.backspaceCharacter(caret) || event.ctrlKey && word.backspaceWord(caret)){
			return true;
		}
		else if (!word.Empty){
			// Caret at start of word.  Transfer to prior word.
			return index == 0 ? false : this.words[index-1].grabCaret(caret, true);
		}
		else if (index > 0){
			// Word is empty.  Combine surrounding words.
			let previous = this.words[index-1];
			previous.grabCaret(caret, true);
			if (index != this.LastIndex){
				let next = this.words[index+1];
				word.appendCharacters(next.characters);
				this.words.splice(index, 1);
			}
			this.words.splice(index, 1);
			return true;
		}
		else {
			// Caret must be passed to previous line
			return false;
		}
	}

	grabCaret(caret, toEnd){
		caret.line = this;
		return this.words[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	split(caret){
		this.wordBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedWords = this.words.splice(index + 1, toExtract);
		let brokenLine = new Line(extractedWords);
		return brokenLine;
	}

	wordBreak(caret){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		let newWord = word.split(caret);
		return newWord.Empty ? true : this.insertWordAfter(caret, newWord, index);
	}

	insertWordAfter(caret, word, index){
		this.words.splice(index + 1, 0, word);
		word.grabCaret(caret, true);
		return true;
	}

	insertWordBefore(caret, word, index){
		this.words.splice(index, 0, word);
		word.grabCaret(caret, true);
		return true;
	}
}
