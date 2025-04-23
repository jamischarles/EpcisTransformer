declare module 'saxon-js' {
  export interface TransformOptions {
    stylesheetText?: string;
    stylesheetLocation?: string;
    sourceText?: string;
    sourceNode?: Node;
    sourceLocation?: string;
    destination?: string;
    stylesheetParams?: Record<string, any>;
    [key: string]: any;
  }

  export default {
    transform: (options: TransformOptions) => string | any
  };
}