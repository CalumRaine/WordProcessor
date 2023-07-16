class StylePalette extends HTMLDivElement {
	family = new FontSelector("Trebuchet");
	color = new FontColor("black");
	size = new FontSize(12);
	bold = new BoldToggle(false);
	italic = new ItalicToggle(false);
	
	constructor(){
		super();
		this.appendChild(this.family);
		this.appendChild(this.color);
		this.appendChild(this.size);
		this.appendChild(this.bold);
		this.appendChild(this.italic);
	}
}

customElements.define("style-palette", StylePalette, { extends: "div" });
