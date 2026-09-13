import { worker } from "./databases.js";

// Sanity: paid tier allows ~100 req/s. We do 1 request per sync. Generous budget.
export const sanityApi = worker.pacer("sanityApi", {
	allowedRequests: 10,
	intervalMs: 1000,
});

// GSC: 1,200 queries/minute per project. Budget for paginated requests.
export const gscApi = worker.pacer("gscApi", {
	allowedRequests: 60,
	intervalMs: 60_000,
});

// Peec: undocumented limit. Conservative.
export const peecApi = worker.pacer("peecApi", {
	allowedRequests: 30,
	intervalMs: 60_000,
});
