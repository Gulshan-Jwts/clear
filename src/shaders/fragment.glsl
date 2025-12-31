precision mediump float;

varying vec3 vColor;
varying float vShape;

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
    } else if (vShape < 1.5) {
        // Plus shape
        float plusX = smoothstep(0.1, 0.0, abs(center.x));
        float plusY = smoothstep(0.4, 0.35, abs(center.y));
        float plusY2 = smoothstep(0.1, 0.0, abs(center.y));
        float plusX2 = smoothstep(0.4, 0.35, abs(center.x));
        alpha = max(plusX * plusY, plusY2 * plusX2);
        alpha += 0.15 * (1.0 - smoothstep(0.0, 0.8, dist)); // subtle glow
    } else {
        // Bead / circle shape
        alpha = 1.0 - smoothstep(0.2, 0.5, dist);
        alpha += 0.25 * (1.0 - smoothstep(0.0, 0.8, dist)); // glow
    }

    // Extra soft glow for all shapes
    float glow = 1.0 - smoothstep(0.0, 0.8, dist);
    alpha += glow * 0.2;

    // Clamp alpha so it never exceeds 1
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(vColor, alpha);
}
