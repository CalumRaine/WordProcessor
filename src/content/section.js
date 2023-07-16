// Content page
class Section {
	elements = [];
	parseCursor = 0;
	bodyWidth = 500;
	bodyHeight = 700;
	vMargin = 50;
	hMargin = 70;
	lineGap = 5;

	constructor(elements){
		this.elements = (elements == null ? [new Element(null)] : elements);
	}

	get Height(){
		return this.bodyHeight + this.vMargin + this.vMargin;
	}

	get Width(){
		return this.bodyWidth + this.hMargin + this.hMargin;
	}

	get IsParsed(){
		return this.parseCursor == this.elements.length;
	}

	get Elements(){
		return this.Empty ? [] : this.elements;
	}

	get Empty(){
		return this.elements.length == 1 && this.elements[0].Empty;
	}

	get LastIndex(){
		return this.elements.length - 1;
	}

	InitParse(){
		this.parseCursor = 0;
		this.elements.forEach(l => l.InitParse());
		return true;
	}

	IsCaretAtStart(caret){
		return caret.section == this && (this.Empty || this.elements[0].IsCaretAtStart(caret));
	}

	IsCaretAtEnd(caret){
		return caret.section == this && this.elements[this.LastIndex].IsCaretAtEnd(caret);
	}

	PutCaretAtStart(caret){
		caret.section = this;
		return this.elements[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		caret.section = this;
		return this.elements[this.LastIndex].PutCaretAtEnd(caret);
	}

	PutCaretAtLast(caret){
		caret.section = this;
		return this.elements[this.LastIndex].PutCaretAtStart(caret);
	}

	ParseNext(x, y){
		// Get the next set of wrapped elements that can fit on a page
		let maxHeight = this.bodyHeight;
		let maxWidth = this.bodyWidth;

		y += this.hMargin;
		x += this.vMargin;

		let lines = [];
		for (let e = this.parseCursor; e < this.elements.length; ++e){
			let elementToParse = this.elements[e];
			do {
				let wrappedWords = elementToParse.ParseNext(maxWidth, maxHeight, x, y);
				if (wrappedWords == null){
					// Page must wrap.  Line partially rendered but no more words can fit on page.
					return lines.length == 0 ? null : lines;
				}
				else {
					let line = new Line(elementToParse, wrappedWords, x, y);
					lines.push(line);
					y += line.Height;
					y += this.lineGap;
					maxHeight -= line.Height;
					maxHeight -= this.lineGap;
				}
			} while (!elementToParse.IsParsed);
			
			// Element successfully rendered.  Safe to advance.
			++this.parseCursor;
		}

		return lines;
	}

	HandleBackspace(event, caret){
		// Possibilities:
		// 	(1) Caret at start of page.  Return false.
		// 	(2) Caret at start of line.  Put caret at end of previous line.
		// 	(3) Backspace successful.

		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let element = this.elements[index];
		if (!element.HandleBackspace(event, caret)){
			// (2)
			let previousElement = this.elements[index-1];
			if (element.Empty){
				// Delete empty element
				this.elements.splice(index, 1);
				previousElement.PutCaretAtEnd(caret);
			}
			else if (previousElement.Empty){
				// Delete prior empty element
				this.elements.splice(index-1, 1);
			}
			else {
				// Concatenate element with previous
				previousElement.PutCaretAtEnd(caret);
				previousElement.AppendWords(element.Words, caret);
				this.elements.splice(index, 1);
			}
		}

		// (3)
		return true;
	}

	AppendElements(newElements, caret){
		let leftElement = this.elements[this.LastIndex];
		let rightElement = newElements[0];
		newElements.splice(0,1);
		if (!rightElement.Empty){
			leftElement.AppendWords(rightElement.Words, caret);
		}

		if (newElements.length > 0){
			this.elements = this.elements.concat(newElements);
		}

		return true;
	}

	HandleLeft(event, caret){
		// Possibilities:
		// 	(1) Caret already at start of page.  Return false.
		//	(2) Caret already at start of element.  Pass to prior element.


		if (this.IsCaretAtStart(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let element = this.elements[index];
		if (!element.HandleLeft(event, caret)){
			// (2)
			--index;
			let previousElement = this.elements[index];
			previousElement.PutCaretAtEnd(caret);
		}
		
		// (3)
		return true;
	}

	HandleRight(event, caret){
		// Possibilities:
		// 	(1) Caret already at end of page.  Return false.
		//	(2) Caret already at end of element.  Pass to next element.
		//	(3) Success

		if (this.IsCaretAtEnd(caret)){
			// (1)
			return false;
		}

		let index = this.getCaretIndex(caret);
		let element = this.elements[index];
		if (!element.HandleRight(event, caret)){
			// (2)
			++index;
			let nextElement = this.elements[index];
			nextElement.PutCaretAtStart(caret);
		}
		
		// (3)
		return true;
	}

	SectionBreak(caret){
		let index = this.getCaretIndex(caret);
		let element = this.elements[index];
		let brokenElement = element.ElementBreak(caret);
		brokenElement.PutCaretAtStart(caret);
		this.elements.splice(index + 1, 0, brokenElement);
		let toExtract = this.LastIndex - index;
		let extractedElements = this.elements.splice(index + 1, toExtract);
		let newSection = new Section(extractedElements.length == 0 ? null : extractedElements);
		return newSection;
	}

	ElementBreak(caret){
		let index = this.getCaretIndex(caret);
		let element = this.elements[index];
		let brokenElement = element.ElementBreak(caret);
		this.elements.splice(index + 1, 0, brokenElement);
		brokenElement.PutCaretAtStart(caret);
		return true;
	}

	getCaretIndex(caret){
		return this.elements.findIndex(l => l == caret.element);
	}
}
