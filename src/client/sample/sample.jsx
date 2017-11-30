import classnames from "classnames";
import {RComponent} from "../common/r-component";

export class Sample extends RComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            mario: {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                dir: "right"
            },
        };

        // const update(dt, keys) mario =
        //     mario
        //     |> gravity dt
        // |> jump keys
        // |> walk keys
        // |> physics dt
    }

    render() {
        const {mario} = this.state;
        return (
            <div className="">
                <img src={`/assets/img/mario/${mario.y > 0 ? "jump" : mario.vx !== 0 ? "walk" : "stand"}_${mario.dir}.gif`}/>
            </div>
        );
    }
}