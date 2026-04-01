import {rsync} from "../../..";
import type {Param} from "../../StructuralMenu/types";

export class ArgsState {
  public args: rsync.ReactValue<Record<string, unknown>>;

  constructor(public readonly params: Param[]) {
    const map: Record<string, unknown> = {};
    for (const param of params)
      if (param.default !== undefined) map[String(param.id ?? param.name)] = param.default;
    this.args = rsync.val<Record<string, unknown>>(map);
  }

  public setValue(name: string, value: unknown) {
    const args = this.args;
    const map = args.value;
    map[name] = value;
    args.next(map);
  }

  public canSubmit(): boolean {
    const args = this.args;
    const map = args.value;
    for (const param of this.params) {
      if (!param.optional) {
        const value = map[param.name];
        if (value === undefined || value === '') return false;
      }
    }
    return true;
  }

  public readonly onSubmit = () => {
    // const handleSubmit = React.useCallback(() => {
      //   if (canSubmit) onSubmit(values);
      // }, [canSubmit, onSubmit, values]);
  };
}
