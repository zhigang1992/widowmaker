## Widowmaker

Server side driven UI

```javascript
// Node code running in backend:
const startWidowmaker = require("@zhigang1992/widowmaker").default;

startWidowmaker(async w => {
  w.show("Hello, what is your name?");
  const name = await w.ask("Name", "Sup");
  w.show(`Hi, ${name}, nice to meet you`);
  w.show("Are you a boy or girl?");
  const gender = await w.askCommands({
    boy: "I'm a Boy",
    girl: "I'm a Girl"
  });
  if (gender === "boy") {
    w.display(
      "https://storage.needpix.com/rsynced_images/comic-characters-2023311_1280.png"
    );
  } else {
    w.display(
      "https://storage.needpix.com/rsynced_images/woman-1467853_1280.png"
    );
  }
});
```

You can run anything in node here (e.g. puppeteer task login user) interactively

It supports:

- Show text
- Show image
- Show table
- Ask text
- Multi Choice
- Upload file
- Download file

More details here [UIExplore.ts](./services/src/UIExplore.ts)

It also has full TypeScript support!
