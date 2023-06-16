import "@rauschma/iterator-helpers-polyfill/install";
import { Env } from "./Env";
import { _throw } from "../../src/utils/_throw";
import { error } from "itty-router";
import { Router, status } from "itty-router";
import { addHidKvRoutes } from "./addHidKvRoutes";
import { addTrekRoutes } from "./addTrekRoutes";
import { addDateseedRoutes } from "./addDateseedRoutes";


const router = Router();
router.options("*", () => status(204));
addHidKvRoutes(router);
addTrekRoutes(router);
addDateseedRoutes(router);

export default {
    fetch: (request: Request, env: Env) => router
        .handle(request, env)
        .then((response: Response) => {
            for (const [k, v] of Object.entries({
                "Access-Control-Allow-Origin":
                    "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers":
                    "authorization, referer, origin, content-type",
                "Access-Control-Max-Age":
                    "3600",
            })) { response.headers.set(k, v); }
            return response;
        })
        .catch(err => {
            console.error(err);
            return error(500, err instanceof Error ? err.stack : err);
        }),
};


export { Chainer } from "./Chainer";
