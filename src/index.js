const vm = require("vm");

const context = require("./context");
const wrap = require("./wrapper");
const utils = require("./utils");

const getCompiledCodeStr = require("./lib/getCompiledCodeStr");

const m = {
  exports: {}
};

function customRequire(
  filename,
  { runInThisContext = false } = { runInThisContext: false }
) {
  return getCompiledCodeStr(filename, customRequireHelper);

  function customRequireHelper(fileMeta) {
    const wrapper = wrap(fileMeta.code);

    const script = new vm.Script(wrapper, {
      filename: fileMeta.filename,
      displayErrors: true
    });

    const compiledWrapper = runInThisContext
      ? script.runInThisContext()
      : script.runInNewContext(context);

    compiledWrapper.call(m.exports, m.exports, customRequire, m);

    return Object.prototype.hasOwnProperty.call(m.exports, "default")
      ? m.exports.default
      : m.exports;
  }
}

module.exports = customRequire;
