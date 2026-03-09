import { type JSX } from 'react';

export type JSXTag = keyof JSX.IntrinsicElements;
export type ElementProps<Tag extends JSXTag = 'div'> = JSX.IntrinsicElements[Tag];
