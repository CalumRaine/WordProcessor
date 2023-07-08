// Text buffer edited by user
class DocumentContent {
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

	PutCaretAtStart(caret){
		return this.pages[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		return this.pages[this.LastIndex].PutCaretAtEnd(caret);
	}

	HandleBackspace(event, caret){
		if (this.Empty){
			// Document is empty.  Nothing to delete.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.HandleBackspace(event, caret) || this.Empty){
			return true;
		}
		else if (index > 0) {
			let previousPage = this.pages[index-1];
			previousPage.PutCaretAtEnd(caret);
			previousPage.AppendLines(page.Lines);
			this.pages.splice(index, 1);
			return true;
		}

		return false;
	}

	HandleArrow(event, caret){
		return event.key == "ArrowLeft" ? this.left(caret) : this.right(caret);
	}

	PageBreak(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		let brokenPage = page.PageBreak(caret);
		this.insertPageAfter(brokenPage, index);
		return true;
	}

	Up(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[idex];
		return page.PutCaretAt(caret) ? true : this.pages[index-1].PutCaretAt(caret)
	}

	getCaretIndex(caret){
		return this.pages.findIndex(p => p == caret.page);
	}

	left(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.Left(caret)){
			return true;
		}
		else if (index == 0){
			console.log("Ignored.  Already at start of document.");
			return false;
		}
		else {
			return this.pages[index-1].PutCaretAtEnd(caret);
		}
	}

	right(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.Right(caret)){
			return true;
		}
		else if (index == this.LastIndex){
			console.log("Ignored.  Already at end of document.");
			return false;
		}
		else {
			return this.pages[index+1].PutCaretAtStart(caret);
		}
	}

	/* -- */
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
