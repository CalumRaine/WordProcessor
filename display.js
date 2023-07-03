class Display {
	pages = [];
	pageGap = 20;
}

class DisplayPage {
	lines = [];
	lineGap = 5;
	bodyWidth = 500;
	vMargin = 50;
	hMargin = 50;
	absoluteY = 0;
	absoluteX = 0;
	spareLines = [];
	spareWords = [];

	constructor(x, y, contentLines){
		this.absoluteX = x;
		this.absoluteY = y;
		for (let l in contentLines){
			let contentLine = contentLines[l];
			// You are going to need to change this to account for absoluteX and absolute Y
			if !(this.wrapLines(contentLine, contentLine.words)){
				this.spareLines = contentLines.slice(l, contentLines.length);
				return false;
			}
		}

		return true;
	}

	wrapLines(contentLine, contentWords){
		let line = new DisplayLine(this.x, this.y, contentLine, contentWords, this.bodyWidth);
		this.y += contentLine.Height;
		this.y += this.lineGap;
		this.lines.push(line);
		this.spareWords = line.spareWords;
		return line.Complete ? true : (this.y >= this.bodyHeight ? false : this.processLine(contentLine, line.spareWords));
	}

	render(screenX, screenY){
		for (let line of this.lines){
			screenY += line.render(screenX, screenY);
			screenY += this.lineGap;
		}
		return screenY + this.vMargin;
	}
}

class DisplayLine {
	contentLine = null;
	absoluteX = 0;
	absoluteY = 0;
	words = [];
	spareWords = [];

	constructor(x, y, contentLine, contentWords, maxLength){
		this.absoluteX = x;
		this.absoluteY = y;
		this.contentLine = contentLine;

		if (contentWords.length == 0){
			return;
		}

		let cutoff = 0;
		for (let totalWidth = contentWords[0].Width; totalWidth < maxLength && cutoff < contentWords.length; ++cutoff, totalWidth += contentWords[cutoff].Width);
		this.spareWords = contentWords.slice(cutoff, contentWords.length);

		contentWords = contentWords.slice(0, cutoff);
		for (let contentWord of contentWords){
			let word = new DisplayWord(x, y, contentWord);
			this.words.push(word);
			x += contentWord.Width;
		}
	}

	get Complete(){
		return this.spareWords.length == 0;
	}

	render(screenX, screenY){
		for (let word of this.words){
			screenX += word.render(screenX, screenY);
		}
		return screenY + this.Height;
	}
}

class DisplayWord {
	contentWord = null;
	characters = [];
	absoluteX = 0;
	absoluteY = 0;

	constructor(x, y, contentWord){
		this.absoluteX = x;
		this.absoluteY = y;
		this.contentWord = contentWord;

		for (let contentCharacter of contentWord.characters){
			let character = new DisplayCharacter(x, y, contentCharacter);
			this.characters.push(character);
			x += contentCharacter.Width;
		}
	}

	render(screenX, screenY){
		for (let character of this.characters){
			screenX += character.render(screenX, screenY);
		}
		return screenX;
	}
}

class DisplayCharacter {
	contentCharacter = null;
	absoluteX = 0;
	absoluteY = 0;
	
	constructor(x, y, contentCharacter){
		this.absoluteX = x;
		this.absoluteY = y;
		this.contentCharacter = contentCharacter;
	}

	render(screenX, screenY){
		globalCanvasContext.fillText(this.contentCharacter.character, screenX, screenY);
		return screenX + this.contentCharacter.Width;
	}
}
