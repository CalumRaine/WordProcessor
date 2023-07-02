class Line {
	words = [];

	constructor(words){
		this.words = words == null ? [new Word()] : words;
	}

	adopt(words){
		this.words = words;
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

	insert(caret, newCharacter){
		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (word.insert(caret, newCharacter)){
			return true;
		}
		else if (word.caretAtEnd(caret)){
			// prepend to start of next word
			if (index == this.LastIndex){
				let newWord = new Word([newCharacter]);
				this.words.push(newWord);
				newWord.grabCaret(caret, true);
				return true;
			}
			else {
				return this.words[index+1].insert(caret, newCharacter);
			}
		}
		else if (word.caretAtStart(caret)){
			// append to end of previous word
			if (index == 0){
				let newWord = new Word([newCharacter]);
				this.words.splice(0, 0, newWord);
				newWord.grabCaret(caret, true);
				return true;
			}
			else {
				return this.words[index-1].insert(caret, newCharacter);
			}
		}
		else {
			// Split word and insert character between
			this.wordBreak(caret);
			this.words.splice(1, 0, newWord);
			newWord.grabCaret(caret, true);
			return true;
		}
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
		let extractedWords = this.words.splice(index, toExtract);
		let brokenLine = new Line();
		brokenLine.adopt(extractedWords);
		return brokenLine;
	}

	wordBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenWord = this.words[index].split(caret);
		this.words.splice(index, 0, brokenWord);
		brokenWord.grabCaret(caret);
		return true;
	}
}
