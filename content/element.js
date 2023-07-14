// Content element (p, ul, ol, etc)
class Element {
	words = [];
	fallbackStyle = new FontStyle();
	parseCursor = 0;

	constructor(words, fontStyle){
		if (words != null){
			this.words = words;
		}

		if (fontStyle != null){
			this.fallbackStyle = fontStyle;
		}

		this.updateFallbackStyle();
	}

	InitParse(){
		this.parseCursor = 0;
		this.words.forEach(w => w.InitParse());
		return true;
	}

	get IsParsed(){
		return this.parseCursor == this.words.length;
	}

	get Words(){
		return this.words;
	}

	get Height(){
		return this.words.length == 0 ? this.fallbackStyle.Size : Math.max(...this.words.map(w => w.Height));
	}

	get Characters(){
		return this.words.flatMap(w => w.Characters);
	}

	get LastIndex(){
		return this.words.length - 1;
	}

	get Empty(){
		return this.words.length == 0;
	}

	IsCaretAtStart(caret){
		return caret.element == this && (this.Empty || this.words[0].IsCaretAtStart(caret));
	}

	IsCaretAtEnd(caret){
		return caret.element == this && (this.Empty || this.words[this.LastIndex].IsCaretAtEnd(caret));
	}

	AppendWords(newWords){
		// Possibilities:
		// 	(1) New Words are empty.  Do nothing.
		// 	(2) Element already contains words.  Check whether splice point requires concatenating.
		// 	(3) Element empty.  Accept the words.

		if (newWords.length == 0){
			// (1)
			return false;
		}
		else if (!this.Empty){
			// (2)
			let leftWord = this.words[this.LastIndex];
			let rightWord = newWords[0];
			if (leftWord.IsTrueWord == rightWord.IsTrueWord){
				leftWord.AppendCharacters(rightWord.Characters);
				newWords.splice(0,1);
			}
		}

		// (3)
		this.words = this.words.concat(newWords);
		this.updateFallbackStyle();
		return true;
	}

	ParseNext(maxWidth, maxHeight, x, y){
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

			} while (!wordToParse.IsParsed);

			// Word successfully parsed.  Safe to advance
			++this.parseCursor;
		}

		return wrappedWords;
	}

	InsertCharacter(caret, newCharacter){
		// Possibilities:
		// 	(1) Element is empty.  Accept character as new word and update fallback syle.
		// 	(2) Word rejects character because one is whitespace and the other not.
		// 	(3) Word accepts character

		if (this.Empty){
			// (2)
			let word = new Word([newCharacter]);
			this.words.push(word);
			word.PutCaretAtEnd(caret);	
			this.updateFallbackStyle();
			return true;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!word.InsertCharacter(caret, newCharacter)){
			// (2)
			let brokenWord = word.WordBreak(caret);
			if (!brokenWord.Empty){
				this.words.splice(index + 1, 0, brokenWord);
			}
			let newWord = new Word([newCharacter]);
			this.words.splice(index + 1, 0, newWord);
			newWord.PutCaretAtEnd(caret);
		}
		
		// (3)
		this.updateFallbackStyle();
		return true;
	}

	ElementBreak(caret){
		// Possibilities:
		// 	(1) Element is empty.  Return blank element.
		// 	(2) Word break leaves empty word.  Remove it.
		// 	(3) Element break successful

		if (this.Empty){
			// (1)
			return new Element(null, caret.Style);
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		let brokenWord = word.WordBreak(caret);
		if (!brokenWord.Empty){
			this.words.splice(index + 1, 0, brokenWord);
			if (word.Empty){
				// (2)
				this.words.splice(index, 1);
				--index;
			}
		}

		// (3)
		let extractedWords = this.words.splice(index + 1);
		return new Element(extractedWords, caret.Style);
	}

	PutCaretAtStart(caret){
		caret.element = this;
		return this.words.length == 0 ? caret.NoWord(this.fallbackStyle) : this.words[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		caret.element = this;
		return this.words.length == 0 ? caret.NoWord(this.fallbackStyle) : this.words[this.LastIndex].PutCaretAtEnd(caret);
	}

	HandleBackspace(event, caret){
		// Possibilities:
		// 	(1) Caret at start of element.  Nothing to backspace.  Return false.
		// 	(2) Caret at start of word.  Word refuses to backspace.  Backspace prior word.
		// 	(3) Backspace leaves an empty word.  Remove it.

		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (event.ctrlKey && !word.BackspaceWord(caret) || !event.ctrlKey && !word.BackspaceCharacter(caret)){
			// (2)
			--index;
			word = this.words[index];
			word.PutCaretAtEnd(caret);
			return this.HandleBackspace(event, caret);
		}
		else if (word.Empty){
			// (3)
			this.words.splice(index, 1);
			if (this.Empty){

			}
			else if (index == 0){
				word = this.words[index];
				word.PutCaretAtStart(caret);
			}
			else if (index > this.LastIndex){
				word = this.words[this.LastIndex];
				word.PutCaretAtEnd(caret);
			}
			else {
				let previousWord = this.words[index-1];
				previousWord.PutCaretAtEnd(caret);
				let nextWord = this.words[index];
				previousWord.AppendCharacters(nextWord.Characters);
				this.words.splice(index, 1);
			}
		}

		this.updateFallbackStyle();
		return true;
	}

	HandleLeft(event, caret){
		// Possibilities:
		// 	(1) Caret already at start of element.  Can go no further left.  Return false.
		// 	(2) Caret already at start of word.  Transfer to prior word.
		// 	(3) Success

		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!event.ctrlKey && !word.LeftCharacter(caret) || event.ctrlKey && !word.LeftWord(caret)){
			// (2)
			--index;
			let previousWord = this.words[index];
			previousWord.PutCaretAtEnd(caret);
			return this.HandleLeft(event, caret);
		}
		
		// (3)
		return true;
	}

	HandleRight(event, caret){
		// Possibilities:
		// 	(1) Caret already at end of element.  Can go no further right.  Return false.
		// 	(2) Caret already at end of word.  Transfer to next word.
		// 	(3) Success

		if (this.IsCaretAtEnd(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let word = this.words[index];
		if (!event.ctrlKey && !word.RightCharacter(caret) || event.ctrlKey && !word.RightWord(caret)){
			// (2)
			++index;
			let nextWord = this.words[index];
			nextWord.PutCaretAtStart(caret);
			return this.HandleRight(event, caret);
		}

		// (3)
		return true;
	}

	getCaretIndex(caret){
		return this.words.findIndex(w => w == caret.word);
	}

	updateFallbackStyle(){
		if (this.words.length == 0){
			return false;
		}
		
		this.fallbackStyle = this.words[0].Style;
		return true;
	}
}
