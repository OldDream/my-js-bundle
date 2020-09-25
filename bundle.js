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
  const deps = {}; // 用于收集依赖的 hashMap
  const ImportDeclaration = ({ node }) => {
    // 在 AST 中处理 import 声明所需方法
    const dirname = path.dirname(filePath);
    const abspath = './' + path.join(dirname, node.source.value); // 获取相对bundle所在位置的路径
    deps[node.source.value] = abspath;
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
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          tempArr.push(getModuleInfo(deps[key])); // 不断延长 tempArr ,每个元素的deps，都会被压进 tempArr
        }
      }
  }

  // 整理依赖格式
  const depsMap = {};
  tempArr.forEach((moduleInfo) => {
    depsMap[moduleInfo.filePath] = {
      // filePath 相对打包程序所在的路径
      deps: moduleInfo.deps, // 它所依赖的
      code: moduleInfo.code, // 它的代码
    };
  });
  console.log(depsMap)
  return depsMap
};

// 创建打包后文件
const bundle = (filePath) => {
  const depsMap = JSON.stringify(parseModules(filePath));
  return `
  (function (depsMap) {
    function require(filePath) {
      function absRequire(realtivePath) {
        // import中使用的相对文件的路径，转换为相对打包程序所在的路径
        return require(depsMap[filePath].deps[realtivePath]);
      }
      var exports = {}; // babel 转换过的 export 会往这上面加属性
      (function (code, require, exports) {
        eval(code); // 执行模块中code部分的代码，参考上面 depsMap
      })(depsMap[filePath].code, absRequire, exports);
      return exports;
    }
    require('${filePath}');
  })(${depsMap});
  `;
};

const content = bundle('./demo/index.js');
fs.mkdirSync('./dist');
fs.writeFileSync('./dist/index.js', content);

