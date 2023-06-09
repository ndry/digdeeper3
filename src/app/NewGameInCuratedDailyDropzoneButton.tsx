import { Today } from "@emotion-icons/material-rounded/Today";
import { generateDropzone } from "../model/generate";
import { jsx, keyframes } from "@emotion/react";
import { useSetDropzone } from "./basecamp/useSetDropzone";
import { useTranslate } from "./languageRecoil";
import { LoaderCircle } from "@emotion-icons/boxicons-regular/LoaderCircle";
import { Error as ErrorIcon } from "@emotion-icons/boxicons-solid/Error";
import { HmacSHA256 } from "crypto-js";
import { devChoiceWorlds } from "./basecamp/DevChoiceWorlds";
import { _never } from "../utils/_never";
import { useDailyDateseed } from "./fetchDateseed";


export function generateCuratedDailyDropzone(dailySeed: string) {
    const worldIndexSeed =
        HmacSHA256(dailySeed, "curatedDaily.worldIndexSeed").words[0] >>> 0;
    return generateDropzone({
        world: devChoiceWorlds[worldIndexSeed % devChoiceWorlds.length],

        // make it 31 bit to fit positive int32,
        // todo: fix/change prng to use full uint32 range
        seed:
            HmacSHA256(dailySeed, "curatedDaily.dropzoneSeed")
                .words[0] >>> 1,
    });
}

export function NewGameInCuratedDailyDropzoneButton({
    css: cssProp, ...props
}: jsx.JSX.IntrinsicElements["button"]) {
    const translate = useTranslate();
    const setDropzone = useSetDropzone();
    const [dailySeed, dailySeedError, dailySeedStatus] = useDailyDateseed();
    return <button
        css={[{
            display: "flex",
            alignItems: "center",
        }, cssProp]}
        onClick={() => {
            if (!dailySeed) {
                return _never("The button is expected to be disabled");
            }
            setDropzone(generateCuratedDailyDropzone(dailySeed));
        }}
        disabled={dailySeedStatus !== "resolved"}
        {...props}
    >
        {dailySeedStatus === "pending" && <LoaderCircle
            css={[{
                animation: `${keyframes`
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
                `} 2s linear infinite`,
                width: "2vmin",
                marginRight: "0.4vmin",
            }]} />}

        {dailySeedStatus === "rejected" && <ErrorIcon
            title={dailySeedError?.message ?? "Error"}
            css={{ width: "2vmin", marginRight: "0.4vmin" }} />}

        <Today css={{ width: "2vmin", marginRight: "0.4vmin" }} />
        {translate("Daily Game")}
    </button>;
}
