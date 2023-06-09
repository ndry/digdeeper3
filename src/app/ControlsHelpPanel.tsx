import type { jsx } from "@emotion/react";
import { Tent } from "@emotion-icons/fluentui-system-filled/Tent";
import { MapMarkedAlt } from "@emotion-icons/fa-solid/MapMarkedAlt";
import { Undo } from "@emotion-icons/evaicons-solid/Undo";
import { Robot } from "@emotion-icons/fa-solid/Robot";
import { JoystickButton } from "@emotion-icons/boxicons-regular/JoystickButton";
import { dropShadow5 } from "../utils/dropShadow5";
import { useTranslate } from "./languageRecoil";


const keyStyle = {
    display: "inline-block",
    height: "1.1em",
    minWidth: "1.1em",
    borderRadius: "10%",
    backgroundColor: "#ffffff",
    color: "#000000",
    fontWeight: "bold",
    textAlign: "center",
    padding: "0.2em",
    margin: "0.1em",
} as const;


export type ControlsPanelVisibility = "tutorial" | "open" | "mini" | "hint";
export const controlsPanelVisibilityToggle = {
    tutorial: "mini",
    open: "mini",
    mini: "hint",
    hint: "open",
} as const;
export const controlsPanelVisibilityToggleInverse = {
    tutorial: "mini",
    open: "hint",
    mini: "open",
    hint: "mini",
} as const;

export function ControlsHelpPanel({
    visibility,
    css: cssProp,
    ...props
}: jsx.JSX.IntrinsicElements["div"] & {
    visibility: ControlsPanelVisibility,
}) {
    const translate = useTranslate();

    const wasd = <div css={{
        fontSize: "3em",
    }}>
        <div>
            <div css={{ display: "inline-block" }}>
                &nbsp;&nbsp;<span css={keyStyle}>W</span>
                <br />
                <span css={keyStyle}>A</span>
                <span css={keyStyle}>S</span>
                <span css={keyStyle}>D</span>
            </div>
            &nbsp;/&nbsp;
            <div css={{ display: "inline-block", textAlign: "center" }}>
                <span css={keyStyle}>↑</span>
                <br />
                <span css={keyStyle}>←</span>
                <span css={keyStyle}>↓</span>
                <span css={keyStyle}>→</span>
            </div>
        </div>
    </div>;
    const others = <div css={{
        fontSize: "2.2em",
    }}>
        <div>
            <span css={keyStyle}>C</span> - <Robot css={{
                height: "1.5em",
                margin: "-0.4em -0.1em 0em -0.1em",
            }} /> {translate("accept copilot hint")}
        </div>
        <div>
            <span css={keyStyle}>Z</span> - <Undo css={{
                height: "1.5em",
                margin: "-0.4em -0.1em 0em -0.1em",
            }} /> {translate("undo")}
        </div>
        <div>
            <span css={keyStyle}>
                M
            </span> - <MapMarkedAlt css={{
                height: "1.5em",
                margin: "-0.4em -0.0em 0em -0.0em",
            }} /> {translate("map")}
        </div>
        <div>
            <span css={keyStyle}>
                <span css={{ fontSize: "0.7em" }}>Esc</span>
            </span> - <Tent css={{
                height: "1.5em",
                margin: "-0.4em -0.3em 0em -0.3em",
            }} /> {translate("visit basecamp")}
        </div>
    </div>;

    const h = <div css={{
        fontSize: (visibility === "hint" || visibility === "mini")
            ? "4.2em"
            : "2.2em",
    }}>
        <div>
            <span css={keyStyle}>H</span> - <JoystickButton css={{
                height: "1.5em",
                margin: "-0.4em -0.1em -0.1em -0.1em",
            }} />{
                (visibility === "hint")
                    ? " " + translate("help")
                    : " " + translate("controls help")
            }</div>
    </div>;

    return <div
        css={[{
            display: "flex",
            alignItems: "left",
            flexDirection: "column",
            filter: dropShadow5("0.2em", "0.4em", "rgb(0 0 0 / 0.5)"),
        }, cssProp]}
        {...props}
    >
        {visibility === "tutorial" && <>
            {wasd}
        </>}
        {(visibility === "open") && <>
            {wasd}
            <div><br /></div>
            {others}
            {h}
        </>}
        {(visibility === "mini") && <>
            {wasd}
            <div><br /></div>
            {others}
            <div><br /></div>
            {h}
        </>}
        {visibility === "hint" && <>
            {h}
        </>}
    </div >;
}