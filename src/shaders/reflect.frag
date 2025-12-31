uniform samplerCube envMap;
varying vec3 vReflect;

void main() {
    float reflectivity = 0.9;
    vec3 baseColor = vec3(0.535,0.549,0.912);
    vec3 reflection = textureCube(envMap, normalize(vReflect)).rgb;
    vec3 finalColor = mix(baseColor, reflection, reflectivity);

    gl_FragColor = vec4(baseColor, 1.0);
}
