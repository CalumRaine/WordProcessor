class Content {
	pages = [];

	constructor(pages){
		this.pages = pages == null ? [new Page()] : pages;
	}

	get Pages(){
		return this.pages;
	}

	get Characters(){
		return this.pages.flatMap(p => p.Characters);
	}

	get Text(){
		return this.pages.map(p => p.Text).join("");
	}

	get WordCount(){
		return this.pages.reduce((sum, page) => sum + page.WordCount, 0);
	}

	get LastIndex(){
		return this.pages.length - 1;
	}

	grabCaret(caret, toEnd){
		caret.page = this;
		return this.pages[toEnd ? this.LastIndex : 0].grabCaret(caret, toEnd);
	}

	getCaretIndex(caret){
		return this.pages.findIndex(p => p == caret.page);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.pages[index - 1].grabCaret(caret, true);
	}

	backspace(caret, event){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.backspace(caret, event)){
			return true;
		}
		else if (index == 0){
			return false;
		}
		else if (page.Empty){
			this.pages.splice(index, 1);
			return this.pages[index-1].grabCaret(caret, true);
		}
		else {
			let previousPage = this.pages[index-1];
			previousPage.grabCaret(caret, true);
			previousPage.appendLines(page.Lines);
			this.pages.splice(index, 1);
			return true;
		}
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.pages[index + 1].grabCaret(caret, false);
	}

	split(caret){
		this.pageBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new Page(extractedLines);
		return newPage;
	}

	pageBreak(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		let brokenPage = page.split(caret);
		this.insertPageAfter(brokenPage, index);
		return true;
	}

	insertPageAfter(page, index){
		this.lines.splice(index + 1, 0, page);
		page.grabCaret(caret, false);
		return true;
	}
}
