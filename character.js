class CalumCharacter {
	character = "";
	dimensions = null;

	constructor(context, character){
		this.character = character;
		this.dimensions = context.measureText(character);
	}

	get Width(){
		return this.dimensions.width;
	}

	get Ascent(){
		return this.dimensions.actualBoundingBoxAscent;
	}
}

class CalumLine {
	x = 0;
	y = 0;
	characters = [];

	constructor(characters, pen, width){
		for (let sum=0; sum < width && pen.position < characters.length; ++pen.position){
			let character = characters[pen.position];
			this.characters.push(character);
			sum += character.Width;
		}
	}

	render(context, pen){
		this.x = pen.x;
		this.y = pen.y;
		context.fillText(this.Text, this.x, this.y);
		pen.y += this.Height;
	}

	get Text(){
		return this.characters.map(character => character.character).join("");
	}

	get Height(){
		return Math.max(...this.characters.map(character => character.Ascent));
	}

	get Count(){
		return this.characters.length;
	}
}

class CalumPen {
	x = 0;
	y = 0;
	position = 0;

	constructor(position, x, y){
		this.x = x;
		this.y = y;
		this.position = position;
	}
}
