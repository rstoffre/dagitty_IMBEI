
// Show the list of saved graphs in the UI
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
// Save the current model to local storage
async function saveCurrentModel() {
    if (!Model.dag) {
        alert("Kein Modell geladen.");
        return;
    }

    const id = saveModel("my-model", Model.dag.toString());

    showSavedGraphs();

    alert("Modell gespeichert: Version " + id);
}

// Export the current model and its history to a JSON file
function exportCurrentModel() {
    const modelId = "my-model";
    const data = exportModelHistory(modelId);

    if (data.models.length === 0) {
        alert("Keine gespeicherten Versionen vorhanden.");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "dagitty-model-history.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// Import a model and its history from a JSON file
function importModelFile(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const importedData = JSON.parse(reader.result);

            importModelHistory(importedData);

            const newestModel = importedData.models
                .slice()
                .sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                )[0];

            if (newestModel) {
                document.getElementById("adj_matrix").value =
                    newestModel.content;

                loadDAGFromTextData();
            }

            showSavedGraphs();

            alert("Graph und Historie wurden importiert.");
        } catch (error) {
            console.error("Import fehlgeschlagen:", error);
            alert("Die Datei konnte nicht importiert werden.");
        }

        event.target.value = "";
    };

    reader.readAsText(file);
}