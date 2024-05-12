class Utils {

	constructor({ width = 400,
		height = 400,
		r = 0.1,
		g = 0.2,
		b = 0.3,
		a = 0.4,
		preserveDrawingBuffer = false
	} = {}) {

		var canvas = document.getElementById('canvas');

		canvas.width = width;
		canvas.height = height;

		/*
		  Quando preserveDrawingBuffer for marcado como "true", o
		  webGL não irá limpar o Buffer de desenho automaticamente em
		  uma chamada de drawElements. Nesse caso, o método gl.clear
		  terá que ser invocado manualmente para que o buffer seja
		  limpo.
	
		  Marque como true apenas se você estiver usando múltiplos
		  viewports.
		*/
		this.gl = canvas.getContext('webgl2', { preserveDrawingBuffer: preserveDrawingBuffer });

		console.log(this.gl);

		this.gl.clearColor(r, g, b, a);

		/*
		  Precisa colocar a linha abaixo para utilizar o algoritmo de remoção de
		  superfícies oclusas. No caso, o algoritmo invocado é o z-buffer.
	
		  Se você não colocar a linha abaixo, o WebGL vai desenhar os triângulos na
		  tela na ordem em que foi especificado no programa. 
		*/
		this.gl.enable(this.gl.DEPTH_TEST);

		this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
	}

	initBuffer({ vertices = [-1, -1, 0, 1, 1, -1] } = {}) {


		var bufferId = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferId);

		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices),
			this.gl.STATIC_DRAW);

		this.vertices = vertices;

	}


	initShader(
		{ vertexShader = `#version 300 es
precision mediump float;

in vec2 aPosition;

void main(){
gl_PointSize = 10.0;
gl_Position = vec4(aPosition, 0.0, 1.0);
}`,
			fragmentShader = `#version 300 es
precision highp float;
out vec4 fColor;
void main(){
   fColor=vec4(1.0, 0.0, 0.0, 1.0);
}`} = {}) {
		var vertShdr = this.gl.createShader(this.gl.VERTEX_SHADER);
		var fragShdr = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(vertShdr, vertexShader);
		this.gl.shaderSource(fragShdr, fragmentShader);
		this.gl.compileShader(vertShdr);
		this.gl.compileShader(fragShdr);

		if (!this.gl.getShaderParameter(vertShdr, this.gl.COMPILE_STATUS)) {
			var msg = "Vertex shader failed to compile.  The error log is:"
				+ "<pre>" + this.gl.getShaderInfoLog(vertShdr) + "</pre>";
			alert(msg);
		}

		if (!this.gl.getShaderParameter(fragShdr, this.gl.COMPILE_STATUS)) {
			var msg = "Fragment shader failed to compile.  The error log is:"
				+ "<pre>" + this.gl.getShaderInfoLog(fragShdr) + "</pre>";
			alert(msg);
		}

		var program = this.gl.createProgram();
		this.gl.attachShader(program, vertShdr);
		this.gl.attachShader(program, fragShdr);
		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			var msg = "Shader program failed to link.  The error log is:"
				+ "<pre>" + this.gl.getProgramInfoLog(program) + "</pre>";
			alert(msg);
		}
		console.log(program);
		this.gl.useProgram(program);

		this.program = program;
	}

	linkBuffer({ variable = "aPosition", reading = 2 } = {}) {
		var positionLoc = this.gl.getAttribLocation(this.program, variable);
		this.gl.vertexAttribPointer(positionLoc, reading, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(positionLoc);
		this.reading = reading;
	}

	drawElements({ start = 0, end = this.vertices.length / this.reading, method = "POINTS", clear = true } = {}) {
		if (clear) {
			this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
		}
		this.gl.drawArrays(this.gl[method], start, end);
	}

	drawScene({ start = 0,
        end = this.vertices.length / this.reading,
        method = "POINTS",
        viewport = { x: 0, y: 0, start: 100, end: 100 },
    } = {}) {
        this.gl.enable(this.gl.SCISSOR_TEST);
        this.gl.scissor(viewport.x, viewport.y, viewport.width,
            viewport.height);
        this.gl.clearColor(0.1, 0.2, 0.3, 0.4)
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        this.gl.disable(this.gl.SCISSOR_TEST);
        this.gl.viewport(viewport.x, viewport.y, viewport.width,
            viewport.height);
        this.gl.drawArrays(this.gl[method], start, end);
    }

	convertCoords({
		x = 0, y = 0,
		minX = 0,
		maxX = this.gl.canvas.width,
		minY = 0,
		maxY = this.gl.canvas.height,
		flipX = 1,
		flipY = -1
	} = {}) {
		return {
			x: flipX * (2 * (x - minX) / (maxX - minX) - 1),
			y: flipY * (2 * (y - minY) / (maxY - minY) - 1)
		}
	}

	initMouseMoveEvent(callback) {
		var canvas = this.gl.canvas;
		var isDown = false;
		var downX, downY, moveX, moveY;

		canvas.addEventListener('mouseup', () => {
			isDown = false;
		});

		canvas.addEventListener('mousedown', (e) => {
			isDown = true;

			downX = e.offsetX;
			downY = e.offsetY;
		});

		canvas.addEventListener('mousemove', (e) => {
			if (isDown) {
				moveX = e.offsetX;
				moveY = e.offsetY;

				callback(downX, downY, moveX, moveY);
			}
		});
	}

	linkUniformVariable({ shaderName = "redColor", value = 1, kind = "1f" } = {}) {
		var colorLoc = this.gl.getUniformLocation(this.program, shaderName);
		this.gl[`uniform${kind}`](colorLoc, value);
	}

	linkUniformMatrix({ shaderName = "redColor", value = 1, kind = "4fv" } = {}) {
		var colorLoc = this.gl.getUniformLocation(this.program, shaderName);
		this.gl[`uniformMatrix${kind}`](colorLoc, false, value);
	}

	initTexture({ image = new Image(), textureType = 'TEXTURE_2D', wrapS = 'MIRRORED_REPEAT', wrapT = 'MIRRORED_REPEAT', minFilter = 'LINEAR', magFilter = 'LINEAR' } = {}) {
		var texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl[textureType], texture);
		this.gl.texImage2D(this.gl[textureType], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

		this.gl.texParameteri(this.gl[textureType], this.gl.TEXTURE_WRAP_S, this.gl[wrapS]);
		this.gl.texParameteri(this.gl[textureType], this.gl.TEXTURE_WRAP_T, this.gl[wrapT]);


		this.gl.texParameteri(this.gl[textureType], this.gl.TEXTURE_MIN_FILTER, this.gl[minFilter]);
		this.gl.texParameteri(this.gl[textureType], this.gl.TEXTURE_MAG_FILTER, this.gl[magFilter]);

		return texture;
	}


	activateTexture(texture, position) {
		this.gl.activeTexture(this.gl.TEXTURE0 + position);
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

	}

}

