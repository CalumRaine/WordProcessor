class Content {
	lines = [];

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
	}

	adopt(lines){
		this.lines = lines;
		return line;
	}

	get Text(){
		return this.lines.map(l => l.Text).join("");
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
		let newPage = new Page();
		newPage.adopt(extractedLines);
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
