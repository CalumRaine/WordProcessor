class Page {
	lines = [];
	parseCursor = 0;
	bodyWidth = 500;
	bodyHeight = 700;

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
	}

	InitParse(){
		this.parseCursor = 0;
		this.lines.forEach(l => l.InitParse());
	}

	get Parsed(){
		return this.parseCursor == this.lines.length;
	}

	get Lines(){
		return this.Empty ? [] : this.lines;
	}

	get Characters(){
		return this.lines.flatMap(l => l.Characters);
	}

	get Text(){
		return this.lines.map(l => l.Text).join("");
	}

	get Empty(){
		return this.lines.length == 1 && this.lines[0].Empty;
	}

	get WordCount(){
		return this.lines.reduce((sum, line) => sum + line.WordCount, 0);
	}

	get LastIndex(){
		return this.lines.length - 1;
	}

	GrabCaret(caret, toEnd){
		caret.page = this;
		return this.lines[toEnd ? this.LastIndex : 0].GrabCaret(caret, toEnd);
	}

	ParseNext(){
		// Get the next set of wrapped lines that can fit on a page
		let maxWidth = this.bodyWidth;
		let maxHeight = this.bodyHeight;
		let wrappedLines = [];
		for (let l = this.parseCursor; l < this.lines.length; ++l){
			let lineToParse = this.lines[l];
			do {
				let wrappedWords = lineToParse.ParseNext(maxWidth, maxHeight);
				if (wrappedWords == null){
					// Page must wrap.  Line partially rendered but no more words can fit on page.
					return wrappedLines.length == 0 ? null : wrappedLines;
				}
				else {
					let wrappedLine = new WrappedLine(wrappedWords);
					wrappedLines.push(wrappedLine);
					maxHeight -= wrappedLine.Ascent;
				}
			} while (!lineToParse.Parsed);
			
			// Line successfully rendered.  Safe to advance.
			++this.parseCursor;
		}

		return wrappedLines;
	}

	Backspace(caret, event){
		if (this.Empty){
			// No lines to backspace
			// Tell parent to delete
			return false;
		}

		let index = this.getCaretIndex(caret);
		if (index == Caret.START){
			// Caret already at beginning
			// Tell parent to delete and concatenate with previous page
			return false;
		}

		let line = this.lines[index];
		if (line.Backspace(caret, event) || this.Empty){
			return true;
		}
		else if (line.Empty){
			// Line is empty. Delete it.  We have others.
			// If first line, pass caret to start of next line.
			// Else pass caret to end of previous line.
			this.lines.splice(index, 1);
			return index == 0 ? this.lines[index].GrabCaret(caret, false) : this.lines[index-1].GrabCaret(caret, true);
		}
		else if (index > 0){
			// Concatenate line with previous
			let previousLine = this.lines[index-1];
			previousLine.GrabCaret(caret, true);
			previousLine.appendWords(line.Words);
			this.lines.splice(index, 1);
			return true;
		}

		// No previous line.  Request page concatenation.
		caret.line = null;
		return false;
	}

	AppendLines(newLines){
		this.lines.concat(newLines);
		return true;
	}

	getCaretIndex(caret){
		return this.lines.findIndex(l => l == caret.line);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.lines[index - 1].grabCaret(caret, true);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.lines[index + 1].grabCaret(caret, false);
	}

	split(caret){
		this.LineBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new Page(extractedLines);
		return newPage;
	}

	LineBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenLine = this.lines[index].Split(caret);
		this.lines.splice(index + 1, 0, brokenLine);
		brokenLine.GrabCaret(caret, false);
		return true;
	}
}
