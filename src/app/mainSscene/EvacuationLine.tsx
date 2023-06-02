import { jsx } from "@emotion/react";
import { EvacuationLineParticles } from "./EvacuationLineParticles";
import { useRecoilValue } from "recoil";
import { sightAt, startForTrek, trekRecoil } from "../trekRecoil";
import { evacuationLinePosition, evacuationLineProgress } from "../../model/evacuation";


export function EvacuationLine({
    ...props
}: jsx.JSX.IntrinsicElements["group"] & {
    isPrev?: boolean;
}) {
    const trek = useRecoilValue(trekRecoil);
    const dropzone = startForTrek(trek).zone;
    const sight = sightAt(trek);
    const pos = sight.playerPosition;

    const p = evacuationLineProgress(pos[1]);
    const p1 = Math.floor(p);
    const p2 = Math.ceil(p) === p1 ? p1 + 1 : Math.ceil(p);

    return <group
        {...props}
    >
        {p1 > 0 && <EvacuationLineParticles
            position={[
                evacuationLinePosition(p1),
                0,
                dropzone.width / 2]}
            width={dropzone.width}
        />}
        <EvacuationLineParticles
            position={[
                evacuationLinePosition(p2),
                0,
                dropzone.width / 2]}
            width={dropzone.width}
        />
    </group>;
}
