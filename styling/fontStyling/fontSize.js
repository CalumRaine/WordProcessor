class FontSize extends HTMLInputElement {
	size = 12;
	stepSize = 5;

	constructor(size){
		super();
		this.size = parseInt(size);
		this.value = this.size;
		this.type = "number";
		this.min = 1;
		this.step = 1;
		this.onchange = () => this.change();
	}

	set Size(value){
		this.size = parseInt(value);
		return true;
	}

	get Size(){
		return this.size;
	}

	Inc(){
		this.size += this.stepSize;
		this.change();
		return true;
	}

	Dec(){
		this.size -= this.stepSize;
		this.change();
		return true;
	}

	change(){
		this.size = parseInt(this.value);
		let e = new CustomEvent("FontSize", { detail: this.size, bubbles: true });
		this.dispatchEvent(e);
		return true;
	}
}

customElements.define("font-size", FontSize, { extends: "input" });
