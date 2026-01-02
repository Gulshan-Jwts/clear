precision mediump float;

varying vec3 vColor;
varying float vShape;
uniform float time;

void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    float alpha = 1.0;

    // --- Shapes ---
    if (vShape < 0.5) {
        // Diamond shape
        float diamondDist = abs(center.x) + abs(center.y);
        alpha = 1.0 - smoothstep(0.25, 0.5, diamondDist);
        alpha += 0.2 * (1.0 - smoothstep(0.0, 0.8, dist)); // subtle glow
        float pulse = 0.6 + 0.4 * sin(time * 12.0 + dist * 10.0);
        float glow = (1.0 - smoothstep(0.0, 0.8, dist)) * pulse;
        alpha += glow * 0.35;
    } else if (vShape < 1.5) {
        // Plus shape
        float plusX = smoothstep(0.1, 0.0, abs(center.x));
        float plusY = smoothstep(0.4, 0.35, abs(center.y));
        float plusY2 = smoothstep(0.1, 0.0, abs(center.y));
        float plusX2 = smoothstep(0.4, 0.35, abs(center.x));
        alpha = max(plusX * plusY, plusY2 * plusX2);
        alpha += 0.15 * (1.0 - smoothstep(0.0, 0.8, dist)); // subtle glow
        float pulse = 0.6 + 0.4 * sin(time * 12.0 + dist * 10.0);
        float glow = (1.0 - smoothstep(0.0, 0.8, dist)) * pulse;
        alpha += glow * 0.35;
    } else {
        // Bead / circle shape
        float circleMask = step(dist, 0.5); // circle shape mask

        // Pulsing wave, clamped inside circle
        float wave = 0.4 * sin(time * 4.0 + dist * 15.0);  
        wave = max(wave, 0.0);        // prevent negative alpha outside
        wave *= circleMask;           // apply circle mask

        alpha =  wave;
    }

    // Clamp alpha so it never exceeds 1
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(vColor, alpha);
}
