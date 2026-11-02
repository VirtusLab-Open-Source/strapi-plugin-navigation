export type Effect<T> = (value: T) => void;
export type VoidEffect = Effect<void>;
export type ToBeFixed = any;

export type FormChangeEvent = React.ChangeEvent<any> | string;
export type FormItemErrorSchema<T> = Record<keyof T, string>;
