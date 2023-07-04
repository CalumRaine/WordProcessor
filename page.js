class Page {
	lines = [];
	renderCursor = 0;
	bodyWidth = 500;
	bodyHeight = 700;

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
	}

	initRender(){
		this.renderCursor = 0;
		this.lines.forEach(l => l.initRender());
	}

	get Rendered(){
		return this.renderCursor == this.lines.length;
	}

	renderNext(maxWidth, maxHeight){
		// Get the next set of wrapped lines that can fit on a page
		let wrappedLines = [];
		for (let l = this.renderCursor; l < this.lines.length; ++l){
			let lineToRender = this.lines[l];
			do {
				let wrappedWords = lineToRender.renderNext(maxWidth, maxHeight);
				if (wrappedWords == null){
					// Page must wrap.  Line partially rendered but no more words can fit on page.
					return wrappedLines;
				}
				else {
					let wrappedLine = new WrappedLine(wrappedWords);
					wrappedLines.push(wrappedLine);
					maxHeight -= wrappedLine.Height;
				}
			} while (!lineToRender.Rendered);
			
			// Line successfully rendered.  Safe to advance.
			++this.renderCursor;
		}

		return wrappedWords;
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
		else {
			return index == 0 ? false : this.lines[index-1].grabCaret(caret, true);
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
		this.lines.splice(index, 0, brokenLine);
		brokenLine.grabCaret(caret, false);
		return true;
	}
}
