declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// 如果你还使用其他样式文件，可以一并声明
declare module '*.scss' {
  const content: { [key: string]: string };
  export default content;
}
