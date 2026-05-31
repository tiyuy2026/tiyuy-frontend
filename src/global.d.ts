// Declaración para importar archivos CSS como side-effect imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
