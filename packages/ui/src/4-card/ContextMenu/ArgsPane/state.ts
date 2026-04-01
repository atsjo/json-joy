import {ArgsPaneProps} from ".";
import {rsync} from "../../..";

export class ArgsState {
  public args: rsync.ReactValue<Record<string, unknown>>;

  constructor(public readonly props: ArgsPaneProps) {
    const map: Record<string, unknown> = {};
    for (const param of props.params)
      map[String(param.id ?? param.name)] = param.default;
    this.args = rsync.val<Record<string, unknown>>(map);
  }

  public setValue(name: string, value: unknown) {
    this.args.next({...this.args.value, [name]: value});
  }

  public canSubmit(): boolean {
    const args = this.args;
    const map = args.value;
    for (const param of this.props.params) {
      if (!param.optional) {
        const id = param.id ?? param.name;
        if (map[id] === undefined) return false;
      }
    }
    return true;
  }

  public readonly onSubmit = () => {
    if (this.canSubmit()) this.props.onSubmit(this.args.value);
  };
}
