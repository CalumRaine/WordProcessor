// Parses text buffer and displays on screen
class DocumentDisplay {
	sheets = [];
	pageGap = 20;
	marginX = 20;
	marginY = 20;
	scrollPosition = 0;
	width = 0;
	height = 0;
	
	constructor(windowWidth, windowHeight){
		this.width = windowWidth;
		this.height = windowHeight;
	}

	get LastIndex(){
		return this.sheets.length - 1;
	}

	HandleClick(event, caret){
		this.sheets.some(p => p.ClaimCaretAtXY(caret, event.offsetX, event.offsetY));
		this.Render();
		this.RenderCursor(caret);
		return true;
	}

	HandleScroll(event, caret){
		this.scrollPosition += event.deltaY;
		this.Render();
		this.RenderCursor(caret);
		return true;
	}

	Parse(pages){
		let x = this.marginX;
		let y = this.marginY;
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
		globalCanvasContext.clearRect(0, 0, this.width, this.height);
		let scrollTop = this.scrollPosition;
		let scrollBottom = scrollTop + this.height;
		this.sheets.forEach(p => p.Render(scrollTop, scrollBottom));
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
