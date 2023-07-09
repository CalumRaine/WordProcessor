class FontSelector extends HTMLSelectElement {
	family = "Arial";

	options = [new FontOption("Arial"), 
		   new FontOption("Brush Script MT"),
		   new FontOption("Courier New"),
		   new FontOption("Garamond"),
		   new FontOption("Georgia"),
		   new FontOption("Tahoma"),
		   new FontOption("Times New Roman"),
		   new FontOption("Trebuchet"),
		   new FontOption("Verdana")]

	constructor(){
		super();
		this.options.forEach(o => this.appendChild(o));
		this.onchange = () => this.change();
	}

	change(){
		let selected = this.options.find(o => o.selected);
		this.family = selected.value;
		let e = new CustomEvent("FontSelector", { detail: this.family, bubbles: true });
		this.dispatchEvent(e);
		return true;
	}

	get Family(){
		return this.family;
	}
}

customElements.define("font-selector", FontSelector, { extends: "select" });

class FontOption extends HTMLOptionElement {
	family = "Arial";

	constructor(family){
		super();
		this.family = family;
		this.innerHTML = this.family;
		this.value = this.family;
		this.style = `font-family: '${this.family}'`;
	}
}

customElements.define("font-option", FontOption, { extends: "option" });

