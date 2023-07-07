// Parses text buffer and displays on screen
class DocumentDisplay {
	wrappedPages = [];
	pageGap = 20;
	
	constructor(){

	}

	Parse(contentPages){
		this.wrappedPages = [];
		for (let contentPage of contentPages){
			contentPage.InitParse();
			do {
				let wrappedLines = contentPage.ParseNext();
				let wrappedPage = new WrappedPage(contentPage, wrappedLines);
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
