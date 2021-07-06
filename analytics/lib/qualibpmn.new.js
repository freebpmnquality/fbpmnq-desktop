/**
 * Utilities to evaluate BPMN quality.
 * 
 * @author https://github.com/andriikopp
 */
class QualiBPMNUtil {
    /**
     * GET HTTP method.
     */
    static GET_REQUEST = 'GET';

    /**
     * BPMN symbols.
     */
    static BPMN_SYMBOLS = {
        TASK: 'task',
        SUB_PROCESS: 'subProcess',
        ACTIVITY: 'activity',
        EVENT: 'Event',
        START_EVENT: 'startEvent',
        END_EVENT: 'endEvent',
        INTERMEDIATE_EVENT: 'intermediateEvent',
        GATEWAY: 'gateway'
    };

    /**
     * Warnings regarding detected errors.
     */
    static BPMN_WARNINGS = {
        TASK: 'Tasks should have one incoming and one outgoing sequence flow.',
        START_EVENT: 'Start events should have one outgoing sequence flow.',
        END_EVENT: 'End events should have one incoming sequence flow.',
        INTERMEDIATE_EVENT: 'Intermediate events should have one incoming and one outgoing sequence flow.',
        GATEWAY: 'Gateways should be either splits (one incoming and several outgoing sequence flows) or joins (several incoming and one outgoing sequence flow).'
    }

    /**
     * Error images of BPMN elements.
     */
    static ERROR_IMAGES = [
        // --------------------------------------------------------------------------------------------------------------------
        // ACTIVITY
        // --------------------------------------------------------------------------------------------------------------------

        // ACTIVITY, IN: 0, OUT: 0
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 1,
            redundant: 0
        },

        // ACTIVITY, IN: 0, OUT: 1
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                1, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 1,
            redundant: 0
        },

        // ACTIVITY, IN: 1, OUT: 0
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                1, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 1,
            redundant: 0
        },

        // ACTIVITY, IN: 0, OUT: > 1
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 1,
            redundant: 1
        },

        // ACTIVITY, IN: > 1, OUT: 0
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 1,
            redundant: 1
        },

        // ACTIVITY, IN: 1, OUT: > 1
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                1, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 0,
            redundant: 1
        },

        // ACTIVITY, IN: > 1, OUT: 1
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                1, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 0,
            redundant: 1
        },

        // ACTIVITY, IN: > 1, OUT: > 1
        {
            image: [
                1, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.TASK,
            incomplete: 0,
            redundant: 1
        },

        // --------------------------------------------------------------------------------------------------------------------
        // GATEWAY
        // --------------------------------------------------------------------------------------------------------------------

        // GATEWAY, IN: 0, OUT: 0
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: 0, OUT: 1
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                1, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: 0, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: 1, OUT: 0
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                1, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: > 1, OUT: 0
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: 1, OUT: 1
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                1, // incoming === 1
                1, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 1,
            redundant: 0
        },

        // GATEWAY, IN: > 1, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                1, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.GATEWAY,
            incomplete: 0,
            redundant: 1
        },

        // --------------------------------------------------------------------------------------------------------------------
        // START EVENT
        // --------------------------------------------------------------------------------------------------------------------

        // START EVENT, IN: 0, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                1, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.START_EVENT,
            incomplete: 1,
            redundant: 0
        },

        // START EVENT, IN: 0, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                1, // START_EVENT
                0, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.START_EVENT,
            incomplete: 0,
            redundant: 1
        },

        // --------------------------------------------------------------------------------------------------------------------
        // END EVENT
        // --------------------------------------------------------------------------------------------------------------------

        // END EVENT, IN: 0, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                1, // END_EVENT
                0, // INTERMEDIATE_EVENT

                1, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.END_EVENT,
            incomplete: 1,
            redundant: 0
        },

        // END EVENT, IN: > 1, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                1, // END_EVENT
                0, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.END_EVENT,
            incomplete: 0,
            redundant: 1
        },

        // --------------------------------------------------------------------------------------------------------------------
        // INTERMEDIATE EVENT
        // --------------------------------------------------------------------------------------------------------------------

        // INTERMEDIATE EVENT, IN: 0, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                1, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 1,
            redundant: 0
        },

        // INTERMEDIATE EVENT, IN: 0, OUT: 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                1, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 1,
            redundant: 0
        },

        // INTERMEDIATE EVENT, IN: 1, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                1, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 1,
            redundant: 0
        },

        // INTERMEDIATE EVENT, IN: 0, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                1, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 1,
            redundant: 1
        },

        // INTERMEDIATE EVENT, IN: > 1, OUT: 0
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                0, // incoming === 0
                1, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 1,
            redundant: 1
        },

        // INTERMEDIATE EVENT, IN: 1, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                1, // incoming === 1
                0, // outgoing === 1

                0, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 0,
            redundant: 1
        },

        // INTERMEDIATE EVENT, IN: > 1, OUT: 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                1, // outgoing === 1

                1, // incoming > 1
                0 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 0,
            redundant: 1
        },

        // INTERMEDIATE EVENT, IN: > 1, OUT: > 1
        {
            image: [
                0, // ACTIVITY

                0, // GATEWAY

                0, // START_EVENT
                0, // END_EVENT
                1, // INTERMEDIATE_EVENT

                0, // incoming === 0
                0, // outgoing === 0

                0, // incoming === 1
                0, // outgoing === 1

                1, // incoming > 1
                1 // outgoing > 1
            ],
            description: this.BPMN_WARNINGS.INTERMEDIATE_EVENT,
            incomplete: 0,
            redundant: 1
        }
    ];

    /**
     * Returns the BPMN code by URL.
     */
    static getBPMNByURL(url) {
        return $.ajax({
            type: this.GET_REQUEST,
            url: url,
            async: false
        }).responseText;
    }

    /**
     * Translates BPMN 2.0 XML to JSON document.
     */
    static translateBPMNToJSON(bpmn) {
        const converter = new X2JS();

        return converter.xml_str2json(bpmn);
    }

    /**
     * Extracts process definitions from the BPMN JSON.
     */
    static getProcesses(bpmnJSON) {
        return bpmnJSON.definitions.process;
    }

    /**
     * Get generic element's type.
     */
    static getGenericType(typeName) {
        if (typeName.toLowerCase().includes(this.BPMN_SYMBOLS.TASK.toLowerCase()) ||
            typeName.toLowerCase().includes(this.BPMN_SYMBOLS.SUB_PROCESS.toLowerCase())) {

            return this.BPMN_SYMBOLS.ACTIVITY;
        } else if (typeName.includes(this.BPMN_SYMBOLS.EVENT)) {
            if (typeName.toLowerCase().includes(this.BPMN_SYMBOLS.START_EVENT.toLowerCase()) ||
                typeName.toLowerCase().includes(this.BPMN_SYMBOLS.END_EVENT.toLowerCase())) {

                return typeName;
            } else {

                return this.BPMN_SYMBOLS.INTERMEDIATE_EVENT;
            }
        } else if (typeName.toLowerCase().includes(this.BPMN_SYMBOLS.GATEWAY.toLowerCase())) {

            return this.BPMN_SYMBOLS.GATEWAY;
        }

        return undefined;
    }

    /**
     * Created the element's binary image.
     */
    static getElementImage(element) {
        return [
            // Type features
            element.type === this.BPMN_SYMBOLS.ACTIVITY ? 1 : 0,

            element.type === this.BPMN_SYMBOLS.GATEWAY ? 1 : 0,

            element.type === this.BPMN_SYMBOLS.START_EVENT ? 1 : 0,
            element.type === this.BPMN_SYMBOLS.END_EVENT ? 1 : 0,
            element.type === this.BPMN_SYMBOLS.INTERMEDIATE_EVENT ? 1 : 0,

            // Connection features
            element.incoming === 0 ? 1 : 0,
            element.outgoing === 0 ? 1 : 0,

            element.incoming === 1 ? 1 : 0,
            element.outgoing === 1 ? 1 : 0,

            element.incoming > 1 ? 1 : 0,
            element.outgoing > 1 ? 1 : 0
        ];
    }

    /**
     * Returns flat element from parsed process element.
     */
    static getFlatProcessElement(element, type) {
        const object = {
            id: element._id,
            name: element._name === undefined ? element._id : element._name,
            type: this.getGenericType(type),
            incoming: element.incoming === undefined ? 0 : Array.isArray(element.incoming) ? element.incoming.length : 1,
            outgoing: element.outgoing === undefined ? 0 : Array.isArray(element.outgoing) ? element.outgoing.length : 1
        };

        object.image = this.getElementImage(object);

        return object;
    }

    /**
     * Extracts flat object of process elements.
     */
    static getFlatProcessElements(process) {
        const flatProcess = {
            name: process._name === undefined ? process._id : process._name,
            elements: []
        };

        for (const key in process) {
            if (!Array.isArray(process[key])) {
                const element = this.getFlatProcessElement(process[key], key);

                if (element.type !== undefined) {
                    flatProcess.elements.push(element);
                }
            } else {
                for (const i in process[key]) {
                    const element = this.getFlatProcessElement(process[key][i], key);

                    if (element.type !== undefined) {
                        flatProcess.elements.push(element);
                    }
                }
            }
        }

        return flatProcess;
    }

    /**
     * Returns distance between two process symbol images.
     */
    static getDistance(x, y) {
        let sum = 0;

        for (let i = 0; i < x.length; i++) {
            sum += Math.abs(x[i] - y[i]);
        }

        return sum;
    }

    /**
     * Evaluate business process.
     */
    static evaluateProcess(process) {
        for (const i in process.elements) {
            process.elements[i].evaluation = [];

            for (const j in this.ERROR_IMAGES) {
                const similarity = this.getDistance(process.elements[i].image, this.ERROR_IMAGES[j].image);

                if (similarity === 0) {
                    process.elements[i].evaluation.push({
                        image: this.ERROR_IMAGES[j],
                        similarity: similarity,
                    });
                }
            }
        }

        return process;
    }

    /**
     * Returns the linquistic quality value according to the Harrington scale.
     */
    static getLinguisticQuality(value) {
        return value >= 0.8 ? 'high' :
            value >= 0.63 ? 'medium' :
            'low';
    }

    /**
     * Returns the syntactic validity, completeness, and redundancy.
     */
    static measureSyntacticQuality(process) {
        let totalSymbols = process.elements.length;

        let invalidSymbols = 0;

        let incompleteSymbols = 0;
        let redundantSymbols = 0;

        for (const i in process.elements) {
            if (process.elements[i].evaluation.length > 0) {
                invalidSymbols++;

                incompleteSymbols += process.elements[i].evaluation[0].image.incomplete;
                redundantSymbols += process.elements[i].evaluation[0].image.redundant;
            }
        }

        const _validity = 1 - (invalidSymbols / totalSymbols);
        const _completeness = 1 - (incompleteSymbols / totalSymbols);
        const _redundancy = redundantSymbols / totalSymbols;

        return {
            validity: {
                crisp: _validity,
                linguistic: this.getLinguisticQuality(_validity)
            },
            completeness: {
                crisp: _completeness,
                linguistic: this.getLinguisticQuality(_completeness)
            },
            redundancy: {
                crisp: _redundancy,
                linguistic: this.getLinguisticQuality(_redundancy)
            }
        };
    }
}