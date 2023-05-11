import { GizmoHelper, GizmoViewport, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { CellsView } from "./CellsView";
import { PlayerView } from "./PlayerView";
import { CopilotView } from "./CopilotView";
import { StopLine } from "./StopLine";
import { GroupSync } from "../../utils/GroupSync";
import { Vector3 } from "three";
import { dampVector3 } from "../../utils/dampVector3";

export function MainScene() {
    return <>
        <color attach="background" args={["#1f0128"]} />

        <ambientLight intensity={0.5} />
        <directionalLight
            intensity={0.4}
            position={[2, 10, -5]}
        />
        <directionalLight
            intensity={0.2}
            position={[2, 6, 5]}
        />

        {/* <OrbitControls /> */}
        <GizmoHelper
            alignment="bottom-right"
            margin={[80, 110]}
        >
            <GizmoViewport />
        </GizmoHelper>

        <OrthographicCamera />

        <PlayerView>
            <GroupSync
                onFrame={(g, { camera }, delta) => {
                    const z = new Vector3(0, 0, 0);
                    g.localToWorld(z);
                    camera.parent?.worldToLocal(z);
                    z.x += 1;
                    z.y += 2;

                    const p = new Vector3(-0.1, 18, 7);
                    g.localToWorld(p);
                    camera.parent?.worldToLocal(p);

                    if (camera.position.distanceTo(p) > 10) {
                        camera.position.copy(p);
                    } else if (camera.position.distanceTo(p) > 0.1) {
                        dampVector3(
                            camera.position, camera.position, p, 3, delta);
                    } else {
                        // 
                    }

                    camera.lookAt(z);
                }} />
        </PlayerView>
        <CopilotView />

        <StopLine />

        <CellsView tCellsPerScreen={61} xCellsPerScreen={51} />
    </>;
}
