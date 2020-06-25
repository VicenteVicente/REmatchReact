// Importación de REmatch
const Module = require('./rematch_wasm.js');

Module.onRuntimeInitialized = () => {
    // Unpack de clases
    const {RegEx, RegExOptions} = Module;

    let match;
    let rgxOptions = new RegExOptions();
    rgxOptions.early_output = true;
    let rgx = new RegEx('.*!x{a}.*', rgxOptions);
    
    while(match = rgx.findIter('aaaa', 0)) {
        console.log(match.span('x'));
    }
}