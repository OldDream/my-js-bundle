const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

/**
 *  获取模块数据
 * @param {*} filePath
 */
const getModuleInfo = (filePath) => {
  const body = fs.readFileSync(filePath, 'utf-8'); // 读取文件

  // 转换为AST
  const ast = parser.parse(body, {
    sourceType: 'module',
  });

  // 遍历AST
  const deps = new Map(); // 用于收集依赖的 hashMap
  const ImportDeclaration = ({ node }) => {
    // 在 AST 中处理 import 声明所需方法
    const dirname = path.dirname(filePath);
    const abspath = './' + path.join(dirname, node.source.value); // 获取相对bundle所在位置的路径
    deps.set(node.source.value, abspath);
  };
  traverse(ast, { ImportDeclaration }); // 启动遍历

  // es6 转 es5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  });

  return { filePath, deps, code }; // 该模块的路径（file），该模块的依赖（deps），该模块转化成es5的代码
};

const parseModules = (filePath) => {
  const tempArr = [getModuleInfo(filePath)]; // 遍历依赖用的数组

  for (let index = 0; index < tempArr.length; index++) {
    const deps = tempArr[index].deps;
    if (deps.size > 0) {
      deps.forEach((value) => {
        tempArr.push(getModuleInfo(value)); // 不断延长 tempArr ,每个元素的deps，都会被压进 tempArr
      });
    }
  }

  const depsMap = {};
  tempArr.forEach((moduleInfo) => {
    depsMap[moduleInfo.filePath] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code,
    };
  });

  console.log(depsMap)
  return depsMap
};

parseModules('./demo/index.js');