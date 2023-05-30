import { pipe } from "fp-ts/lib/function";
import * as D from "io-ts/Decoder";
import { version } from "../version";
import { DropDecoder } from "./Drop";
import { decode } from "../../utils/keyifyUtils";
import { getValueAt } from "../../utils/base64Array";


const asIdGuard = <T>(fn: (x: T) => boolean) => fn as (x: T) => x is typeof x;

export const PackedTrekDecoder = pipe(
    D.struct({
        v: D.literal(version),
        drop: DropDecoder,

        // expect long treks, let trek assertion fail if data is invalid
        bytecodeLength: pipe(
            D.number,
            D.refine(
                Number.isInteger as (x: unknown) => x is number,
                "integer"),
        ),
        bytecodeBase64: D.string,
    }),
    D.refine(
        asIdGuard(({ bytecodeLength, bytecodeBase64 }) => {
            for (
                let i = bytecodeLength;
                i < bytecodeBase64.length * (6 / instructionBitSize);
                i++
            ) {
                if (getValueAt(instructionBitSize, bytecodeBase64, i) !== 0) {
                    return false;
                }
            }
            return true;
        }),
        "extra base64 bits are zeroed",
    ),
);

export type PackedTrek = D.TypeOf<typeof PackedTrekDecoder>;
export const keyProjectPackedTrek = decode(PackedTrekDecoder);
export const keyifyPackedTrek =
    (x: PackedTrek) => JSON.stringify(keyProjectPackedTrek(x));


export const instructions = [
    "forward", // t++
    "backward", // t--
    "left", // x--
    "right", // x++
] as const;
export type InstructionIndex = 0 | 1 | 2 | 3; // keyof typeof indexedActions;
export const instructionBitSize =
    Math.ceil(Math.log2(instructions.length));
export const instructionIndices = instructions.reduce(
    (acc, action, i) => ({ ...acc, [action]: i }),
    {} as Record<typeof instructions[number], InstructionIndex>,
);

export const getInstructionAt = (trek: PackedTrek, index: number) =>
    getValueAt(
        instructionBitSize,
        trek.bytecodeBase64,
        index,
    ) as InstructionIndex;
