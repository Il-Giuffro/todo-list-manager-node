const form = document.getElementById("create-list-form");
const output = document.getElementById("output");
const listsOutput = document.getElementById("lists-output");

async function loadLists() {
  try {
    const lists = await apiRequest("http://localhost:3000/lists");
    listsOutput.innerHTML = "";

    for (const list of lists) {
      const li = document.createElement("li");
      const listText = list.description
        ? `${list.title} - ${list.description}`
        : list.title;

      const textNode = document.createElement("span");
      textNode.textContent = listText;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Elimina";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", async () => {
        const confirmDelete = window.confirm(
          `Vuoi eliminare la lista "${list.title}"?`
        );

        if (!confirmDelete) {
          return;
        }

        try {
          await apiRequest(`http://localhost:3000/lists/${list.id}`, "DELETE");
          output.textContent = `Lista "${list.title}" eliminata con successo`;
          await loadLists();
        } catch (error) {
          output.textContent = `Errore durante eliminazione: ${error.message}`;
        }
      });

      li.appendChild(textNode);
      li.appendChild(deleteButton);
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

    output.textContent = `Lista "${createdList.title}" creata con successo`;
    form.reset();
    await loadLists();
  } catch (error) {
    output.textContent = `Errore durante la creazione: ${error.message}`;
  }
});

loadLists();
