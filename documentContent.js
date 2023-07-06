class Content {
	pages = [];

	constructor(pages){
		this.pages = pages == null ? [new Page()] : pages;
	}

	get Empty(){
		return this.pages.length == 1 && this.pages[0].Empty;
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

	GrabCaret(caret, toEnd){
		caret.page = this;
		return this.pages[toEnd ? this.LastIndex : 0].GrabCaret(caret, toEnd);
	}

	Backspace(caret, event){
		if (this.Empty){
			// Document is empty.  Nothing to delete.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.Backspace(caret, event) || this.Empty){
			return true;
		}
		else if (index > 0) {
			let previousPage = this.pages[index-1];
			previousPage.GrabCaret(caret, true);
			previousPage.AppendLines(page.Lines);
			this.pages.splice(index, 1);
			return true;
		}

		return false;
	}

	PageBreak(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		let brokenPage = page.PageBreak(caret);
		this.insertPageAfter(brokenPage, index);
		return true;
	}

	getCaretIndex(caret){
		return this.pages.findIndex(p => p == caret.page);
	}

	/* -- */
	left(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.pages[index - 1].grabCaret(caret, true);
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.pages[index + 1].grabCaret(caret, false);
	}

	split(caret){
		this.PageBreak(caret);
		let index = this.getCaretIndex(caret);
		let toExtract = this.LastIndex - index;
		let extractedLines = this.lines.splice(index, toExtract);
		let newPage = new Page(extractedLines);
		return newPage;
	}

	insertPageAfter(page, index){
		this.lines.splice(index + 1, 0, page);
		page.grabCaret(caret, false);
		return true;
	}
}
