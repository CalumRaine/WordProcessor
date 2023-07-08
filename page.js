// Content page
class Page {
	lines = [];
	parseCursor = 0;
	bodyWidth = 500;
	bodyHeight = 700;
	lineGap = 5;

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
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

	InitParse(){
		this.parseCursor = 0;
		this.lines.forEach(l => l.InitParse());
		return true;
	}

	CaretAtStart(caret){
		return caret.OnLeft && caret.page == this && this.lines[0].CaretAtStart(caret);
	}

	PutCaretAtStart(caret){
		caret.page = this;
		return this.lines[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		caret.page = this;
		return this.lines[this.LastIndex].PutCaretAtEnd(caret);
	}

	ParseNext(x, y){
		// Get the next set of wrapped lines that can fit on a page
		let maxWidth = this.bodyWidth;
		let maxHeight = this.bodyHeight;
		let wrappedLines = [];
		for (let l = this.parseCursor; l < this.lines.length; ++l){
			let lineToParse = this.lines[l];
			do {
				let wrappedWords = lineToParse.ParseNext(maxWidth, maxHeight, x, y);
				if (wrappedWords == null){
					// Page must wrap.  Line partially rendered but no more words can fit on page.
					return wrappedLines.length == 0 ? null : wrappedLines;
				}
				else {
					let wrappedLine = new WrappedLine(lineToParse, wrappedWords, x, y);
					wrappedLines.push(wrappedLine);
					y += wrappedLine.Ascent;
					y += this.lineGap;
					maxHeight -= wrappedLine.Ascent;
				}
			} while (!lineToParse.Parsed);
			
			// Line successfully rendered.  Safe to advance.
			++this.parseCursor;
		}

		return wrappedLines;
	}

	Backspace(caret, event){
		if (this.CaretAtStart(caret)){
			// Caret already at start of page.  No can do.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let line = this.lines[index];
		if (line.HandleBackspace(event, caret)){
			return true;
		}
		else if (line.Empty){
			// Line is empty. Delete it.  We have others.
			// If first line, pass caret to start of next line.
			// Else pass caret to end of previous line.
			this.lines.splice(index, 1);
			this.lines[index-1].PutCaretAtEnd(caret);
			return true;
		}
		else if (index > 0){
			// Concatenate line with previous
			let previousLine = this.lines[index-1];
			previousLine.PutCaretAtEnd(caret);
			previousLine.AppendWords(line.Words);
			this.lines.splice(index, 1);
			return true;
		}

		// No previous line.  Request page concatenation.
		return false;
	}

	AppendLines(newLines){
		this.lines.concat(newLines);
		return true;
	}

	getCaretIndex(caret){
		return this.lines.findIndex(l => l == caret.line);
	}

	Left(caret){
		let index = this.getCaretIndex(caret);
		let line = this.lines[index];
		if (line.Left(caret)){
			return true;
		}
		else if (index > 0) {
			let previousLine = this.lines[index-1];
			previousLine.PutCaretAtEnd(caret);
			return true;
		}
		else {
			return false;
		}
	}

	Right(caret){
		let index = this.getCaretIndex(caret);
		let line = this.lines[index];
		if (line.Right(caret)){
			return true;
		}
		else if (index < this.LastIndex) {
			let nextLine = this.lines[index+1];
			nextLine.PutCaretAtStart(caret);
			return true;
		}
		else {
			return false;
		}
	}

	PageBreak(caret){
		this.LineBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new Page(extractedLines);
		return newPage;
	}

	LineBreak(caret){
		let index = this.getCaretIndex(caret);
		let brokenLine = this.lines[index].LineBreak(caret);
		this.lines.splice(index + 1, 0, brokenLine);
		brokenLine.PutCaretAtStart(caret);
		return true;
	}
}
