// Text buffer edited by user
class DocumentContent {
	sections = [];

	constructor(sections){
		this.sections = sections == null ? [new Section()] : sections;
	}

	get Sections(){
		return this.sections;
	}

	get Empty(){
		return this.sections.length == 1 && this.sections[0].Empty;
	}

	get LastIndex(){
		return this.sections.length - 1;
	}

	PutCaretAtStart(caret){
		return this.sections[0].PutCaretAtStart(caret);
	}

	PutCaretAtEnd(caret){
		return this.sections[this.LastIndex].PutCaretAtEnd(caret);
	}

	HandleBackspace(event, caret){
		if (this.Empty){
			// Document is empty.  Nothing to delete.
			return false;
		}

		let index = this.getCaretIndex(caret);
		let section = this.sections[index];
		if (section.HandleBackspace(event, caret) || this.Empty){
			return true;
		}
		else if (index > 0) {
			let previousSection = this.sections[index-1];
			previousSection.PutCaretAtEnd(caret);
			previousSection.AppendElements(section.Elements, caret);
			this.sections.splice(index, 1);
			return true;
		}

		return false;
	}

	HandleArrow(event, caret){
		return event.key == "ArrowLeft" ? this.handleLeft(event, caret) : this.handleRight(event, caret);
	}

	SectionBreak(caret){
		let index = this.getCaretIndex(caret);
		let section = this.sections[index];
		let brokenSection = section.SectionBreak(caret);
		this.sections.splice(index + 1, 0, brokenSection);
		brokenSection.PutCaretAtStart(caret);
		return true;
	}

	Up(caret){
		let index = this.getCaretIndex(caret);
		let section = this.sections[index];
		return section.PutCaretAt(caret) ? true : this.sections[index-1].PutCaretAt(caret)
	}

	handleLeft(event, caret){
		let index = this.getCaretIndex(caret);
		let section = this.sections[index];
		if (section.HandleLeft(event, caret)){
			return true;
		}
		else if (index > 0){
			--index;
			let previousSection = this.sections[index];
			previousSection.PutCaretAtEnd(caret);
			return true;
		}
		else {
			console.log("Ignored.  Already at start of document.");
			return false;
		}
	}

	handleRight(event, caret){
		let index = this.getCaretIndex(caret);
		let section = this.sections[index];
		if (section.HandleRight(event, caret)){
			return true;
		}
		else if (index < this.LastIndex){
			++index;
			let nextSection = this.sections[index];
			nextSection.PutCaretAtStart(caret);
			return true;
		}
		else {
			console.log("Ignored.  Already at end of document.");
			return false;
		}
	}

	getCaretIndex(caret){
		return this.sections.findIndex(p => p == caret.section);
	}
}
