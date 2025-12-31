varying vec3 vReflect;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);

  vReflect = reflect(cameraToVertex, worldNormal);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
