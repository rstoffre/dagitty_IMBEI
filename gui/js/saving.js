
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
            model.name + " (" +
            new Date(model.createdAt).toLocaleString() +
            ")";

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
    populateComparisonSelectors(models);
}
function populateComparisonSelectors(models) {
    const oldSelect = document.getElementById("comparison_old");
    const newSelect = document.getElementById("comparison_new");

    oldSelect.replaceChildren();
    newSelect.replaceChildren();

    models.forEach(model => {
        const label =
            model.name + " (" +
            new Date(model.createdAt).toLocaleString() +
            ")";

        const oldOption = new Option(label, model.id);
        const newOption = new Option(label, model.id);

        oldSelect.appendChild(oldOption);
        newSelect.appendChild(newOption);
    });

    if (models.length >= 2) {
        oldSelect.selectedIndex = 1;
        newSelect.selectedIndex = 0;
    }
}

function compareSavedModels() {
    const oldId = document.getElementById("comparison_old").value;
    const newId = document.getElementById("comparison_new").value;

    const models = getAllSavedModels();

    const oldModel = models.find(model => model.id === oldId);
    const newModel = models.find(model => model.id === newId);

    if (!oldModel || !newModel) {
        alert("Bitte zwei Versionen auswählen.");
        return;
    }

    const oldGraph = GraphParser.parseGuess(oldModel.content);
    const newGraph = GraphParser.parseGuess(newModel.content);

    const diff = GraphDiff.compare(oldGraph, newGraph);
    diff.removed.forEach(id => {
    oldGraph.getVertex(id).diffStatus = "removed";
    });

    diff.added.forEach(id => {
        newGraph.getVertex(id).diffStatus = "added";
    });

    oldGraph.getEdges().forEach(edge => {
        if (diff.removedEdges.includes(GraphDiff.edgekey(edge))) {
            edge.diffStatus = "removed";
        }
    });

    newGraph.getEdges().forEach(edge => {
        if (diff.addedEdges.includes(GraphDiff.edgekey(edge))) {
            edge.diffStatus = "added";
        }
    });

    document.getElementById("comparison_view").style.display = "block";
    document.getElementById("canvas").style.display = "none";

    const oldContainer =
        document.getElementById("comparison_old_graph");

    const newContainer =
        document.getElementById("comparison_new_graph");

    oldContainer.replaceChildren();
    newContainer.replaceChildren();

    new DAGittyController({
        canvas: oldContainer,
        graph: oldGraph,
        interactive: false,
        mutable: false
    });

    new DAGittyController({
        canvas: newContainer,
        graph: newGraph,
        interactive: false,
        mutable: false
    });
}
function closeComparisonView() {
    document.getElementById("comparison_view").style.display = "none";

    const canvas = document.getElementById("canvas");
    canvas.style.display = "block";

    requestAnimationFrame(function () {
        DAGittyControl.getView().resize();
        DAGittyControl.redraw();
    });
}
// Save the current model to local storage
async function saveCurrentModel() {
    if (!Model.dag) {
        alert("Kein Modell geladen.");
        return;
    }
    const name = prompt("Geben Sie einen Namen für die Modellversion ein:", 
        "Version " + (getAllSavedModels().length + 1));

    if (name === null) {
        return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        alert("Bitte einen Namen eingeben.");
        return;
    }
    const id = saveModel("my-model", Model.dag.toString(),trimmedName);

    showSavedGraphs();

    alert("Modell gespeichert: Version " + trimmedName);
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