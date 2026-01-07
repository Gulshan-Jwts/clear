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
    float perspectiveScale = uViewportHeight / (dist*10.0);

    // Breathing & twinkle effect
    gl_PointSize = size * perspectiveScale * clamp((2.95 + 2.8 * sin(time * 2.0 + position.x * 0.02)), 2.5, 20.0);

    gl_Position = projectionMatrix * mvPosition;
}
