import { World, keyProjectWorld } from "../model/World";
import { Trek } from "../model/terms";
import { _throw } from "../utils/_throw";
import { FlatTrek, flattenTrek } from "./FlatTrek";
import { PackedTrek, packTrek, unpackTrek } from "./PackedTrek";

export const saverVersion = "digdeeper3/copilot/saver@3";

export function saveFlatTrek(flatTrek: FlatTrek) {
    const countKey = JSON.stringify({
        saverVersion,
        world: keyProjectWorld(flatTrek.start.dropzone.world),
        key: "count",
    });

    const count = JSON.parse(localStorage.getItem(countKey) ?? "0");

    const trekId = count;
    const trekKey = JSON.stringify({
        saverVersion,
        world: keyProjectWorld(flatTrek.start.dropzone.world),
        key: "trek",
        trekId,
    });

    localStorage.setItem(trekKey, JSON.stringify(packTrek(flatTrek)));
    localStorage.setItem(countKey, JSON.stringify(count + 1));
}

export const saveTrek = (trek: Trek) => saveFlatTrek(flattenTrek(trek));

export function loadFlatTreks(world: World) {
    const countKey = JSON.stringify({
        saverVersion,
        world: keyProjectWorld(world),
        key: "count",
    });
    const count = JSON.parse(localStorage.getItem(countKey) ?? "0");
    return Array.from(
        { length: count },
        (_, i) => {
            const trekKey = JSON.stringify({
                saverVersion,
                world: keyProjectWorld(world),
                key: "trek",
                trekId: i,
            });
            return unpackTrek(JSON.parse(
                localStorage.getItem(trekKey)
                ?? _throw("Unexpectedly missing saved trek"),
            ) as PackedTrek);
        });
}
