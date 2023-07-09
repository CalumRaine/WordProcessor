class FontStyle {
	size = 12;
	family = "sans-serif";
	
	variant = "";	// italic
	weight = "";	// bold, bolder, lighter
	stretch = "";	// condensed, expanded, ultra-expanded

	underline = ""; // not yet implemented

	color = "black";
	
	constructor(){

	}

	get Font(){
		return `${this.variant} ${this.weight} ${this.size}px ${this.family} ${this.stretch}`;
	}

	get Fill(){
		return this.color;
	}

	get IsBold(){
		return this.weight == "bold";
	}

	get IsItalic(){
		return this.variant == "italic";
	}

	get Size(){
		return this.size;
	}

	set Family(value){
		this.family = value;
		return true;
	}

	get Family(){
		return this.family;
	}

	ToggleBold(){
		this.weight = this.weight == "bold" ? "" : "bold";
		return true;
	}

	ToggleItalic(){
		this.variant = this.variant == "italic" ? "" : "italic";
		return true;
	}

	Inc(value){
		this.size += 5;
		return true;
	}

	Dec(value){
		this.size -= 5;
		return true;
	}

	set Style(style){
		this.size = style.size;
		this.family = style.family;
		this.variant = style.variant;
		this.weight = style.weight;
		this.underline = style.underline;
		this.stretch = style.stretch;
		this.color = style.color;
		return true;
	}

	Clone(){
		let copy = new FontStyle();
		copy.size = this.size;
		copy.family = this.family;
		copy.variant = this.variant;
		copy.weight = this.weight;
		copy.underline = this.underline;
		copy.stretch = this.stretch;
		copy.color = this.color;
		return copy;
	}
}
