import type { jsx } from "@emotion/react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { trekRecoil } from "../trekRecoil";
import { WorldPreview } from "./WorldPreview";
import { useState } from "react";
import { Time } from "@emotion-icons/ionicons-solid/Time";
import { historicalWorldsRecoil } from "./historicalWorldsRecoil";


export function HistoricalWorlds({
    ...props
}: jsx.JSX.IntrinsicElements["div"]) {
    const setProgression = useSetRecoilState(trekRecoil);
    const historicalWorlds = useRecoilValue(historicalWorldsRecoil);

    const [isHistoricalWorlds, setIsHistoricalWorlds] = useState(false);

    return <div {...props}>
        <h3
            onClick={() => setIsHistoricalWorlds(!isHistoricalWorlds)}
            css={[{
                margin: "0.9vmin 0",
            }]}
        >
            <Time css={[{
                width: "2vmin",
                marginRight: "0.4vmin",
            }]} />
            Previously played worlds:
        </h3>
        {historicalWorlds && isHistoricalWorlds &&
            <div css={[{
                listStyle: "none",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
            }]}>
                {historicalWorlds
                    .slice(0, 10)
                    .map((p, i) => <div
                        key={i}
                        css={[{
                            position: "relative",
                        }]}>
                        <WorldPreview
                            css={[{
                                margin: "0.1vmin",
                            }]}
                            dropzone={p} />
                        <button
                            css={[{
                                position: "absolute",
                                bottom: "1vmin",
                                left: "50%",
                                transform: "translateX(-50%)",
                            }]}
                            onClick={() => setProgression({ dropzone: p })}
                        > Play!</button>
                    </div>)}
            </div>}
    </div>;
}