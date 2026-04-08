import {Model} from "../../model";
import {Delta} from "../Delta";


test('...', () => {
  const model = Model.create({
    foo: 123,
    bar: 'abc',
  });
  model.api.add('/foo', 100);

  const model2 = model.fork();
  model2.api.add('/baz', true);
  
  // model2.api.merge('/bar', 'Abc!');
  const delta = Delta.make(model2, model.clock);

  console.log(delta);
  console.log(delta + '');

  console.log(model + '');
  console.log(model2 + '');

});
