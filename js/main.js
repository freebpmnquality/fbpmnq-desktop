var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.session.setMode("ace/mode/xml");

var viewer = null;

$(document).ready(function() {
    $('#zoombuttons').hide();
    $('#canvas').hide();
    $('#extra-tip').hide();

    let bpmnLinkParam = getParameterByName('doc');

    if (bpmnLinkParam) {
        $('#bpmnLink').val(bpmnLinkParam);

        loadDocumentByLink();
    }

    $('#editor').keyup(function() {
        let bpmnXML = editor.getValue();

        defineXMLNamespace(bpmnXML);
    });

    $('#expand').click(function() {
        $('#editor').height(370);

        editor.resize();
    });

    $('#collapse').click(function() {
        $('#editor').height(170);

        editor.resize();
    });

    $('#clear').click(function() {
        editor.setValue('');

        $('#bpmnLink').val('');

        window.location.href = './';
    });

    $('#paste').click(function() {
        navigator.clipboard.readText().then(clipText => {
            editor.setValue('');
            editor.insert(clipText);

            let bpmnXML = editor.getValue();

            defineXMLNamespace(bpmnXML);

            $('#bpmnLink').val('');
        });
    });

    $('#copy').click(function() {
        navigator.clipboard.writeText(editor.getValue()).then(clipText => {});
    });

    $('#zoomin').click(function() {
        resizeCanvas(50);
        analyzeDoc_Click();
    });

    $('#zoomout').click(function() {
        resizeCanvas(-50);
        analyzeDoc_Click();
    });

    $('#reload').click(function() {
        let bpmnLink = $('#bpmnLink').val();

        if (bpmnLink === null || bpmnLink === '') {
            window.location.href = './index.html';
        } else {
            window.location.href = './index.html?doc=' + bpmnLink;
        }
    });

    $('#analyzeDoc').click(function() {
        analyzeDoc_Click();
    });

    loadSample('dispatch');
});

function analyzeDoc_Click() {
    $('#zoombuttons').show();
    $('#canvas').show();
    $('#extra-tip').show();

    $('#canvas').empty();

    let bpmnXML = editor.getValue();

    let prefix = $('#bpmnPrefix').val();

    if (prefix.length > 1) {
        prefix = prefix + ':';
    }

    viewer = new BpmnJS({ container: '#canvas' });

    viewer.importXML(bpmnXML, function(err) {
        if (err) {
            $('#canvas').append('<div class="btn btn-outline-danger bpmn-warning">' + err + '</div>');
        } else {
            let canvas = viewer.get('canvas');

            canvas.zoom('fit-viewport');

            let xmlDoc = null;

            if (window.DOMParser) {
                let parser = new DOMParser();
                xmlDoc = parser.parseFromString(bpmnXML, 'text/xml');
            } else {
                xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
                xmlDoc.async = false;
                xmlDoc.loadXML(bpmnXML);
            }

            $('#recommendations').empty();

            var overlays = viewer.get('overlays');
            let elementRegistry = viewer.get('elementRegistry');

            bpmnValidation(xmlDoc, prefix, overlays, elementRegistry);
        }
    });
}

function loadSample(sample) {
    let data = samples[sample];

    editor.setValue('');
    editor.insert(data);

    $('#file-name').html("💠 " + sampleFileMapping[sample]);

    defineXMLNamespace(data);

    analyzeDoc_Click();
}

function loadDocumentByLink() {
    let bpmnLink = $('#bpmnLink').val();

    $.get(bpmnLink, function(data) {
        editor.setValue('');
        editor.insert(data);

        $('#file-name').html("💠 " + bpmnLink);

        defineXMLNamespace(data);

        analyzeDoc_Click();

        lastFileName = bpmnLink;
        document.dispatchEvent(readFileEvent);

        window.onbeforeunload = function(e) {
            return 'Are you sure you want to leave this page? The changes you made will be lost.';
        };
    });
}

function defineXMLNamespace(bpmnXML) {
    if (bpmnXML.includes('<definitions')) {
        $('#bpmnPrefix').val('');
    } else {
        let matched = bpmnXML.match(/<[a-z]*:definitions/gi);

        if (matched !== null && matched.length > 0) {
            let xmlns = matched[0];

            xmlns = xmlns.replace('<', '').replace(':definitions', '');

            $('#bpmnPrefix').val(xmlns);
        }
    }
}

function resizeCanvas(change) {
    let height = parseInt($('#canvas').height());

    if (height > 400 || (height >= 400 && change > 0)) {
        $('#canvas').height(height + change);

        let bpmnXML = editor.getValue();

        viewer.importXML(bpmnXML, function(err) {
            if (err) {
                $('#canvas').append('<div class="btn btn-outline-danger bpmn-warning">' + err + '</div>');
            } else {
                let canvas = viewer.get('canvas');

                canvas.zoom('fit-viewport');
            }
        });
    }
}

var coloredNodes = [];

function colorNode(elementId, overlays, elementRegistry, tip, elementData, isFault = true) {
    if (coloredNodes.includes(elementId)) {
        return;
    }

    const symbol = isFault ? '❌' : '✔️';
    const message = isFault ? `<span class="tiptext">${tip}</span>` : `<span class="finetext">No changes required</span>`;

    elementData.name = elementData.name.replace(/(?:\r\n|\r|\n)/g, ' ');

    overlays.add(elementId, {
        position: { top: -10, left: -10 },
        html: $('<div class="highlight-overlay">').html(`<span style="cursor: pointer;" onclick="showSuggestionModal('${tip}', '${elementData.name}', '${elementData.type}', ${elementData.incoming}, ${elementData.outgoing})">${symbol}</span>${message}`)
    });

    coloredNodes.push(elementId);
}

function showSuggestionModal(tip, name, type, incoming, outgoing) {
    $('#suggestionModal').modal('show');
    let suggestChanges = false;

    if (tip === undefined || tip === null || tip === 'null') {
        tip = '✔️ No changes required';
    } else {
        tip = `❌ ${tip}`;
        suggestChanges = true;
    }

    $('#tipText').empty();
    $('#tipText').append(tip);

    let suggestion = `<br>Element "${name}" of type ${type} has ${incoming} incoming sequence flow(s) and ${outgoing} outgoing sequence flow(s).`;

    incoming = Number.parseInt(incoming);
    outgoing = Number.parseInt(outgoing);

    if (suggestChanges) {
        // Tasks
        if (type === 'task' && incoming < 1) {
            suggestion += `<br>❗ An incoming sequence flow should be added, since tasks should not run workflow execution.`;
        }

        if (type === 'task' && incoming > 1) {
            suggestion += `<br>❗ Multiple incoming sequence flows should be merged/synchronized using a join gateway that triggers this task.`;
        }

        if (type === 'task' && outgoing < 1) {
            suggestion += `<br>❗ An outgoing sequence flow should be added, since tasks should not terminate workflow execution.`;
        }

        if (type === 'task' && outgoing > 1) {
            suggestion += `<br>❗ Multiple outgoing sequence flows should be branched/parallelized using a split gateway triggered by this task.`;
        }

        // Start events
        if (type === 'start' && outgoing < 1) {
            suggestion += `<br>❗ An outgoing sequence flow should be added, otherwise the start event is useless.`;
        }

        if (type === 'start' && outgoing > 1) {
            suggestion += `<br>❗ Multiple outgoing sequence flows should be branched/parallelized using a split gateway triggered by this start event.`;
        }

        // End events
        if (type === 'end' && incoming < 1) {
            suggestion += `<br>❗ An incoming sequence flow should be added, otherwise the end event is useless.`;
        }

        if (type === 'end' && incoming > 1) {
            suggestion += `<br>❗ Multiple incoming sequence flows should be merged/synchronized using a join gateway that triggers this end event.`;
        }

        // Intermediate events
        if (type === 'event' && incoming < 1) {
            suggestion += `<br>❗ An incoming sequence flow should be added, since intermediate events should not run workflow execution.`;
        }

        if (type === 'event' && incoming > 1) {
            suggestion += `<br>❗ Multiple incoming sequence flows should be merged/synchronized using a join gateway that triggers this intermediate event.`;
        }

        if (type === 'event' && outgoing < 1) {
            suggestion += `<br>❗ An outgoing sequence flow should be added, since intermediate events should not terminate workflow execution.`;
        }

        if (type === 'event' && outgoing > 1) {
            suggestion += `<br>❗ Multiple outgoing sequence flows should be branched/parallelized using a split gateway triggered by this intermediate event.`;
        }

        // Gateways
        if (type === 'gateway' && incoming < 1) {
            suggestion += `<br>❗ An incoming sequence flow should be added, since gateways should not run workflow execution.`;
        }

        if (type === 'gateway' && outgoing < 1) {
            suggestion += `<br>❗ An outgoing sequence flow should be added, since gateways should not terminate workflow execution.`;
        }

        if (type === 'gateway' && (incoming > 1 && outgoing > 1)) {
            suggestion += `<br>❗ This gateway should be replaced by two gateways: a join (to merge/synchronize the workflow at first) that triggers a split (to branch/parallelize the workflow after).`;
        }

        if (type === 'gateway' && (incoming === 1 && outgoing === 1)) {
            suggestion += `<br>❗ The gateway should be either split or join, otherwise the gateway is useless`;
        }
    }

    $('#tipText').append(suggestion);
}

function bpmnValidation(xmlDoc, prefix, overlays, elementRegistry) {
    coloredNodes = [];
    let processList = xmlDoc.getElementsByTagName(prefix + 'process');

    for (let k = 0; k < processList.length; k++) {
        let process = processList[k].childNodes;

        let processName = processList[k].attributes['name'] === undefined ?
            processList[k].attributes['id'].nodeValue :
            processList[k].attributes['name'].nodeValue;

        let participants = xmlDoc.getElementsByTagName(prefix + 'participant');

        for (let p = 0; p < participants.length; p++) {
            if (participants[p].attributes['processRef'] !== undefined &&
                participants[p].attributes['name'] !== undefined &&
                participants[p].attributes['processRef'].nodeValue === processList[k].attributes['id'].nodeValue) {
                processName = participants[p].attributes['name'].nodeValue;
                break;
            }
        }

        processName = processName === '' ? processList[k].attributes['id'].nodeValue : processName;

        let warnings = {
            invalidTasks: 0,
            invalidEvents: 0,
            invalidGateways: 0,

            validate: function() {
                return this.invalidTasks === 0 && this.invalidEvents === 0 && this.invalidGateways === 0;
            }
        }

        $('#recommendations').append('<div class="alert alert-light" style="padding: 5px; margin-bottom: 5px; font-size: 14px; width: 100%; text-align: left;">' +
            'Process <b>"' + processName + '"</b>' + '</div>');

        for (let i = 0; i < process.length; i++) {
            let elementData = {
                name: '',
                type: '',
                incoming: 0,
                outgoing: 0
            };

            // [start] Tasks analysis
            if (process[i].nodeName.toLowerCase().includes('task'.toLowerCase()) ||
                process[i].nodeName.toLowerCase().includes('subProcess'.toLowerCase())) {
                let name = process[i].attributes['name'] === undefined ?
                    process[i].attributes['id'].nodeValue :
                    process[i].attributes['name'].nodeValue;
                name = name === '' ? process[i].attributes['id'].nodeValue : name;

                let incoming = 0;
                let outgoing = 0;

                for (let j = 0; j < process[i].childNodes.length; j++) {
                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('incoming'.toLowerCase())) {
                        incoming++;
                    }

                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('outgoing'.toLowerCase())) {
                        outgoing++;
                    }
                }

                elementData.name = name;
                elementData.type = 'task';
                elementData.incoming = incoming;
                elementData.outgoing = outgoing;

                if (incoming !== 1 || outgoing !== 1) {
                    warnings.invalidTasks++;

                    // color invalid tasks
                    colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry,
                        'Tasks should have one incoming and one outgoing flow', elementData);
                } else {
                    // color correct tasks
                    colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry, null, elementData, false);
                }

                if (incoming === 0 && outgoing === 0) {
                    $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                        '❌ Task <b>"' + name + '"</b> does not have incoming and outgoing flows (unnecessary task)' + '</div>');
                } else {
                    if (incoming < 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Task <b>"' + name + '"</b> does not have incoming flows (implicit workflow start)' + '</div>');
                    }

                    if (incoming > 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Task <b>"' + name + '"</b> has several incoming flows (implicit merge/synchronization)' + '</div>');
                    }

                    if (outgoing < 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Task <b>"' + name + '"</b> does not have outgoing flows (implicit workflow end)' + '</div>');
                    }

                    if (outgoing > 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Task <b>"' + name + '"</b> has several outgoing flows (implicit exclusive/parallel choice)' + '</div>');
                    }
                }
            }
            // [end] Tasks analysis

            // [start] Events analysis
            if (process[i].nodeName.includes('Event')) {
                let name = process[i].attributes['name'] === undefined ?
                    process[i].attributes['id'].nodeValue :
                    process[i].attributes['name'].nodeValue;
                name = name === '' ? process[i].attributes['id'].nodeValue : name;

                let incoming = 0;
                let outgoing = 0;

                for (let j = 0; j < process[i].childNodes.length; j++) {
                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('incoming'.toLowerCase())) {
                        incoming++;
                    }

                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('outgoing'.toLowerCase())) {
                        outgoing++;
                    }
                }

                if (process[i].nodeName.toLowerCase().includes('startEvent'.toLowerCase())) {
                    elementData.name = name;
                    elementData.type = 'start';
                    elementData.incoming = incoming;
                    elementData.outgoing = outgoing;

                    if (outgoing !== 1) {
                        warnings.invalidEvents++;

                        // color invalid start events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry,
                            'Start events should have one outgoing flow', elementData);
                    } else {
                        // color correct start events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry, null, elementData, false);
                    }

                    if (outgoing < 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Start event <b>"' + name + '"</b> does not have outgoing flows (unnecessary event)' + '</div>');
                    }

                    if (outgoing > 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Start event <b>"' + name + '"</b> has several outgoing flows (implicit exclusive/parallel choice)' + '</div>');
                    }
                } else if (process[i].nodeName.toLowerCase().includes('endEvent'.toLowerCase())) {
                    elementData.name = name;
                    elementData.type = 'end';
                    elementData.incoming = incoming;
                    elementData.outgoing = outgoing;

                    if (incoming !== 1) {
                        warnings.invalidEvents++;

                        // color invalid end events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry,
                            'End events should have one incoming flow', elementData);
                    } else {
                        // color correct end events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry, null, elementData, false);
                    }

                    if (incoming < 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ End event <b>"' + name + '"</b> does not have incoming flows (unnecessary event)' + '</div>');
                    }

                    if (incoming > 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ End event <b>"' + name + '"</b> has several incoming flows (implicit merge/synchronization)' + '</div>');
                    }
                } else {
                    elementData.name = name;
                    elementData.type = 'event';
                    elementData.incoming = incoming;
                    elementData.outgoing = outgoing;

                    if (incoming !== 1 || outgoing !== 1) {
                        warnings.invalidEvents++;

                        // color invalid events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry,
                            'Intermediate events should have one incoming and one outgoing flow', elementData);
                    } else {
                        // color correct events
                        colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry, null, elementData, false);
                    }

                    if (incoming === 0 && outgoing === 0) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Intermediate event <b>"' + name + '"</b> does not have incoming and outgoing flows (unnecessary event)' + '</div>');
                    } else {
                        if (incoming < 1) {
                            $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                                '❌ Intermediate event <b>"' + name + '"</b> does not have incoming flows (implicit workflow start)' + '</div>');
                        }

                        if (incoming > 1) {
                            $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                                '❌ Intermediate event <b>"' + name + '"</b> has several incoming flows (implicit merge/synchronization)' + '</div>');
                        }

                        if (outgoing < 1) {
                            $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                                '❌ Intermediate event <b>"' + name + '"</b> does not have outgoing flows (implicit workflow end)' + '</div>');
                        }

                        if (outgoing > 1) {
                            $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                                '❌ Intermediate event <b>"' + name + '"</b> has several outgoing flows (implicit exclusive/parallel choice)' + '</div>');
                        }
                    }
                }
            }
            // [end] Events analysis

            // [start] Gateways analysis
            if (process[i].nodeName.toLowerCase().includes('gateway'.toLowerCase())) {
                let name = process[i].attributes['name'] === undefined ?
                    process[i].attributes['id'].nodeValue :
                    process[i].attributes['name'].nodeValue;
                name = name === '' ? process[i].attributes['id'].nodeValue : name;

                let incoming = 0;
                let outgoing = 0;

                for (let j = 0; j < process[i].childNodes.length; j++) {
                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('incoming'.toLowerCase())) {
                        incoming++;
                    }

                    if (process[i].childNodes[j].nodeName.toLowerCase().includes('outgoing'.toLowerCase())) {
                        outgoing++;
                    }
                }

                elementData.name = name;
                elementData.type = 'gateway';
                elementData.incoming = incoming;
                elementData.outgoing = outgoing;

                if (!((incoming === 1 && outgoing > 1) || (incoming > 1 && outgoing === 1))) {
                    warnings.invalidGateways++;

                    // color invalid gateways
                    colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry,
                        'Gateways should be either splits or joins', elementData);
                } else {
                    // color correct gateways
                    colorNode(process[i].attributes['id'].nodeValue, overlays, elementRegistry, null, elementData, false);
                }

                if (incoming === 0 && outgoing === 0) {
                    $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                        '❌ Gateway <b>"' + name + '"</b> does not have incoming and outgoing flows (unnecessary gateway)' + '</div>');
                } else {
                    if (incoming > 1 && outgoing > 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Gateway <b>"' + name +
                            '"</b> is neither split nor join: it has several incoming and outgoing flows (merge/synchronization mixed with exclusive/parallel choice)' +
                            '</div>');
                    }

                    if (incoming === 1 && outgoing === 1) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Gateway <b>"' + name +
                            '"</b> is neither split nor join: it has one incoming and one outgoing flow (redundant gateway)' +
                            '</div>');
                    }

                    if (incoming === 0) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Gateway <b>"' + name +
                            '"</b> does not have incoming flows (implicit workflow start)' +
                            '</div>');
                    }

                    if (outgoing === 0) {
                        $('#recommendations').append('<div class="btn btn-outline-danger bpmn-warning">' +
                            '❌ Gateway <b>"' + name +
                            '"</b> does not have outgoing flows (implicit workflow end)' +
                            '</div>');
                    }
                }
            }
            // [end] Gateways analysis
        }

        if (warnings.validate()) {
            $('#recommendations').append('<div class="btn btn-outline-success" style="padding: 5px; margin-bottom: 5px; font-size: 14px; width: 100%; text-align: left;">' +
                '✔️ No mistakes detected</div>');
        }
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;

    name = name.replace(/[\[\]]/g, '\\$&');

    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var readFileEvent = new CustomEvent("eReadFile");
var lastFileName = null;

function readFile(file) {
    var reader = new FileReader();

    $('#file-name').text("💠 " + file.name);

    reader.readAsText(file);

    lastFileName = file.name;

    reader.onload = function() {
        editor.setValue('');
        editor.insert(reader.result);

        let bpmnXML = editor.getValue();

        defineXMLNamespace(bpmnXML);
        $('#bpmnLink').val('');

        analyzeDoc_Click();

        document.dispatchEvent(readFileEvent);

        window.onbeforeunload = function(e) {
            return 'Are you sure you want to leave this page? The changes you made will be lost.';
        };
    };
}

function dropHandler(ev) {
    ev.preventDefault();

    $('#drop_zone').removeClass('highlight-dropzone');
    $('#dragFileName').attr('style', '');

    if (ev.dataTransfer.items) {
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                readFile(file);
            }
        }
    }
}

function dragOverHandler(ev) {
    ev.preventDefault();
    $('#drop_zone').addClass('highlight-dropzone');
    $('#dragFileName').attr('style', 'color: #fff !important;');
}

function dragOverLeave(ev) {
    ev.preventDefault();
    $('#drop_zone').removeClass('highlight-dropzone');
    $('#dragFileName').attr('style', '');
}

function dropMouseOver(ev) {
    ev.preventDefault();
    $('#drop_zone').addClass('highlight-dropzone');
    $('#dragFileName').attr('style', 'color: #fff !important;');
}

function dropMouseLeave(ev) {
    ev.preventDefault();
    $('#drop_zone').removeClass('highlight-dropzone');
    $('#dragFileName').attr('style', '');
}

function selectFile() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
        var file = e.target.files[0];
        readFile(file);
    }

    input.click();
}