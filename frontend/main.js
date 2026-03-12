const form = document.getElementById("create-list-form");
const output = document.getElementById("output");
const listsOutput = document.getElementById("lists-output");

async function loadLists() {
  try {
    const lists = await apiRequest("http://localhost:3000/lists");
    listsOutput.innerHTML = "";

    for (const list of lists) {
      const li = document.createElement("li");
      li.textContent = list.description
        ? `${list.title} - ${list.description}`
        : list.title;
      listsOutput.appendChild(li);
    }
  } catch (error) {
    listsOutput.innerHTML = "<li>Errore nel caricamento liste</li>";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  try {
    const createdList = await apiRequest("http://localhost:3000/lists", "POST", {
      title,
      description
    });

    output.textContent = `Lista creata con successo:\n${JSON.stringify(createdList, null, 2)}`;
    form.reset();
    await loadLists();
  } catch (error) {
    output.textContent = `Errore durante la creazione: ${error.message}`;
  }
});

loadLists();
