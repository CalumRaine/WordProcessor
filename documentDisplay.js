// Parses text buffer and displays on screen
class DocumentDisplay {
	wrappedPages = [];
	pageGap = 20;
	
	constructor(){

	}

	get LastIndex(){
		return this.wrappedPages.length - 1;
	}

	Parse(contentPages){
		let x = 0;
		let y = 0;
		this.wrappedPages = [];
		for (let contentPage of contentPages){
			contentPage.InitParse();
			do {
				let wrappedLines = contentPage.ParseNext(x, y);
				let wrappedPage = new WrappedPage(contentPage, wrappedLines, x, y);
				y += wrappedPage.Height;
				y += this.pageGap;
				this.wrappedPages.push(wrappedPage);
			} while (!contentPage.Parsed);
		}
	}

	Render(){
		let x = 20;
		let y = 20;
		for (let wrappedPage of this.wrappedPages){
			wrappedPage.Render(x, y);
			y += wrappedPage.Height;
			y += this.pageGap;
		}
	
		return true;
	}

	RenderCursor(caret){
		return this.wrappedPages.some(p => p.RenderCursor(caret));
	}

	HandleArrow(event, caret){
		return event.key == "ArrowUp" ? this.up(caret) : this.down(caret);
	}

	up(caret){
		let index = this.getCaretIndex(caret);
		let page = this.wrappedPages[index];
		if (page.Up(caret)){
			return true;
		}
		else if (index == 0){
			console.log("Ignored.  Already at start of document.");
			return false;
		}
		else {
			let previousPage = this.pages[index-1];
			return previousPage.PutCaretOnLast(caret);
		}
	}

	down(caret){
		let index = this.getCaretIndex(caret);
		let page = this.wrappedPages[index];
		if (page.Down(caret)){
			return true;
		}
		else if (index == this.LastIndex){
			console.log("Ignored.  Already at end of document.");
			return false;
		}
		else {
			let nextPage = this.pages[index+1];
			return nextPage.PutCaretOnFirst(caret);
		}
	}

	getCaretIndex(caret){
		return this.wrappedPages.findIndex(p => p.HasCaret(caret));
	}
}
