function saveCurrentModel() {
    if (!Model.dag) {
        alert("Kein Modell geladen.");
        return;
    }

    try {
        const id = saveModel(
            "my-model",
            Model.dag.toString()
        );

        alert("Modell gespeichert: Version " + id);
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Das Modell konnte nicht gespeichert werden.");
    }
}
function showSavedGraphs() {
    const list = document.getElementById("saved_graphs");
    const models = getAllSavedModels();

    list.replaceChildren();

    models.forEach(model => {
        const item = document.createElement("li");
        const loadButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        loadButton.textContent =
            new Date(model.createdAt).toLocaleString();

        loadButton.onclick = function () {
            document.getElementById("adj_matrix").value = model.content;
            loadDAGFromTextData();
        };

        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            deleteModel(model.id);
            showSavedGraphs();
        };

        item.appendChild(loadButton);
        item.appendChild(deleteButton);
        list.appendChild(item);
    });
}
async function saveCurrentModel() {
    if (!Model.dag) {
        alert("Kein Modell geladen.");
        return;
    }

    const id = saveModel("my-model", Model.dag.toString());

    showSavedGraphs();

    alert("Modell gespeichert: Version " + id);
}