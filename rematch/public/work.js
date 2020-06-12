importScripts('./spanners_interface.js');
let i;
let currResult;
let currSpan;
let schema = [];
let arr = [];
let tempArr = [];
const MESSAGESIZE = 10000;
let counter = 0;

Module['onRuntimeInitialized'] = () => {
    onmessage = (m) => {
        try {
            let instance = new Module.WasmInterface(m.data.text, `.*${m.data.query}.*`);
            instance.init();
            /* SCHEMA */
            let tempSchema = instance.getOutputSchema();
            for (i = 0; i < tempSchema.size(); i++) {
                schema.push(tempSchema.get(i));
            }
            postMessage({
                type: 'SCHEMA',
                schema: schema,
            });
            /* RESULTS */
            if (!instance.hasNext()) {
                postMessage({
                    type: 'NO_MATCHES',
                });
            }
            while (instance.hasNext()) {
                currResult = instance.next();
                tempArr = [];
                for (i = 0; i < schema.length; i++) {
                    currSpan = currResult.get(i);
                    tempArr.push({s: currSpan[0], e: currSpan[1]});
                }
                arr.push(tempArr);
                counter++;
                if (counter === MESSAGESIZE || !instance.hasNext()) {
                    postMessage({
                        type: (instance.hasNext()) ? 'SPANS' : 'LAST_SPANS',
                        spans: arr,
                    });
                    arr = [];
                    counter = 0;
                }
            }
            // instance.delete();
        } catch(err) {
            postMessage({
                type: 'ERROR',
                error: `${err} Reloading worker...`,
            });
        }
    }
}