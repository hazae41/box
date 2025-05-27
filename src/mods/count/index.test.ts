import { assert, test } from "@hazae41/phobos";
import { Count } from "./index.js";

class Resource implements Disposable {

  disposed = false;

  [Symbol.dispose]() {
    this.disposed = true
  }

}

await test("count", async ({ test, message }) => {
  console.log(`--- ${message} ---`)

  const resource = new Resource()

  {
    using count = Count.wrap(resource)

    {
      using clone = count.clone()

      {
        using _ = clone.clone()
      }
    }

    assert(count.count === 1)

    {
      async function use(count: Count<Resource>) {
        using _ = count.clone()

        await new Promise(resolve => setTimeout(resolve, 1000))

        return
      }

      use(count)
    }
  }

  assert(resource.disposed === false)

  await new Promise(resolve => setTimeout(resolve, 2000))

  assert(resource.disposed === true);
})