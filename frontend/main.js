const API_URL = "http://localhost:3000";

const listForm = document.getElementById("create-list-form");
const itemForm = document.getElementById("create-item-form");
const output = document.getElementById("output");
const listsOutput = document.getElementById("lists-output");
const itemsOutput = document.getElementById("items-output");
const selectedListOutput = document.getElementById("selected-list-output");
const itemListIdInput = document.getElementById("item-list-id");

let selectedListId = null;

function showMessage(message) {
  output.textContent = message;
}

function setSelectedList(list) {
  selectedListId = list ? list.id : null;

  if (!list) {
    selectedListOutput.textContent = "Nessuna lista selezionata";
    itemsOutput.innerHTML = "";
    return;
  }

  const descriptionText = list.description ? ` - ${list.description}` : "";
  selectedListOutput.textContent = `Id: ${list.id} | ${list.title}${descriptionText}`;
  itemListIdInput.value = String(list.id);
}

async function loadSingleList(listId) {
  try {
    const list = await apiRequest(`${API_URL}/lists/${listId}`);
    setSelectedList(list);
  } catch (error) {
    setSelectedList(null);
    showMessage(`Errore caricamento lista: ${error.message}`);
  }
}

async function loadItems(listId) {
  if (!listId) {
    itemsOutput.innerHTML = "";
    return;
  }

  try {
    const items = await apiRequest(`${API_URL}/lists/${listId}/items`);
    itemsOutput.innerHTML = "";

    if (items.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Nessun elemento in questa lista";
      itemsOutput.appendChild(emptyItem);
      return;
    }

    for (const item of items) {
      const li = document.createElement("li");

      const textNode = document.createElement("span");
      textNode.textContent = `${item.text} - stato: ${item.status}`;

      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.textContent = "Vedi";
      viewButton.style.marginLeft = "10px";
      viewButton.addEventListener("click", async () => {
        try {
          const singleItem = await apiRequest(
            `${API_URL}/lists/${item.list_id}/items/${item.id}`
          );
          showMessage(
            `Elemento ${singleItem.id}: ${singleItem.text} - stato ${singleItem.status}`
          );
        } catch (error) {
          showMessage(`Errore visualizzazione elemento: ${error.message}`);
        }
      });

      const statusButton = document.createElement("button");
      statusButton.type = "button";
      statusButton.textContent = "Cambia stato";
      statusButton.style.marginLeft = "10px";
      statusButton.addEventListener("click", async () => {
        const newStatus = item.status === "todo" ? "done" : "todo";

        try {
          await apiRequest(
            `${API_URL}/lists/${item.list_id}/items/${item.id}/status`,
            "PATCH",
            { status: newStatus }
          );
          showMessage(`Stato elemento aggiornato a ${newStatus}`);
          await loadItems(item.list_id);
        } catch (error) {
          showMessage(`Errore cambio stato: ${error.message}`);
        }
      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Modifica";
      editButton.style.marginLeft = "10px";
      editButton.addEventListener("click", async () => {
        const newText = window.prompt("Nuovo testo elemento:", item.text);
        if (newText === null) {
          return;
        }

        const trimmedText = newText.trim();
        if (!trimmedText) {
          showMessage("Il testo dell'elemento non puo essere vuoto");
          return;
        }

        const newStatus = window.prompt(
          "Nuovo stato elemento (todo o done):",
          item.status
        );
        if (newStatus === null) {
          return;
        }

        const trimmedStatus = newStatus.trim();
        if (trimmedStatus !== "todo" && trimmedStatus !== "done") {
          showMessage("Lo stato deve essere todo oppure done");
          return;
        }

        try {
          await apiRequest(
            `${API_URL}/lists/${item.list_id}/items/${item.id}`,
            "PUT",
            {
              text: trimmedText,
              status: trimmedStatus
            }
          );
          showMessage("Elemento modificato con successo");
          await loadItems(item.list_id);
        } catch (error) {
          showMessage(`Errore modifica elemento: ${error.message}`);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Elimina";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", async () => {
        const confirmDelete = window.confirm(
          `Vuoi eliminare l'elemento "${item.text}"?`
        );

        if (!confirmDelete) {
          return;
        }

        try {
          await apiRequest(
            `${API_URL}/lists/${item.list_id}/items/${item.id}`,
            "DELETE"
          );
          showMessage("Elemento eliminato con successo");
          await loadItems(item.list_id);
        } catch (error) {
          showMessage(`Errore eliminazione elemento: ${error.message}`);
        }
      });

      li.appendChild(textNode);
      li.appendChild(viewButton);
      li.appendChild(statusButton);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
      itemsOutput.appendChild(li);
    }
  } catch (error) {
    itemsOutput.innerHTML = "<li>Errore nel caricamento elementi</li>";
  }
}

async function selectList(listId) {
  await loadSingleList(listId);
  await loadItems(listId);
}

async function loadLists() {
  try {
    const lists = await apiRequest(`${API_URL}/lists`);
    listsOutput.innerHTML = "";

    if (lists.length === 0) {
      listsOutput.innerHTML = "<li>Nessuna lista presente</li>";
      setSelectedList(null);
      return;
    }

    for (const list of lists) {
      const li = document.createElement("li");
      const listText = list.description
        ? `${list.title} - ${list.description}`
        : list.title;

      const textNode = document.createElement("span");
      textNode.textContent = listText;

      const viewButton = document.createElement("button");
      viewButton.type = "button";
      viewButton.textContent = "Apri";
      viewButton.style.marginLeft = "10px";
      viewButton.addEventListener("click", async () => {
        await selectList(list.id);
        showMessage(`Lista "${list.title}" selezionata`);
      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Modifica";
      editButton.style.marginLeft = "10px";
      editButton.addEventListener("click", async () => {
        const newTitle = window.prompt("Nuovo titolo lista:", list.title);
        if (newTitle === null) {
          return;
        }

        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) {
          showMessage("Il titolo non puo essere vuoto");
          return;
        }

        const currentDescription = list.description ?? "";
        const newDescription = window.prompt(
          "Nuova descrizione lista:",
          currentDescription
        );
        if (newDescription === null) {
          return;
        }

        try {
          const updatedList = await apiRequest(
            `${API_URL}/lists/${list.id}`,
            "PUT",
            {
              title: trimmedTitle,
              description: newDescription.trim()
            }
          );
          showMessage(`Lista "${updatedList.title}" modificata con successo`);
          await loadLists();

          if (selectedListId === list.id) {
            await selectList(list.id);
          }
        } catch (error) {
          showMessage(`Errore durante modifica lista: ${error.message}`);
        }
      });

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
          await apiRequest(`${API_URL}/lists/${list.id}`, "DELETE");
          showMessage(`Lista "${list.title}" eliminata con successo`);

          if (selectedListId === list.id) {
            setSelectedList(null);
          }

          await loadLists();
        } catch (error) {
          showMessage(`Errore durante eliminazione lista: ${error.message}`);
        }
      });

      li.appendChild(textNode);
      li.appendChild(viewButton);
      li.appendChild(editButton);
      li.appendChild(deleteButton);
      listsOutput.appendChild(li);
    }

    if (!selectedListId) {
      await selectList(lists[0].id);
    }
  } catch (error) {
    listsOutput.innerHTML = "<li>Errore nel caricamento liste</li>";
  }
}

listForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  try {
    const createdList = await apiRequest(`${API_URL}/lists`, "POST", {
      title,
      description
    });

    showMessage(`Lista "${createdList.title}" creata con successo`);
    listForm.reset();
    await loadLists();
    await selectList(createdList.id);
  } catch (error) {
    showMessage(`Errore durante la creazione lista: ${error.message}`);
  }
});

itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const listId = Number.parseInt(itemListIdInput.value, 10);
  const text = document.getElementById("item-text").value.trim();
  const status = document.getElementById("item-status").value;

  try {
    await apiRequest(`${API_URL}/lists/${listId}/items`, "POST", {
      text,
      status
    });

    showMessage("Elemento creato con successo");
    itemForm.reset();
    document.getElementById("item-status").value = "todo";
    itemListIdInput.value = String(listId);
    await selectList(listId);
  } catch (error) {
    showMessage(`Errore durante la creazione elemento: ${error.message}`);
  }
});

loadLists();
