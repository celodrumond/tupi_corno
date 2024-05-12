var sceneSize = 300
let utils = new Utils({ width: sceneSize, height: sceneSize });
var gl = utils.gl;

let vertices = [];
let colors = [];

let cubeVertices = [
    [-.5, -.5, .5],
    [-.5, .5, .5],
    [-.5, .5, -.5],
    [-.5, -.5, -.5],
    [.5, -.5, .5],
    [.5, .5, .5],
    [.5, .5, -.5],
    [.5, -.5, -.5]
];

let cubeColors = [];

for (let x = -.5; x <= .5; x++) {
    for (let y = -.5; y <= .5; y++) {
        for (let z = -.5; z <= .5; z++) {
            // cubeVertices.push([x, y, z]);
            cubeColors.push([
                x + .5,
                y + .5,
                z + .5
            ]);
        }
    }
}

function makeFace(v1, v2, v3, v4) {
    // Guarda 6 coordenadas (2 Triângulos)
    let triangulos = [];

    triangulos.push(v1, v2, v3);
    triangulos.push(v1, v3, v4);

    triangulos.forEach(vertice => {
        vertices.push(...cubeVertices[vertice]);
        colors.push(...cubeColors[v1]);
    })
}

var textura = gl.createTexture();
var imagem = new Image();
imagem.onload = function () {
    textura = utils.initTexture(imagem);
}
imagem.src = 'imagem2.png'
utils.activateTexture(textura,0)

makeFace(0, 1, 2, 3);
makeFace(2, 6, 7, 3);
makeFace(3, 7, 4, 0);
makeFace(4, 5, 1, 0);
makeFace(5, 6, 2, 1);
makeFace(6, 5, 4, 7);

let theta = [0, 0, 0]

let transform_x = 0, transform_y = 0, transform_z = 0, transform_vel = 0, escala = 1, aux_escala = 0, translacaoX = 0, aux_translacaoX = 0, translacaoY = 0, aux_translacaoY = 0, translacaoZ = 0, aux_translacaoZ = 0;

let speed = 100;

var textureCoordinates = [
    // Front face
    0.0, 0.0, 0.0, 1/2, 1/3, 1/2,
    0.0, 0.0, 1/3, 1/2, 1/3, 0.0,
    // Você precisa repetir para as outras faces
    1/3, 0.0, 1/3, 1/2, 2/3, 1/2,
    1/3, 0.0, 2/3, 1/2, 2/3, 0.0,
    //
    2/3, 0.0, 2/3, 1/2, 1.0, 1/2,
    2/3, 0.0, 1.0, 1/2, 1.0, 0.0,
    //
    0.0, 1/2, 0.0, 1.0, 1/3, 1.0,
    0.0, 1/2, 1/3, 1.0, 1/3, 1/2,
    //
    1/3, 1/2, 1/3, 1.0, 2/3, 1.0,
    1/3, 1/2, 2/3, 1.0, 2/3, 1/2,
    //
    2/3, 1/2, 2/3, 1.0, 1.0, 1.0,
    2/3, 1/2, 1.0, 1.0, 1.0, 1/2,
    ];

utils.initShader( { vertexShader: `#version 300 es
precision mediump float;
in vec2 textCoords;
out vec2 textureCoords;
in vec3 aPosition;
in vec3 aColor;
out vec4 vColor;
uniform vec3 theta;
uniform mat4 uViewMatrix; // Matriz da câmera
uniform mat4 uProjectionMatrix; // Matriz de projeção
uniform float ne;
uniform float Tx;
uniform float Ty;
uniform float Tz;


void main(){
vec3 angles = radians(theta);
vec3 c = cos(angles);
vec3 s = sin(angles);

mat4 rx = mat4( 1.0, 0.0, 0.0, 0.0,
                0.0, c.x, -s.x, 0.0,
                0.0, s.x, c.x,  0.0,
                Tx, 0.0, 0.0, 1.0);

mat4 ry = mat4( c.y, 0.0, s.y, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -s.y, 0.0, c.y, 0.0,
                0.0, Ty, 0.0, 1.0);

mat4 rz = mat4( c.z, -s.z, 0.0, 0.0,
                s.z, c.z, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, Tz, 1.0);

mat4 escala = mat4( ne, 0.0, 0.0, 0.0,
                    0.0, ne, 0.0, 0.0,
                    0.0, 0.0, ne, 0.0,
                    0.0, 0.0, 0.0, 1.0);

gl_Position = uProjectionMatrix * uViewMatrix * escala * rz * ry * rx *
vec4(aPosition, 1.0);
vColor = vec4(aColor, 1.0);
textureCoords = textCoords;
}
`,
fragmentShader: `#version 300 es
precision mediump float;
in vec2 textureCoords;
uniform sampler2D uSampler;
out vec4 fColor;
void main(){
fColor = texture(uSampler, textureCoords);
}`});

utils.initBuffer({ vertices });

utils.linkBuffer({ variable: "aPosition", reading: 3 });
utils.initBuffer({ vertices: textureCoordinates });

utils.linkBuffer({ reading: 2, variable: "textCoords" });


var projectionPerspectiveMatrix = mat4.create();
var projectionOrthoMatrix = mat4.create();

//Camera Ortogonal
var size = 1;
var centerX = 0;
var centerY = 0;
mat4.ortho(projectionOrthoMatrix, centerX - size, centerX + size, centerY - size, centerY + size, 0.1, 100);


//Camera Perspectiva
var thetaView = Math.PI / 4;
var aspectRatio = 1;
mat4.perspective(projectionPerspectiveMatrix, thetaView, aspectRatio, 0.1, 100);



utils.linkUniformMatrix({
    shaderName: "uProjectionMatrix",
    value: projectionPerspectiveMatrix,
    kind: "4fv"
});


var view2 = mat4.create();
mat4.lookAt(view2, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

var aux1 = true;
var aux2 = true;
var aux3 = true;

document.getElementById('RotationX').addEventListener("click", () => {
    if (aux1 == true) {
        transform_x = -100;
        aux1 = false;
    } else { transform_x = 100; aux1 = true }
})
document.getElementById('RotationStartX').addEventListener("click", () => { transform_x = 1; })
document.getElementById('RotationStopX').addEventListener("click", () => { transform_x = 0; })

document.getElementById('RotationX').addEventListener("click", () => {
    if (aux2 == true) {
        transform_x = -1;
        aux2 = false;
    } else { transform_x = 1; aux2 = true }
})
document.getElementById('RotationStartY').addEventListener("click", () => { transform_y = 1; })
document.getElementById('RotationStopY').addEventListener("click", () => { transform_y = 0; })

document.getElementById('RotationX').addEventListener("click", () => {
    if (aux3 == true) {
        transform_x = -1;
        aux3 = false;
    } else { transform_x = 1; aux3 = true }
})
document.getElementById('RotationStartZ').addEventListener("click", () => { transform_z = 1; })
document.getElementById('RotationStopZ').addEventListener("click", () => { transform_z = 0; })

document.getElementById('slider').addEventListener("click", () => { transform_vel = slider.value; })

document.getElementById('ScaleDirection').addEventListener("click", () => {aux_escala = -0.001})
document.getElementById('ScaleStart').addEventListener("click", () => { aux_escala = 0.001; })
document.getElementById('ScaleStop').addEventListener("click", () => { aux_escala = 0; })

document.getElementById('TranslationX').addEventListener("click", () => {aux_translacaoX = -0.01})
document.getElementById('TranslationStartX').addEventListener("click", () => { aux_translacaoX = 0.01; })
document.getElementById('TranslationStopX').addEventListener("click", () => { aux_translacaoX = 0; })

document.getElementById('TranslationY').addEventListener("click", () => {aux_translacaoY = -0.01})
document.getElementById('TranslationStartY').addEventListener("click", () => { aux_translacaoY = 0.01; })
document.getElementById('TranslationStopY').addEventListener("click", () => { aux_translacaoY = 0; })

document.getElementById('TranslationZ').addEventListener("click", () => {aux_translacaoZ = -0.01})
document.getElementById('TranslationStartZ').addEventListener("click", () => { aux_translacaoZ = 0.01; })
document.getElementById('TranslationStopZ').addEventListener("click", () => { aux_translacaoZ = 0; })



function render() {

    theta[0] += transform_x;
    theta[1] += transform_y;
    theta[2] += transform_z;
    escala += aux_escala;
    translacaoX += aux_translacaoX;
    translacaoY += aux_translacaoY;
    translacaoZ += aux_translacaoZ;

    utils.activateTexture(textura,0);
    utils.linkUniformVariable({shaderName: "uSampler", value: 0, kind:"1i"});
    utils.linkUniformVariable({ shaderName: "theta", value: theta, kind: "3fv" });
    utils.linkUniformVariable({ shaderName: "ne", value: escala, kind: "1f" });
    utils.linkUniformVariable({ shaderName: "Tx", value: translacaoX , kind: "1f" });
    utils.linkUniformVariable({ shaderName: "Ty", value: translacaoY , kind: "1f" });
    utils.linkUniformVariable({ shaderName: "Tz", value: translacaoZ , kind: "1f" });
    utils.linkUniformMatrix({ shaderName: "uViewMatrix", value: view2, kind: "4fv" });
    utils.drawScene({ method: "TRIANGLES", viewport: { x: 0, y: 0, width: sceneSize, height: sceneSize } });

    window.setTimeout(render, transform_vel);
}

render();