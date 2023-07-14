// Parses text buffer and displays on screen
class DocumentDisplay {
	sheets = [];
	pageGap = 20;
	
	constructor(){

	}

	get LastIndex(){
		return this.sheets.length - 1;
	}

	Parse(pages){
		let x = 0;
		let y = 0;
		this.sheets = [];
		for (let page of pages){
			page.InitParse();
			do {
				let lines = page.ParseNext(x, y);
				let paper = new Paper(page, lines, x, y);
				y += paper.Height;
				y += this.pageGap;
				this.sheets.push(paper);
			} while (!page.IsParsed);
		}
	}

	Render(){
		let x = 20;
		let y = 20;
		for (let paper of this.sheets){
			paper.Render(x, y);
			y += paper.Height;
			y += this.pageGap;
		}
	
		return true;
	}

	RenderCursor(caret){
		return this.sheets.some(p => p.RenderCursor(caret));
	}

	HandleArrow(event, caret){
		return event.key == "ArrowUp" ? this.up(caret) : this.down(caret);
	}

	up(caret){
		let index = this.getCaretIndex(caret);
		let paper = this.sheets[index];
		if (paper.Up(caret)){
			return true;
		}
		else if (index > 0){
			--index;
			let previousPaper = this.sheets[index];
			return previousPaper.PutCaretAtLastX(caret);
		}
		else {
			console.log("Ignored.  Already at start of document.");
			return false;
		}
	}

	down(caret){
		let index = this.getCaretIndex(caret);
		let paper = this.sheets[index];
		if (paper.Down(caret)){
			return true;
		}
		else if (index < this.LastIndex){
			++index;
			let nextPaper = this.sheets[index];
			return nextPaper.PutCaretAtFirstX(caret);
		}
		else {
			console.log("Ignored.  Already at end of document.");
			return false;
		}
	}

	getCaretIndex(caret){
		return this.sheets.findIndex(p => p.HasCaret(caret));
	}
}
