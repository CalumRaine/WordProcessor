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
		this.onclick = () => this.Toggle();
	}

	set On(value){
		this.on = value;
		this.className = this.on ? "toggle-button toggle-on" : "toggle-button";
		let e = new CustomEvent("FontToggle", { detail: { parameter: this.value, on: this.On }, bubbles: true});
		this.dispatchEvent(e);
		return this.on;
	}

	get On(){
		return this.on;
	}

	Toggle(){
		this.On = !this.On;
		return this.On;
	}

	get Value(){
		return this.on ? this.value : "";
	}
}

customElements.define("font-toggle", FontToggle, { extends: "button" });
