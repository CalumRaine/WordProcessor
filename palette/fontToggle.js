class FontToggle extends HTMLButtonElement {
	on = false;
	symbol = "B";
	value = "bold";

	constructor(symbol, value, on){
		super();
		this.symbol = symbol;
		this.value = value;
		this.innerHTML = this.symbol;
		this.On = on == true;
	}

	set On(value){
		this.on = value;
		this.className = this.on ? "toggle-button toggle-on" : "toggle-button";
		return this.on;
	}

	get On(){
		return this.on;
	}

	get Value(){
		return this.on ? this.value : "";
	}
}

customElements.define("font-toggle", FontToggle, { extends: "button" });

class BoldToggle extends FontToggle {
	constructor(on){
		super("B", "bold", on);
		this.onclick = () => this.Toggle();
	}

	set On(value){
		super.On = value;
		let e = new CustomEvent("BoldToggle", { detail: super.On, bubbles: true });
		this.dispatchEvent(e);
		return super.On;
	}

	Toggle(){
		this.On = !super.On;
		return super.On;
	}
}

customElements.define("bold-toggle", BoldToggle, { extends: "button" });

class ItalicToggle extends FontToggle {
	constructor(on){
		super("I", "italic", on);
		this.onclick = () => this.Toggle();
	}

	set On(value){
		super.On = value;
		let e = new CustomEvent("ItalicToggle", { detail: super.On, bubbles: true });
		this.dispatchEvent(e);
		return super.On;
	}

	Toggle(){
		this.On = !super.On;
		return super.On;
	}
}

customElements.define("italic-toggle", ItalicToggle, { extends: "button" });
