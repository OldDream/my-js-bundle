import printer from './printer.js';
const minus = (a, b) => {
  printer(`${a} - ${b}`);
  return a - b;
};

export { minus };
