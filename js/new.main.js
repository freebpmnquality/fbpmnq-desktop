var recentBPMNModels = [];
var modelNamesIndex = [];

const displayRecentBPMNModels = function(activeModelName) {
    $("#recent-models").empty();

    for (let i = 0; i < recentBPMNModels.length; i++) {
        const modelName = recentBPMNModels[i].name;
        const isActive = (activeModelName === modelName) ? "active" : "";

        $("#recent-models").append(`
            <a href="javascript:void(0);" class="list-group-item list-group-item-action ${isActive} recent-item" data-toggle="list" onclick="loadRecentBPMNModel('${modelName}');">💠 <small>${modelName}</small></a>`);
    }
};

const loadRecentBPMNModel = function(recentModelName) {
    for (let i = 0; i < recentBPMNModels.length; i++) {
        const modelName = recentBPMNModels[i].name;

        if (recentModelName === modelName) {
            lastFileName = modelName;

            if (uploadedFiles.includes(modelName)) {
                $('#file-name').text("💠 " + modelName);
            } else {
                $('#file-name').html(`💠 <a href="${modelName}" target="_blank">${modelName}</a><br><a class="badge badge-pill badge-primary" href="https://cloudfreebpmnquality.herokuapp.com/finance/index.html?doc=${modelName}" target="_blank">Estimate cost</a>`);
            }

            const loadedModel = recentBPMNModels[i].content;

            editor.setValue("");
            editor.insert(loadedModel);

            let bpmnXML = editor.getValue();

            defineXMLNamespace(bpmnXML);
            $("#bpmnLink").val("");

            analyzeDoc_Click();

            document.dispatchEvent(readFileEvent);

            break;
        }
    }
};

document.addEventListener("eReadFile", function(e) {
    const loadedModel = editor.getValue();
    const modelName = lastFileName;

    if (!modelNamesIndex.includes(modelName)) {
        recentBPMNModels.push({
            "name": modelName,
            "content": loadedModel
        });

        modelNamesIndex.push(modelName);
    }

    displayRecentBPMNModels(modelName);
});

{
    recentBPMNModels.push({
        "name": "dispatch.bpmn",
        "content": samples["dispatch"]
    });
    recentBPMNModels.push({
        "name": "recourse.bpmn",
        "content": samples["recourse"]
    });
    recentBPMNModels.push({
        "name": "credit.bpmn",
        "content": samples["credit"]
    });
    recentBPMNModels.push({
        "name": "restaurant.bpmn",
        "content": samples["restaurant"]
    });

    modelNamesIndex.push("dispatch.bpmn");
    modelNamesIndex.push("recourse.bpmn");
    modelNamesIndex.push("credit.bpmn");
    modelNamesIndex.push("restaurant.bpmn");

    displayRecentBPMNModels(recentBPMNModels[0].name);

    uploadedFiles.push("dispatch.bpmn");
    uploadedFiles.push("recourse.bpmn");
    uploadedFiles.push("credit.bpmn");
    uploadedFiles.push("restaurant.bpmn");
}