import { DropEquipment } from "../../model/terms/Drop";
import { version as sightVersion } from "../../model/version";
import { localStorageAtomEffect } from "../../utils/reactish/localStorageAtomEffect";
import { atom } from "recoil";

export const dropEquipmentRecoil = atom<DropEquipment>({
    key: "dropEquipment",
    default: {
        pickNeighborhoodLevel: 0,
        knightMoveLevel: 0,
    },
    effects: [
        localStorageAtomEffect({
            key: key => `${sightVersion}/${key}`,
        }),
    ],
});