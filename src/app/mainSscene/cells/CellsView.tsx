import { RenderCallback, ThreeElements, useFrame } from "@react-three/fiber";
import { v2 } from "../../../utils/v";
import { useRecoilValue } from "recoil";
import { trekRecoil } from "../../trekRecoil";
import { Dropzone, Trek, sightAt } from "../../../model/terms";
import { trekDropzone } from "../../../model/terms";
import { caForDropzone } from "../../../model/terms";
import { useMemo } from "react";
import { BoxGeometry, Euler, Group, Matrix4, MeshPhongMaterial, Quaternion, Vector3 } from "three";
import { LehmerPrng } from "../../../utils/LehmerPrng";
import { InstancedMeshHost, zeroScaleMatrix } from "../../../utils/InstancedMeshHost";
import { ParentState } from "./LayoutContext";
import { Cell } from "./Cell";


export const _m4s = Array.from({ length: 10 }, () => new Matrix4());
export const _v3s = Array.from({ length: 10 }, () => new Vector3());
export const _qs = Array.from({ length: 10 }, () => new Quaternion());
export const _es = Array.from({ length: 10 }, () => new Euler());


const getReducedNeighborhoodState = (
    dropzone: Dropzone,
    t: number,
    x: number,
) => {
    const stateCount = dropzone.world.ca.stateCount;

    const sc = stateCount
        + 1; // for out of bounds
    let s1 = 0;
    for (let dt = -4; dt <= 0; dt++) {
        for (let dx = -4; dx <= 0; dx++) {
            s1 *= sc;
            s1 += caForDropzone(dropzone).at(t + dt, x + dx)
                ?? (stateCount + 0);
        }
    }

    let s2 = 0;
    for (let dt = 1; dt <= 4; dt++) {
        for (let dx = 1; dx <= 4; dx++) {
            s2 *= sc;
            s2 += caForDropzone(dropzone).at(t + dt, x + dx)
                ?? (stateCount + 0);
        }
    }
    return s1 ^ s2;
};

const createCellView = ({
    tc, xc, sx, st,
    parent,
    boxHost: boxHost,
    onTrek,
    onFrame,
}: {
    tc: number, xc: number, sx: number, st: number,
    parent: Group,
    boxHost: InstancedMeshHost,
    onTrek: (callback: (trek: Trek) => void) => void,
    onFrame: (callback: RenderCallback) => void,
}) => {
    const boxPool = Array.from(
        { length: 5 },
        () => boxHost.getFreeClientOrThrow());
    let boxIndex = 0;
    const abuseBox = () => boxPool[boxIndex++];

    const onFrameCallbacks = [] as Array<(
        parentState: ParentState,
        ...rest: Parameters<RenderCallback>
    ) => void>;
    const abuseFrame = onFrameCallbacks.push.bind(onFrameCallbacks);

    const rootMatrixWorld = new Matrix4();
    let parentState = undefined as ParentState | undefined;

    onTrek(trek => {
        const sight = sightAt(trek);
        const dropzone = trekDropzone(trek);

        const pos = sight.playerPosition;
        const [px, pt] = pos;

        const t1 = Math.round(pt / tc) * tc + st;
        const t = t1 + (pt > (t1 - tc / 2) ? 0 : -tc);

        const x1 = Math.round(px / xc) * xc + sx;
        const x = x1 + (px > (x1 - xc / 2) ? 0 : -xc);

        const isInBounds = t >= 0 && x >= 0 && x < dropzone.width;
        if (isInBounds) {
            const isVisited = sight.visitedCells
                .some(p => v2.eqStrict(p, [x, t]));

            const stateChanged =
                !parentState
                || parentState.state.dropzone !== dropzone
                || parentState.state.t !== t
                || parentState.state.x !== x
                || parentState.state.isVisited !== isVisited;

            if (stateChanged) {
                boxIndex = 0;
                onFrameCallbacks.splice(0);

                if (!parentState) {
                    parentState = {
                        rootMatrixWorld,
                        state: { t, x, isVisited, dropzone },
                    };
                } else {
                    parentState.state = { t, x, isVisited, dropzone };
                }

                parent.updateMatrixWorld(true);
                rootMatrixWorld.compose(
                    _v3s[0].set(t, 0, x),
                    _qs[0].identity(),
                    _v3s[1].set(1, 1, 1),
                ).multiply(parent.matrixWorld);

                const rand = new LehmerPrng(
                    1 + getReducedNeighborhoodState(dropzone, t, x));

                Cell({
                    ...parentState,
                    abuseRandom: rand.nextFloat.bind(rand),
                    abuseBox,
                    abuseFrame,
                });
            }
        } else {
            parentState = undefined;
            boxIndex = 0;
            onFrameCallbacks.splice(0);
        }

        for (let i = boxIndex; i < boxPool.length; i++) {
            boxPool[i].setMatrix(zeroScaleMatrix);
        }
    });

    onFrame((...args) => {
        if (onFrameCallbacks.length === 0) { return; }

        if (!parentState) { return; }
        const { x, t } = parentState.state;

        parent.updateMatrixWorld();
        rootMatrixWorld.compose(
            _v3s[0].set(t, 0, x),
            _qs[0].identity(),
            _v3s[1].set(1, 1, 1),
        ).multiply(parent.matrixWorld);

        for (const callback of onFrameCallbacks) {
            callback(parentState, ...args);
        }
    });

    return () => {
        for (const box of boxPool) { box.deuse(); }
    };
};

export function CellsView({
    tCellsPerScreen: tc, xCellsPerScreen: xc, ...props
}: {
    tCellsPerScreen: number;
    xCellsPerScreen: number;
} & ThreeElements["group"]) {
    const trek = useRecoilValue(trekRecoil);

    const { parent, frameSignal, trekSignal } = useMemo(() => {
        const parent = new Group();
        const boxHost = new InstancedMeshHost(
            new BoxGeometry(),
            new MeshPhongMaterial(),
            tc * xc * 5,
        );
        boxHost.receiveShadow = true;
        boxHost.castShadow = true;
        boxHost.frustumCulled = false;
        parent.add(boxHost);
        const frameSignal = [] as RenderCallback[];
        const trekSignal = [] as ((trek: Trek) => void)[];
        const disposeBag = Array.from({ length: tc * xc }, (_, i) =>
            createCellView({
                tc,
                xc,
                sx: i % xc,
                st: Math.floor(i / xc),
                parent,
                boxHost,
                onFrame: (callback: RenderCallback) =>
                    frameSignal.push(callback),
                onTrek: (callback: (trek: Trek) => void) =>
                    trekSignal.push(callback),
            }));
        return {
            parent: parent,
            trekSignal,
            frameSignal,
            dispose() { for (const x of disposeBag) { x(); } },
        };
    }, [tc, xc]);
    useMemo(() => {
        for (const x of trekSignal) { x(trek); }
    }, [trekSignal, trek]);
    useFrame((...args) => {
        for (const x of frameSignal) { x(...args); }
    });
    return <primitive object={parent} {...props} />;
}