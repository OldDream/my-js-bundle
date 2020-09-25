
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
    require('./demo/index.js');
  })({"./demo/index.js":{"deps":{"./components/add.js":"./demo/components/add.js","./components/minus.js":"./demo/components/minus.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./components/add.js\"));\n\nvar _minus = require(\"./components/minus.js\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nvar sum = (0, _add[\"default\"])(1, 2);\nvar delta = (0, _minus.minus)(1, 2);\nconsole.log(sum);\nconsole.log(delta);"},"./demo/components/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar add = function add(a, b) {\n  return a + b;\n};\n\nvar _default = add;\nexports[\"default\"] = _default;"},"./demo/components/minus.js":{"deps":{"./printer.js":"./demo/components/printer.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.minus = void 0;\n\nvar _printer = _interopRequireDefault(require(\"./printer.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nvar minus = function minus(a, b) {\n  (0, _printer[\"default\"])(\"\".concat(a, \" - \").concat(b));\n  return a - b;\n};\n\nexports.minus = minus;"},"./demo/components/printer.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar printer = function printer(val) {\n  console.log(val);\n};\n\nvar _default = printer;\nexports[\"default\"] = _default;"}});
  