class FontColor extends HTMLInputElement {
	color = "black";

	constructor(color){
		super();
		this.type = "color";
		this.color = color;
		this.value = this.color;
		this.onchange = () => this.change();
	}

	change(){
		this.color = this.value;
		let e = new CustomEvent("FontColor", { detail: this.color, bubbles: true });
		this.dispatchEvent(e);
		return true;
	}

	get Color(){
		return this.color;
	}
}

customElements.define("font-color", FontColor, { extends: "input" });
