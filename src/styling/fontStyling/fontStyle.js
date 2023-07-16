class FontStyle {
	family = "Arial";
	color = "black";
	size = 12;
	sizeStep = 5;
	bold = false;
	italic = false;

	constructor(){

	}

	set Family(value){
		this.family = value;
		return true;
	}

	get Family(){
		return this.family;
	}

	set Color(value){
		this.color = value;
		return true;
	}

	get Color(){
		return this.color;
	}

	set Size(value){
		this.size = parseInt(value);
		return true;
	}

	get Size(){
		return this.size;
	}

	get SizeValue(){
		return this.Size + "px";
	}

	set Bold(value){
		this.bold = value == true;
		return true;
	}

	get BoldValue(){
		return this.bold ? "bold" : "";
	}

	Inc(){
		this.size += this.sizeStep;
		return true;
	}

	Dec(){
		this.size -= this.sizeStep;

		if (this.size < 1){
			this.size = 1;
			return false;
		}

		return true;
	}

	IsBold(){
		return this.bold;
	}

	ToggleBold(){
		this.bold = !this.bold;
		return this.bold;
	}

	set Italic(value){
		this.italic = value == true;
		return true;
	}

	get ItalicValue(){
		return this.italic ? "italic" : "";
	}

	get IsItalic(){
		return this.italic;
	}

	ToggleItalic(){
		this.italic = !this.italic;
		return this.italic;
	}

	get CssFont(){
		return `${this.BoldValue} ${this.ItalicValue} ${this.SizeValue} ${this.Family}`;
	}

	get CssFill(){
		return this.Color;
	}

	set Style(style){
		this.family = style.family;
		this.color = style.color;
		this.size = style.size;
		this.bold = style.bold;
		this.italic = style.italic;
		return true;
	}

	Clone(){
		let copy = new FontStyle();
		copy.family = this.family;
		copy.color = this.color;
		copy.size = this.size;
		copy.bold = this.bold;
		copy.italic = this.italic;
		return copy;
	}
}
