// Display paper
class WrappedPage {
	wrappedLines = [];
	lineGap = 5;
	bodyWidth = 500;
	bodyHeight = 700;
	vMargin = 50;
	hMargin = 70;
	screenX = 0;
	screenY = 0;
	documentX = 0;
	documentY = 0;
	contentPage = null

	constructor(contentPage, wrappedLines, x, y){
		this.contentPage = contentPage;
		this.wrappedLines = wrappedLines;
		this.documentX = x;
		this.documentY = y;
	}

	get Height(){
		return this.bodyHeight + this.vMargin + this.vMargin;
	}

	get Width(){
		return this.bodyWidth + this.hMargin + this.hMargin;
	}

	get LastIndex(){
		return this.wrappedLines.length - 1;
	}

	HasCaret(caret){
		return caret.page == this.contentPage && this.wrappedLines.some(l => l.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.page == this.contentPage && this.wrappedLines.some(l => l.RenderCursor(caret));
	}

	Render(x, y){
		// draw page
		this.debugRect(x, y, this.Width, this.Height, "black");
		this.screenX = x;
		this.screenY = y;

		// draw body
		x += this.hMargin;
		y += this.vMargin;
		this.debugRect(x, y, this.bodyWidth, this.bodyHeight, "gray");

		for (let wrappedLine of this.wrappedLines){
			y += wrappedLine.Ascent;
			this.debugLine(x, y, wrappedLine.Width, "gray");
			wrappedLine.Render(x, y);
			y += this.lineGap;
			this.debugLine(x, y, wrappedLine.Width, "gray");
		}
		return true;
	}

	Up(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.wrappedLines[index-1].PutCaretAtX(caret, caret.DocumentX);
	}

	Down(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.wrappedLines[index+1].PutCaretAtX(caret, caret.DocumentX);
	}

	PutCaretAtFirstX(caret){
		caret.page = this.contentPage;
		return this.wrappedLines[0].PutCaretAtX(caret, caret.DocumentX);
	}

	PutCaretAtLastX(caret){
		caret.page = this.contentPage;
		return this.wrappedLines[this.LastIndex].PutCaretAtX(caret, caret.DocumentX);
	}

	getCaretIndex(caret){
		return this.wrappedLines.findIndex(l => l.HasCaret(caret));
	}

	debugRect(x, y, width, height, color){
		globalCanvasContext.strokeStyle = color;
		globalCanvasContext.beginPath();
		globalCanvasContext.rect(x, y, width, height);
		globalCanvasContext.stroke();
		return true;
	}

	debugLine(x, y, width, color){
		globalCanvasContext.strokeStyle = color;
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(x, y);
		globalCanvasContext.lineTo(x + width, y);
		globalCanvasContext.stroke();
		return true;
	}
}
