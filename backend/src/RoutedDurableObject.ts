import { Router } from "itty-router";
import { error, json } from "itty-router";
import { Env } from "./Env";


export class RoutedDurableObject {
    fetch = (() => {
        const router = Router()
            .post("/:target", async (request) => {
                /* eslint-disable */
                const { target } = request.params!;
                if (target.startsWith("_")) { return error(403, "private"); }
                const args = await request.json!();
                // @ts-ignore
                const ret = await this[target](...args);
                /* eslint-enable */
                if (ret instanceof Response) { return ret; }
                return json(ret);
            });

        return (req: Request, env: Env) => router
            .handle(req, env)
            .catch(err => {
                console.error(err);
                return error(500, err instanceof Error ? err.stack : err);
            });
    })();
}


type GenericFunction<TS extends unknown[], R> = (...args: TS) => R;
type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;
type Promisify<T> = {
    [K in keyof T]: T[K] extends GenericFunction<infer TS, infer R>
    ? (...args: TS) => Promise<UnpackedPromise<R>>
    : never;
};

export const clientifyRoutedStub = <TDurableObject>(
    stub: DurableObjectStub,
) => new Proxy(stub, {
    get: (obj, prop) => {
        if (typeof prop !== "string") { return; }
        if (prop === "fetch") { return obj[prop]; }
        return async (...args: unknown[]): Promise<unknown> =>
            (await obj.fetch(new Request(`https://durable/${prop}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(args),
            }))).json();
    },
}) as unknown as Promisify<TDurableObject & DurableObjectStub>;
