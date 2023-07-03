class Line {
	words = [];

	constructor(words){
		this.words = words == null ? [new Word()] : words;
	}

	adopt(words){
		this.words = words;
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
