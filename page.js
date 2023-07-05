class Page {
	lines = [];
	parseCursor = 0;
	bodyWidth = 500;
	bodyHeight = 700;

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
	}

	initParse(){
		this.parseCursor = 0;
		this.lines.forEach(l => l.initParse());
	}

	get Parsed(){
		return this.parseCursor == this.lines.length;
	}

	get Lines(){
		return this.lines;
	}

	appendLines(newLines){
		this.lines.concat(newLines);
		return true;
	}

	parseNext(){
		// Get the next set of wrapped lines that can fit on a page
		let maxWidth = this.bodyWidth;
		let maxHeight = this.bodyHeight;
		let wrappedLines = [];
		for (let l = this.parseCursor; l < this.lines.length; ++l){
			let lineToParse = this.lines[l];
			do {
				let wrappedWords = lineToParse.parseNext(maxWidth, maxHeight);
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

	get Characters(){
		return this.lines.flatMap(l => l.Characters);
	}

	get Text(){
		return this.lines.map(l => l.Text).join("");
	}

	get Empty(){
		return this.lines.length == 0;
	}

	get WordCount(){
		return this.lines.reduce((sum, line) => sum + line.WordCount, 0);
	}

	get LastIndex(){
		return this.lines.length - 1;
	}

	grabCaret(caret, toEnd){
		caret.page = this;
		return this.lines[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	getCaretIndex(caret){
		return this.lines.findIndex(l => l == caret.line);
	}

	backspace(caret, event){
		let index = this.getCaretIndex(caret);
		let line = this.lines[index];
		if (line.backspace(caret, event)){
			return true;
		}
		else if (line.Empty){
			this.lines.splice(index, 1);
			return this.Empty ? false : this.lines[index-1].grabCaret(caret, true);
		}
		else if (index > 0){
			let previousLine = this.lines[index-1];
			previousLine.grabCaret(caret, true);
			previousLine.appendWords(line.Words);
			this.lines.splice(index, 1);
			return true;
		}
		else {
			return false;
		}
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
		this.lineBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new Page(extractedLines);
		return newPage;
	}

	lineBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenLine = this.lines[index].split(caret);
		this.lines.splice(index + 1, 0, brokenLine);
		brokenLine.grabCaret(caret, false);
		return true;
	}
}
