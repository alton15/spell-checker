/** Small helper for building DOM nodes without innerHTML. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? '' : value);
  });
  children.forEach(child => node.append(child));
  return node;
}

export const setText = (node, text) => {
  if (node.textContent !== text) node.textContent = text;
};

export const setAttr = (node, name, value) => {
  if (node.getAttribute(name) !== value) node.setAttribute(name, value);
};
