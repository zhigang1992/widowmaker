import startWidowmaker from "./index";

startWidowmaker(async w => {
  w.show("This is show content");
  w.show("And here comes an input");
  const result = await w.ask("Placeholder", "Next");
  w.show(`You typed ${result}`);
  const command = await w.askCommands({
    a: "Command A",
    b: "Command B",
    c: "Command C"
  });
  w.show(`You selected ${command}`);
  const file = await w.askFile();
  w.show(`Your file has been saved to ${file}`);
  await w.askCommands({ a: "Download" });
  await w.downloadLocal(file);
  const { action, payload } = await w.showTable(
    {
      id: "ID",
      name: "Name",
      info: "Info",
      action: "Actions"
    },
    [...Array(5).keys()].map(index => ({
      id: String(index),
      name: `User ${index}`,
      info: `Info ${index}`,
      action: {
        type: "action" as "action",
        action: "delete",
        payload: String(index)
      }
    }))
  );
  w.show(`You've selected ${action}, ${payload}`);
  await w.askCommands({ a: "Done" });
  w.clear();
});
