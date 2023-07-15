// Display paper
class Paper {
	lines = [];
	lineGap = 5;
	bodyWidth = 500;
	bodyHeight = 700;
	vMargin = 50;
	hMargin = 70;
	documentX = 0;
	documentY = 0;
	onScreen = false;
	page = null

	constructor(page, lines, x, y){
		this.page = page;
		this.lines = lines;
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
		return this.lines.length - 1;
	}

	set OnScreen(value){
		this.onScreen = value;
		this.lines.forEach(l => l.OnScreen = value);
		return true;
	}

	ClaimCaretAtXY(caret, x, y){
		if (!this.onScreen || y > (this.screenY + this.Height)){
			return false;
		}
		else if (!this.lines.some(l => l.ClaimCaretAtXY(caret, x, y))){
			this.lines[this.LastIndex].PutCaretAtX(caret, x);
		}
	
		return true;
	}

	HasCaret(caret){
		return caret.page == this.page && this.lines.some(l => l.HasCaret(caret));
	}

	RenderCursor(caret){
		return caret.page == this.page && this.lines.some(l => l.RenderCursor(caret));
	}

	Render(scrollTop, scrollBottom){
		if (this.documentY > scrollBottom || (this.documentY + this.Height) < scrollTop){
			this.OnScreen = false;
			return false;
		}

		this.onScreen = true;
		this.screenY = this.documentY - scrollTop;
		this.debugRect(this.documentX, this.screenY, this.Width, this.Height, "black");
		this.lines.forEach(l => l.Render(scrollTop, scrollBottom));
		return true;
	}

	Up(caret){
		let index = this.getCaretIndex(caret);
		return index == 0 ? false : this.lines[index-1].PutCaretAtX(caret, caret.DocumentX);
	}

	Down(caret){
		let index = this.getCaretIndex(caret);
		return index == this.LastIndex ? false : this.lines[index+1].PutCaretAtX(caret, caret.DocumentX);
	}

	PutCaretAtFirstX(caret){
		caret.page = this.page;
		return this.lines[0].PutCaretAtX(caret, caret.DocumentX);
	}

	PutCaretAtLastX(caret){
		caret.page = this.page;
		return this.lines[this.LastIndex].PutCaretAtX(caret, caret.DocumentX);
	}

	getCaretIndex(caret){
		return this.lines.findIndex(l => l.HasCaret(caret));
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
		globalCanvasContext.lineWidth = 1;
		globalCanvasContext.beginPath();
		globalCanvasContext.moveTo(x, y);
		globalCanvasContext.lineTo(x + width, y);
		globalCanvasContext.stroke();
		return true;
	}
}
