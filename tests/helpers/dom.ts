/** Queries in behavior tests require the requested control to exist. */
export function element<T extends HTMLElement=HTMLElement>(selector:string,root:ParentNode=document):T{const result=root.querySelector<T>(selector);if(!result)throw new Error(`缺少测试元素: ${selector}`);return result;}
export function elements<T extends HTMLElement=HTMLElement>(selector:string,root:ParentNode=document):T[]{return [...root.querySelectorAll<T>(selector)];}
