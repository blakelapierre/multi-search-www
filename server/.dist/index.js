(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./webServer", "./search"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const webServer_1 = require("./webServer");
    const search_1 = require("./search");
    const ws = require('ws');
    const port = process.argv[2] || 8181, webPort = process.argv[3] || 8182;
    const server = new ws.Server({ port });
    webServer_1.default('../.dev', webPort);
    server.on('connection', socket => {
        console.log('connected');
        socket.on('message', query => {
            search_1.default(query, ({ name, results, start, end }) => socket.send(JSON.stringify({ query, name, results, start, end })))
                .catch(error => socket.send(JSON.stringify(['error', query, JSON.stringify(error.toString())])));
        });
    });
    console.log('ws listening on', port);
    console.log('http listening on', webPort);
    // search('test', partialResults)
    //   .then(use(({urls}) => {
    //     const list = Object.keys(urls).map(url => [url, urls[url]]);
    //     list.sort(([_, a], [__, b]) => b.length - a.length);
    //     console.log(list);
    //   }))
    //   .then(use(printResults))
    //   .catch(error => console.log('error', error));
    function partialResults({ name, results }) {
        const resultsToPrint = 2;
        console.log(`${name} (${results.length} total results [showing first ${resultsToPrint}]):\n`);
        if (results)
            console.log(`  ${results.slice(0, resultsToPrint).map(result => `${result.titles[0]} (${result.url})\n    ${result.snippet}`).join('\n\n  ')}\n`);
    }
    function printResults({ urls, results }) {
        console.log(urls);
    }
    function use(fn) {
        return arg => {
            fn(arg);
            return arg;
        };
    }
});

//# sourceMappingURL=index.js.map