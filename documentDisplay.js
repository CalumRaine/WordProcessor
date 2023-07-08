// Parses text buffer and displays on screen
class DocumentDisplay {
	wrappedPages = [];
	pageGap = 20;
	
	constructor(){

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
}
