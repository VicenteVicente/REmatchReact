importScripts('./spanners_interface.js');
console.log("hi from worker");
let i;
let currResult;
let currSpan;
let schema = [];
let arr = [];
let tempArr = [];

Module['onRuntimeInitialized'] = () => {
    let instance = new Module.WasmInterface("aaaaaa", ".*!x{a}!y{a}.*");
    instance.init();
    let tempSchema = instance.getOutputSchema();
    for (i = 0; i < tempSchema.size(); i++) {
        schema.push(tempSchema.get(i));
    }
    while (instance.hasNext()) {
        currResult = instance.next();
        tempArr = [];
        for (i = 0; i < schema.length; i++) {
            currSpan = currResult.get(i);
            tempArr.push({s: currSpan[0], e: currSpan[1]});
        }
        arr.push(tempArr);
    }
    instance.delete(); // Necessary?
    postMessage({
        schema: schema,
        results: arr,
    });
}