let utils = new Utils({ width: 400, height: 400 });

let vertices = [];
let colors = [];

let squareVertices = [
    [-.4, -.3],     // 0
    [-.4, .5],      // 1
    [.4, -.3],      // 2
    [.4, .5],       // 3
    [-.2, -.3],     // 4
    [.2, -.3],      // 5
    [0.0, .4],      // 6
];

let drawColors = {
    azul: [0, 0, 1],
    amarelo: [1, 0.87109375, 0],
    verde: [0, 0.609, 0.230],
    vermelho: [1, 0, 0],
    branco: [1, 1, 1],
    preto: [0, 0, 0]
};

let transform_x = 0, transform_y = 0, transform_z = 0, transform_vel = 0, escala = 1, aux_escala = 0, translacaoX = 0, aux_translacaoX = 0, translacaoY = 0, aux_translacaoY = 0, translacaoZ = 0, aux_translacaoZ = 0;


utils.initShader({
    vertexShader: `#version 300 es
                        precision mediump float;

                        in vec2 aPosition;
                        uniform float ne;
                        in vec3 aColor;
                        out vec4 vColor;
                        uniform float nt;

                        uniform float resize;
                        uniform vec3 theta;
                        uniform mat4 uViewMatrix;
                        uniform mat4 uProjectionMatrix;

                        void main(){

                            vec3 angles = radians(theta);
                            vec3 c = cos(angles);
                            vec3 s = sin(angles);

                            mat4 rx = mat4( 1.0, 0.0, 0.0, 0.0,
                                            0.0, c.x, -s.x, 0.0,
                                            0.0, s.x, c.x,  0.0,
                                            nt, 0.0, 0.0, 1.0);

                            mat4 ry = mat4( c.y, 0.0, s.y, 0.0,
                                            0.0, 1.0, 0.0, 0.0,
                                            -s.y, 0.0, c.y, 0.0,
                                            0.0, nt, 0.0, 1.0);

                            mat4 rz = mat4( c.z, -s.z, 0.0, 0.0,
                                            s.z, c.z, 0.0, 0.0,
                                            0.0, 0.0, 1.0, 0.0,
                                            0.0, 0.0, 0.0, 1.0);

                            mat4 escala = mat4( ne, 0.0, 0.0, 0.0,
                                                0.0, ne, 0.0, 0.0,
                                                0.0, 0.0, ne, 0.0,
                                                0.0, 0.0, 0.0, 1.0);

                            gl_PointSize = 10.0;
                            gl_Position = escala * rx * ry * rz *  vec4(aPosition.x , aPosition.y, .5, 1.0);
                            vColor = vec4(aColor, 1.0);
                        }`,

    fragmentShader: `#version 300 es
                        precision highp float;
                        
                        in vec4 vColor;
                        out vec4 fColor;
                        
                        void main(){
                            fColor=vColor;
                        }`
});

let rotate_x = 0, rotate_y = 0, rotate_z = 0;
let speed = 50;
var aux1 = true;
var aux2 = true;
var aux3 = true;
var theta = [0, 0, 0];


function drawShape(vertices_info, cor, { shape = "square", theta = [0, 0, 0], resize = 1, method = "TRIANGLES", clear = true }) {

    switch (shape) {
        case "square":
            makeSquare(...vertices_info, cor);
            break;
        case "circle":
            makeCircleVertices(...vertices_info, cor)
            break;
        case "triangle":
            makeTriangle(...vertices_info, cor)
            break;
    }


    utils.initBuffer({ vertices });
    utils.linkBuffer({ variable: "aPosition", reading: 2 });

    utils.initBuffer({ vertices: colors });
    utils.linkBuffer({ variable: "aColor", reading: 3 });

    utils.linkUniformVariable({ shaderName: "resize", value: resize, kind: "1f" })

    utils.drawElements({ method: method, clear })
}

function makeSquare(v1, v2, v3, v4, cor) {
    clearVerticesAndColors()

    let triangulos = [];

    triangulos.push(v1, v2, v3);
    triangulos.push(v1, v3, v4);

    triangulos.forEach(vertice => {
        vertices.push(...squareVertices[vertice]);
        colors.push(...drawColors[cor]);
    })
}

function makeCircleVertices(centerX, centerY, radius, numVertices, color) {

    clearVerticesAndColors()

    for (var i = 0; i < numVertices; i++) {
        let angle = 2 * Math.PI * i / numVertices;

        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);

        vertices.push(x);
        vertices.push(y);

        colors.push(...drawColors[color]);
    }
}

function makeTriangle(v1, v2, v3, cor) {
    clearVerticesAndColors()

    let triangulos = [];

    triangulos.push(v1, v2, v3);

    triangulos.forEach(vertice => {
        vertices.push(...squareVertices[vertice]);
        colors.push(...drawColors[cor]);
    })
}

function clearVerticesAndColors() {
    vertices = []
    colors = []
}


document.getElementById('Rotation').addEventListener("click", () => {
    if (aux1 == true) {
        rotate_z = -1;
        aux1 = false;
    } else { rotate_z = 1; aux1 = true }
})
document.getElementById('RotationStart').addEventListener("click", () => { rotate_z = 1; })
document.getElementById('RotationStop').addEventListener("click", () => { rotate_z = 0 ; })

document.getElementById('ScaleDirection').addEventListener("click", () => {aux_escala = -0.001})
document.getElementById('ScaleStart').addEventListener("click", () => { aux_escala = 0.001; })
document.getElementById('ScaleStop').addEventListener("click", () => { aux_escala = 0; })

document.getElementById('Translation').addEventListener("click", () => {aux_translacaoX = -0.01})
document.getElementById('TranslationStart').addEventListener("click", () => { aux_translacaoX = 0.01; })
document.getElementById('TranslationStop').addEventListener("click", () => { aux_translacaoX = 0; })

document.getElementById('slider').addEventListener("click", () => { transform_vel = slider.value; })


function render() {

    theta[2] += rotate_z;
    rotate_y += rotate_y;
    escala = escala + aux_escala;
    translacaoX = translacaoX + aux_translacaoX;

    drawShape(
        [4, 5, 6],
        "verde",
        {
            shape: "triangle",
            clear: false
        }
    )

    drawShape(
        [0, 1, 3, 2],
        "amarelo",
        {
            clear: false
        }
    )

    drawShape(
        [0, -0.3, .401, 50],
        "amarelo",
        {
            shape: "circle",
            method: "TRIANGLE_FAN",
            clear: false
        }
    )

    drawShape(
        [0, 0, 1, 50],
        "azul",
        {
            shape: "circle",
            method: "TRIANGLE_FAN",
            clear: false
        }
    )
    utils.linkUniformVariable({ shaderName: "ne", value: escala, kind: "1f" });
    utils.linkUniformVariable({ shaderName: "nt", value: translacaoX, kind: "1f" });
    utils.linkUniformVariable({ shaderName: "theta", value: theta, kind: "3fv" })
    window.setTimeout(() => render(), 500 - transform_vel)
}

render()