// Holds the page, line, word and character where the user is set to edit
class Caret {
	static RIGHT = 1;
	static LEFT = 2;
	page = null;
	element = null;
	word = null;
	character = null;
	rightSide = true;
	style = new FontStyle();
	
	constructor(){
		document.addEventListener("BoldToggle", (event) => this.HandleBoldToggle(event));
		document.addEventListener("ItalicToggle", (event) => this.HandleItalicToggle(event));
		document.addEventListener("FontSelector", (event) => this.HandleFontSelector(event));
		document.addEventListener("FontSize", (event) => this.HandleFontSize(event));
		document.addEventListener("FontColor", (event) => this.HandleFontColor(event));
	}

	get Style(){
		return this.style;
	}

	HandleBoldToggle(event){
		this.style.Bold = event.detail;
		return true;
	}

	HandleItalicToggle(event){
		this.style.Italic = event.detail;
		return true;
	}

	HandleFontSelector(event){
		this.style.Family = event.detail;
		return true;
	}

	HandleFontSize(event){
		this.style.Size = event.detail;
		return true;
	}

	HandleFontColor(event){
		this.style.Color = event.detail;
		return true;
	}

	get OnRight(){
		return this.rightSide;
	}

	get OnLeft(){
		return !this.rightSide;
	}

	get DocumentX(){
		return this.character == null ? this.element.documentX : (this.rightSide ? (this.character.documentX + this.character.Width) : this.character.documentX);
	}

	set Side(value){
		if (value == Caret.RIGHT){
			this.rightSide = true;
		}
		else if (value == Caret.LEFT){
			this.rightSide = false;
		}
	}

	NoWord(style){
		this.word = null;
		return this.NoCharacter(style);
	}

	NoCharacter(style){
		this.character = null;
		this.style = style;
		this.rightSide = false;
		return true;
	}

	MoveRight(){
		if (this.OnRight){
			return false;
		}

		this.rightSide = true;
		return true;
	}

	MoveLeft(){
		if (this.OnLeft){
			return false;
		}

		this.rightSide = false;
		return true;
	}

	HandleKey(event){
		event.preventDefault();
		let character = new Character(event.key, this.style.Clone());
		return this.element.InsertCharacter(this, character);
	}

	HandleEnter(){
		return this.page.ElementBreak(this);
	}
}
