precision mediump float;

attribute float size;
attribute float shape;

varying vec3 vColor;
varying float vShape;
uniform float time;
uniform float uViewportHeight;

void main() {
    vColor = color;
    vShape = shape;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Distance-based perspective scaling
    float dist = length(mvPosition.xyz);
    float perspectiveScale = (uViewportHeight*400.0)  / dist;

    // Breathing & twinkle effect
    gl_PointSize = size * perspectiveScale * (0.8 + 0.5 * sin(time * 4.0 + position.x * 0.02));

    gl_Position = projectionMatrix * mvPosition;
}
