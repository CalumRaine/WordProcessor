// Parses text buffer and displays on screen
class DocumentDisplay {
	pages = [];
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
		return this.pages.length - 1;
	}

	HandleClick(event, caret){
		this.pages.some(p => p.ClaimCaretAtXY(caret, event.offsetX, event.offsetY));
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

	Parse(sections){
		let x = this.marginX;
		let y = this.marginY;
		this.pages = [];
		for (let section of sections){
			section.InitParse();
			do {
				let lines = section.ParseNext(x, y);
				let page = new Page(section, lines, x, y);
				y += page.Height;
				y += this.pageGap;
				this.pages.push(page);
			} while (!section.IsParsed);
		}
	}

	Render(){
		globalCanvasContext.clearRect(0, 0, this.width, this.height);
		let scrollTop = this.scrollPosition;
		let scrollBottom = scrollTop + this.height;
		this.pages.forEach(p => p.Render(scrollTop, scrollBottom));
		return true;
	}

	RenderCursor(caret){
		return this.pages.some(p => p.RenderCursor(caret));
	}

	HandleArrow(event, caret){
		return event.key == "ArrowUp" ? this.up(caret) : this.down(caret);
	}

	up(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.Up(caret)){
			return true;
		}
		else if (index > 0){
			--index;
			let previousPage = this.pages[index];
			return previousPage.PutCaretAtLastX(caret);
		}
		else {
			console.log("Ignored.  Already at start of document.");
			return false;
		}
	}

	down(caret){
		let index = this.getCaretIndex(caret);
		let page = this.pages[index];
		if (page.Down(caret)){
			return true;
		}
		else if (index < this.LastIndex){
			++index;
			let nextPage = this.pages[index];
			return nextPage.PutCaretAtFirstX(caret);
		}
		else {
			console.log("Ignored.  Already at end of document.");
			return false;
		}
	}

	getCaretIndex(caret){
		return this.pages.findIndex(p => p.HasCaret(caret));
	}
}
