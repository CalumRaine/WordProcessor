class Page {
	lines = [];

	constructor(lines){
		this.lines = lines == null ? [new Line()] : lines;
	}

	adopt(lines){
		this.lines = lines;
		return line;
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
