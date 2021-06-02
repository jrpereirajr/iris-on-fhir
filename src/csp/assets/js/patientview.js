$(document).ready(function () {
    getFHIRClient()
        .then(client => {
            getPatientDetails(client)
                .then(bundle => {
                    console.log("getFHIRClientBundle", bundle);
                    return;
                })
                .then(getEncounters)
        })
        .catch(console.error);
});

function getPatientDetails() {
    return FHIR.oauth2.ready()
        .then(client => {
            const query = new URLSearchParams();
            query.set("_sort", "-_lastUpdated");

            const urlParameters = new URLSearchParams(window.location.search);
            const patientId = urlParameters.get("pid");
            // query.set("_sort", "name");
            // query.set("_count", 10);
            return client.request(`Patient/${patientId}`)
                .then((bundle) => {
                    const patientName = bundle.name[0].given[0] + " " + bundle.name[0].family
                    $("#idPatientName").text(`${patientName}`);
                    $("#idPatientID").text("Patient ID: " + bundle.id);
                    $("#idSSN").text(bundle.identifier[2].value);
                    $("#idDOB").text(bundle.birthDate);
                    $("#idGender").text(bundle.gender);
                    $("#idPhone").text(bundle.telecom[0].value);
                    $("#idAddress").text(bundle.address[0].line[0]);
                    $("#idCity").text(bundle.address[0].city + ", " + bundle.address[0].state);
                    $("#idCountry").text(bundle.address[0].country);
                })
                .catch((err) => {
                    // Error responses
                    if (err.status) {
                        console.log(err);
                        console.log('Error', err.status);
                    }
                    // Errors
                    if (err.data && err.data) {
                        console.log('Error', err.data);
                    }
                });
        });
}

function getEncounters() {
    return FHIR.oauth2.ready()
        .then(client => {
            const urlParameters = new URLSearchParams(window.location.search);
            const patientId = urlParameters.get("pid");

            const query = new URLSearchParams();
            query.set("patient", `${patientId}`)
            // query.set("_sort", "-_lastUpdated");
            query.set("_sort", "-_id");
            query.set("_count", 3);

            return client.request(`Encounter?${query}`)
                .then((bundle) => {
                    // console.log("getEncounters",bundle);
                    const arrEncounter = bundle.entry.reverse();
                    for (var i = 0; i < arrEncounter.length; i++) {
                        console.log(i, arrEncounter[i]);
                        let reasonText = "";
                        let dtPeriod = "";
                        let strServiceProvider = "";

                        if (arrEncounter[i].resource.hasOwnProperty("reasonCode") === false) {
                            if (arrEncounter[i].resource.hasOwnProperty("type") === true) {
                                reasonText = arrEncounter[i].resource.type[0].text;
                            }
                        } else {
                            reasonText = arrEncounter[i].resource.reasonCode[0].coding[0].display;
                            console.log(i, arrEncounter[i].resource.reasonCode[0].coding[0].display, arrEncounter[i].resource.period.start, arrEncounter[i].resource.serviceProvider.display);
                        }

                        dtPeriod = (arrEncounter[i].resource.period.start).split("T")[0];


                        if (arrEncounter[i].resource.hasOwnProperty("serviceProvider") === true) {
                            strServiceProvider = arrEncounter[i].resource.serviceProvider.display;
                            // console.log(i,arrEncounter[i].resource.type[0].text,arrEncounter[i].resource.period.start,arrEncounter[i].resource.serviceProvider.display);
                        }

                        let liTimeline1 = '<li class="timeline-item"><span class="timeline-point timeline-point-indicator"></span><div class="timeline-event"><div class="d-flex justify-content-between flex-sm-row flex-column mb-sm-0 mb-1">'
                        let liTimeline2 = `<h6>${reasonText}</h6><span class="timeline-event-time">${dtPeriod}</span></div>`
                        let liTimeline3 = `<p>${strServiceProvider}</p></div></li>`
                        let liTimeline = liTimeline1.concat(liTimeline2).concat(liTimeline3);

                        $("#idTimeline").append(liTimeline);
                    }
                })
                .catch((err) => {
                    // Error responses
                    if (err.status) {
                        console.log(err);
                        console.log('Error', err.status);
                    }
                    // Errors
                    if (err.data && err.data) {
                        console.log('Error', err.data);
                    }
                });
        });
}

function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}