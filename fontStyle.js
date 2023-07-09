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
