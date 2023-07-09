// Holds the page, line, word and character where the user is set to edit
class Caret {
	static RIGHT = 1;
	static LEFT = 2;
	page = null;
	line = null;
	word = null;
	character = null;
	rightSide = true;
	style = new FontStyle();
	
	constructor(){
		document.addEventListener("FontToggle", (event) => this.HandleFontToggle(event));
		document.addEventListener("FontSelector", (event) => this.HandleFontSelector(event));
		document.addEventListener("FontSize", (event) => this.HandleFontSize(event));
		document.addEventListener("FontColor", (event) => this.HandleFontColor(event));
	}

	HandleFontToggle(event){
		console.log(event.type, event.detail.parameter, event.detail.on);
		switch (event.detail.parameter){
			case "bold":
				this.style.Bold = event.detail.on;
				break;
			case "italic":
				this.style.Italic = event.detail.on;
				break;
			default:
				console.log("Unhandled font toggle");
				return false;
		}
		return true;
	}

	HandleFontSelector(event){
		this.style.Family = event.detail;
		return true;
	}

	HandleFontSize(event){
		this.style.Size = event.detail;
	}

	HandleFontColor(event){
		this.style.Color = event.detail;
	}

	get OnRight(){
		return this.rightSide;
	}

	get OnLeft(){
		return !this.rightSide;
	}

	get DocumentX(){
		return this.rightSide ? (this.character.documentX + this.character.Width) : this.character.documentX;
	}

	set Side(value){
		if (value == Caret.RIGHT){
			this.rightSide = true;
		}
		else if (value == Caret.LEFT){
			this.rightSide = false;
		}
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
		this.line.InsertCharacter(this, character);
	}

	HandleEnter(){
		return this.page.LineBreak(this);
	}
}
