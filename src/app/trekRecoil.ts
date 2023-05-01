import { atom } from "recoil";
import { Trek, caStateCount, sightVersion } from "../model/terms";
import { LehmerPrng } from "../utils/LehmerPrng";
import { buildFullTransitionLookupTable, version as caVersion } from "../ca";
import { getDigits, getNumberFromDigits } from "../ca/digits";


export const trekRecoil = atom<Trek>({
    key: "trek",
    default: {
        world: {
            sightVersion,
            ca: {
                version: caVersion,
                stateCount: caStateCount,
                rule: (() => {
                    const pretable = getDigits(1815n, 3);
                    const table = buildFullTransitionLookupTable(
                        /* stateCount: */ 3,
                        (stateCount, n1, c, n2, pc) => pretable[n1 + c + n2]);
                    return getNumberFromDigits(table, 3).toString();
                })(),
            },
            seed: Math.floor(Math.random() * LehmerPrng.MAX_INT32),
            stateEnergyDrain: [81 * 9, 1, 0],
            stateEnergyGain: [0, 0, 81],
            emptyState: 1,
            width: 31,
            depthLeftBehind: 10,
        },
    },
});