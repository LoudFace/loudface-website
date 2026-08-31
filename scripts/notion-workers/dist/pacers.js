"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peecApi = exports.gscApi = exports.sanityApi = void 0;
const databases_js_1 = require("./databases.js");
// Sanity: paid tier allows ~100 req/s. We do 1 request per sync. Generous budget.
exports.sanityApi = databases_js_1.worker.pacer("sanityApi", {
    allowedRequests: 10,
    intervalMs: 1000,
});
// GSC: 1,200 queries/minute per project. Budget for paginated requests.
exports.gscApi = databases_js_1.worker.pacer("gscApi", {
    allowedRequests: 60,
    intervalMs: 60000,
});
// Peec: undocumented limit. Conservative.
exports.peecApi = databases_js_1.worker.pacer("peecApi", {
    allowedRequests: 30,
    intervalMs: 60000,
});
