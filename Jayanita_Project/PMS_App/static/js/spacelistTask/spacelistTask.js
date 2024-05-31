//.....##############################.....Controlmodule js code........#########################################
//get SpaceListId from Query Parameter
const urlParams = new URLSearchParams(window.location.search);
const SpclId = urlParams.get('id');

//get RoleId from localStorage
var RoleId = localStorage.getItem('roleId');

let editbutton = document.getElementById('editbutton');
let Addbutton = document.getElementById('Addbutton');
var ID=document.getElementById('IId').value

//define variable globally
var IsActive
var stageId;
var selectedRowData = null;
var gridOptions;


//get all data of AG Grid single row On click of any row
function onRowClicked(event) {
    selectedRowData = event.data;
    console.log(selectedRowData);
}


// Function to fetch data and update AG Grid
function fetchDataAndUpdateGrid() {
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/api/GetCustomeTblData?SpaceListId=' + SpclId + '&Id=0', options)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorResponse => {
                    throw new Error(errorResponse.Msg);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Fields data...", data);

            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                alert("Fetched data is empty or null.");
                return;
            }

            // Define the fields to be excluded
            const excludeFields = ['Id', 'spaceListId', 'stageId', 'createdBy', 'updatedBy'];
            console.log("excludeFields data...", excludeFields);
            // Dynamically create column definitions based on the keys of the first data object, excluding specified fields
            const columnDefs = Object.keys(data[0])
                .filter(key => !excludeFields.includes(key))
                .map(key => ({
                    headerName: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the header name
                    field: key,
                    sortable: true,
                    filter: true,
                    resizable: true,
                    editable: false,
                }));

            // Set new column definitions and row data to the existing grid
            gridOptions.api.setColumnDefs(columnDefs);
            gridOptions.api.setRowData(data);
        })
        .catch(error => {
            console.error('Error fetching or setting data:', error);
            alert(error.message); // Show the error message in an alert
        });
}

//calling fetchDataAndUpdateGrid() in this
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector('#myLead_master');
    gridOptions = {
        columnDefs: [], // Initialize with an empty array
        defaultColDef: {
            flex: 1,
            minWidth: 130,
            editable: false,
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true,
            enableValue: true,
            enableRowGroup: true,
            enablePivot: true,
        },
        rowSelection: 'single',
        animateRows: true,
        onRowClicked: onRowClicked // Attach row click event handler
    };
    new agGrid.Grid(gridDiv, gridOptions);

    // Call the function to fetch data and initialize AG Grid
    fetchDataAndUpdateGrid();
});

//this function is get all data of CustomFields
function fetchCustomFields() {
debugger;
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    return fetch('/pms/api/ListCustomeFields?SpaceListId=' + SpclId + '&Id=0', options)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorResponse => {
                    throw new Error(errorResponse.Msg);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("fetchCustomFields",data)
            generateFormFields(data);
        })
        .catch(error => {
            console.error('Error fetching or setting data:', error);
            alert(error.message); // Show the error message in an alert
        });
}

function convertMultiSelectFieldListValue(fieldListValue) {
    // Parse the original fieldListValue string to get the object
    const parsedValue = JSON.parse(fieldListValue);

    // Check if the parsed value is an array and has the expected structure
    if (Array.isArray(parsedValue) && parsedValue.length > 0 && parsedValue[0].text && parsedValue[0].value) {
        // Split the comma-separated values
        const textValues = parsedValue[0].text.split(/\W+/);
        const valueValues = parsedValue[0].value.split(/\W+/);

        // Map the values to the desired format
        const convertedValue = textValues.map((text, index) => {
            return {
                text: text.trim(),
                value: valueValues[index].trim()
            };
        });

        // Return the JSON string of the converted value
        return JSON.stringify(convertedValue);
    } else {
        throw new Error('Invalid fieldListValue format');
    }
}


//generateForm for CustomFields using fetchCustomFields() data
function generateFormFields(fieldsData) {
    const container = document.getElementById('dynamicFieldsContainer');
    container.innerHTML = ''; // Clear existing fields

    fieldsData.forEach(field => {
        if (!field.isActive) {
            return; // Skip fields that are not active
        }

        let fieldElement;

        switch (field.typename) {
            case 'button':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <button type="button" class="btn btn-primary" id="${field.name}" name="${field.name}">
                                ${field.lable}
                            </button>
                        </div>
                    </div>
                `;
                break;

            case 'checkbox':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3 w-100 d-flex flex-column">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="checkbox" class="form-check-input" id="${field.name}" name="${field.name}">
                            <div class="invalid-feedback">
                                Check the ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'date':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="date" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please select a date.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'number':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="number" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please enter the ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'radio':
                const radioOptions = JSON.parse(field.fieldListValue).map(option => `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${field.name}" id="${field.name}_${option.value}" value="${option.value}">
                        <label class="form-check-label" for="${field.name}_${option.value}">
                            ${option.text}
                        </label>
                    </div>
                `).join('');
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label class="form-label">${field.lable}:</label>
                            ${radioOptions}
                            <div class="invalid-feedback">
                                Please select an option.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'range':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="range" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please select a range.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'submit':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <button type="submit" class="btn btn-primary" id="${field.name}" name="${field.name}">
                                ${field.lable}
                            </button>
                        </div>
                    </div>
                `;
                break;

            case 'text':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="text" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please enter the ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'email':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="email" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please enter a valid email.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'textarea':
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <textarea class="form-control" id="${field.name}" name="${field.name}" rows="3" ${field.isRequired ? 'required' : ''}></textarea>
                            <div class="invalid-feedback">
                                Please enter the ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'SingleSelect':
                const singleSelectOptions = JSON.parse(field.fieldListValue).map(option => `<option value="${option.value}">${option.text}</option>`).join('');
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <select class="form-select" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                                <option value="">Select Option</option>
                                ${singleSelectOptions}
                            </select>
                            <div class="invalid-feedback">
                                Please select ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'SQLQuery':
                // Implement SQLQuery handling here
                break;

            case 'MultiSelect':
                 let a = JSON.parse(field.fieldListValue);
//                 console.log("field.fieldListValue length:", a.length,a[0].value);
                if (a.length==1){
                   // Convert the fieldListValue to the desired format
                    const convertedFieldListValue = convertMultiSelectFieldListValue(field.fieldListValue);

                    // Generate the options
                    const multiSelectOptions = JSON.parse(convertedFieldListValue).map(option => `<option value="${option.value}">${option.text}</option>`).join('');

                    // Generate the field element
                    fieldElement = `
                        <div class="col-lg-4 col-sm-6 col-12">
                            <div class="mb-3">
                                <label for="${field.name}" class="form-label">${field.lable}:</label>
                                <select multiple class="form-select" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                                    ${multiSelectOptions}
                                </select>
                                <div class="invalid-feedback">
                                    Please select ${field.lable}.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                }else{
                   const multiSelectOptions = JSON.parse(field.fieldListValue).map(option => `<option value="${option.value}">${option.text}</option>`).join('');

                    fieldElement = `
                        <div class="col-lg-4 col-sm-6 col-12">
                            <div class="mb-3">
                                <label for="${field.name}" class="form-label">${field.lable}:</label>
                                <select multiple class="form-select" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                                    ${multiSelectOptions}
                                </select>
                                <div class="invalid-feedback">
                                    Please select ${field.lable}.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                }



            default:
                fieldElement = `
                    <div class="col-lg-4 col-sm-6 col-12">
                        <div class="mb-3">
                            <label for="${field.name}" class="form-label">${field.lable}:</label>
                            <input type="text" class="form-control" id="${field.name}" name="${field.name}" ${field.isRequired ? 'required' : ''}>
                            <div class="invalid-feedback">
                                Please enter the ${field.lable}.
                            </div>
                        </div>
                    </div>
                `;
                break;
        }

        container.insertAdjacentHTML('beforeend', fieldElement);
    });
}

// Function to fill the form with data from selected row
function fillFormWithRowData(rowData) {
console.log("rowData",rowData);
debugger;
    for (const key in rowData) {
        if (rowData.hasOwnProperty(key)) {
            const field = document.getElementById(key);
            if (field) {
                switch (field.type) {
                    case 'checkbox':
                        field.checked = rowData[key];
                        break;
                    case 'radio':
                        const radioField = document.querySelector(`input[name="${key}"][value="${rowData[key]}"]`);
                        if (radioField) {
                            radioField.checked = true;
                        }
                        break;
                    case 'select-one':
                        field.value = rowData[key];
                        break;
                    case 'select-multiple':
                        const values = rowData[key].split(/\W+/).map(item => item.trim());
                        Array.from(field.options).forEach(option => {
                            option.selected = values.includes(option.value);
                        });
                        break;
                    default:
                        field.value = rowData[key];
                        break;
                }
            }
        }
    }
}


// When click on edit button
function openEditModal() {
    if (selectedRowData) {
        fetchCustomFields().then(() => {
            fillFormWithRowData(selectedRowData);
            ID = selectedRowData.Id; // Set the hidden ID field
            stageId = selectedRowData.stageId;
            $('#activeOrder').prop('checked', selectedRowData.isActive);
            $('#inactiveOrder').prop('checked', !selectedRowData.isActive);
            highlightStage(stageId); // Highlight the stage based on stageId
            $('.myMOdalOpenAddEdit').modal('show'); // Use jQuery to show the modal
        }).catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('No row selected');
        alert("Please Select any Row..!!!");
    }
}

// When Click on Add button
function openAddModal() {
    fetchCustomFields().then(() => {
        document.getElementById('AddEditCustomFldForm').reset(); // Clear the form for new entry
        ID = ''; // Clear the hidden ID field
        document.getElementById('IId').value = '';
        highlightFirstStage(); // Highlight the first stage
        $('.myMOdalOpenAddEdit').modal('show'); // Use jQuery to show the modal
    }).catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display stage data
    fetchStageData();
});

// Function to fetch Stage Data API
function fetchStageData() {
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/api/Stages', options)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorResponse => {
                    throw new Error(errorResponse.Msg);
                });
            }
            return response.json();
        })
        .then(data => {
            updateStageLinks(data);
        })
        .catch(error => {
            console.error('Error fetching or setting data:', error);
            alert(error.message); // Show the error message in an alert
        });
}

// Function to generate stage links HTML
function generateStageLinksHTML(stages) {
    return stages
        .filter(stage => stage.isActive)
        .map((stage, index) => `
            <button class="headerSingleStage ${index === 0 ? 'currentStage' : ''}" data-id="${stage.id}">
                <div class="singleStageArrow">
                    <span>${stage.name}</span>
                </div>
            </button>
        `).join('');
}

// Function to update the container with generated stage links
function updateStageLinks(stages) {
    const container = document.getElementById('TaskStageListOuter');
    container.innerHTML = generateStageLinksHTML(stages);
    addClickEventToStages();
}

// Function to add click event to each stage link
function addClickEventToStages() {
    const stageLinks = document.querySelectorAll('.headerSingleStage');
    stageLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove 'selected' class from all stage links
            stageLinks.forEach(link => link.classList.remove('currentStage'));
            // Add 'selected' class to the clicked stage link
            this.classList.add('currentStage');
            stageId = this.getAttribute('data-id');
            console.log('Stage ID:', stageId);
        });
    });
}

// Function to highlight the first stage
function highlightFirstStage() {
    const stageLinks = document.querySelectorAll('.headerSingleStage');
    stageLinks.forEach(link => link.classList.remove('currentStage'));
    if (stageLinks.length > 0) {
        stageLinks[0].classList.add('currentStage');
    }
}

// Function to highlight the stage based on the given stageId
function highlightStage(stageId) {
    const stageLinks = document.querySelectorAll('.headerSingleStage');
    stageLinks.forEach(link => {
        if (link.getAttribute('data-id') == stageId) {
            link.classList.add('currentStage');
        } else {
            link.classList.remove('currentStage');
        }
    });
}

//When Click on Submit button--- this function handle add And edit Data
function handleFormSubmit(event) {
    debugger;
    event.preventDefault(); // Prevent the default form submission
    const form = event.target;
    const formData = new FormData(form);
    const formValues = {};

    formData.forEach((value, key) => {
        const element = form.elements[key];

        if (element && element.type === 'checkbox') {
            formValues[key] = element.checked; // Store true if checked, false if not
        } else if (element && element.multiple) {
            // Check if the element is a multi-select
            if (!formValues[key]) {
                formValues[key] = [];
            }
            formValues[key].push(value);
        } else if (formValues[key]) {
            if (!Array.isArray(formValues[key])) {
                formValues[key] = [formValues[key]];
            }
            formValues[key].push(value);
        } else {
            formValues[key] = value;
        }
    });

    // Convert multi-select arrays to comma-separated strings
    Object.keys(formValues).forEach(key => {
        if (Array.isArray(formValues[key])) {
            formValues[key] = formValues[key].join(", ");
        }
    });

//    console.log('Form Values:', formValues);

    var currentDate = new Date().toISOString();
    const isEdit = ID; // Check if ID is present
    let payload;

    if (isEdit) {
        payload = {
            ...formValues,
            "id": ID,
            "spaceListId": SpclId,
            "stageId": stageId,
            "updatedBy": localStorage.getItem('id'),
            "updatedOn": currentDate,
            "isActive": $('input[name="inOrder"]:checked').val() === 'active',
        };
    } else {
        payload = {
            ...formValues,
            "spaceListId": SpclId,
            "stageId": 1,
            "createdBy": localStorage.getItem('id'),
            "createdOn": currentDate,
            "isActive": $('input[name="inOrder"]:checked').val() === 'active',
        };
    }

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = isEdit ? '/pms/api/UpdateCustomTblData' : '/pms/api/InsertCustomTblData'; // Use different URLs for add and edit
    const method = 'POST'; // Use POST for both add and edit

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(jsonData => {
        alert(jsonData.Msg);
        console.log(jsonData.Msg);
        console.log('Updating AG Grid...');
        // Update the AG Grid after successful save
        fetchDataAndUpdateGrid();

    })
    .catch(error => {
        console.error('Error submitting form:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('AddEditCustomFldForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addModalButton').addEventListener('click', openAddModal);
    fetchStageData();
});





// OTR dynamic form js
//json OTRdata
const OTRformData = [
    { "label": "Name", "type": "text", "required": true, "readonly": false, "class": "col-lg-6", "inputClass": "form-control", "value": "", "list": []  },
    { "label": "Email", "type": "email", "required": true, "readonly": false, "class": "col-lg-6", "inputClass": "form-control", "value": "", "list": [] },
    { "label": "Subscribe to newsletter", "type": "checkbox", "required": false, "readonly": false, "class": "col-lg-6", "inputClass": "form-check-input", "value": "", "list": [] },
    { "label": "Preferred Language", "type": "radio", "required": true, "readonly": false, "class": "col-lg-6", "inputClass": "form-check-input", "value": "", "list": ["English", "Spanish", "French"] },
    { "label": "Joining Date", "type": "date", "required": true, "readonly": false, "class": "col-lg-6", "inputClass": "form-control","value": "2023/12/24", "list": [] },
    { "label": "Gender", "type": "select", "required": true, "readonly": false, "class": "col-lg-6", "inputClass": "form-select", "value": "", "list": ["Male", "Female", "Other"] },
    { "label": "Message", "type": "textarea", "required": true, "readonly": false, "class": "col-lg-12", "inputClass": "form-control", "value": "", "list": [] }
];

function OTRgenerateForm(OTRdata) {
    const OTRformContainer = document.getElementById('Dynamic-OTRform-container');

    OTRdata.forEach(field => {
        const OTRlabel = document.createElement('label');
        OTRlabel.className = 'w-100';
        OTRlabel.textContent = field.label;

        let OTRinput;

        if (field.type === 'select') {
            OTRinput = document.createElement('select');
            OTRinput.className = field.inputClass;
            field.list.forEach(option => {
                const OTRoptionElement = document.createElement('option');
                OTRoptionElement.value = option;
                OTRoptionElement.textContent = option;
                OTRinput.appendChild(OTRoptionElement);
            });
        } else if (field.type === 'radio') {
            OTRinput = document.createElement('div');
            OTRinput.className = 'd-flex justify-content-between align-items-center';
            field.list.forEach(option => {
                OTRradioinputBox = document.createElement('div');
                OTRradioinputBox.className = 'mb-2';
                const OTRradioLabel = document.createElement('label');
                OTRradioLabel.className = 'form-check-label ms-2';
                OTRradioLabel.textContent = option;

                const OTRradioInput = document.createElement('input');
                OTRradioInput.type = 'radio';
                OTRradioInput.className = field.inputClass;
                OTRradioInput.name = field.label; // Ensure they share the same name to group them
                OTRradioInput.value = option;

                OTRradioinputBox.appendChild(OTRradioInput);
                OTRradioinputBox.appendChild(OTRradioLabel);
                OTRinput.appendChild(OTRradioinputBox);
            });
        } else if (field.type === 'checkbox') {
            OTRinput = document.createElement('input');
            OTRinput.type = 'checkbox';
            OTRinput.className = field.inputClass;
            OTRinput.value = 'checked';
        } else if (field.type === 'textarea') {
            OTRinput = document.createElement('textarea');
            OTRinput.className = field.inputClass;
        } else {
            OTRinput = document.createElement('input');
            OTRinput.type = field.type;
            OTRinput.className = field.inputClass;
        }

        OTRinput.required = field.required;
        OTRinput.readOnly = field.readonly;
        OTRinput.value = field.value;

        const OTRformGroup = document.createElement('div');
        OTRformGroup.className = `form-group ${field.class}`;
        OTRformGroup.appendChild(OTRlabel);
        OTRformGroup.appendChild(OTRinput);
        OTRformContainer.appendChild(OTRformGroup);
    });
}

OTRgenerateForm(OTRformData);



//chatscreen

// Function to handle file selection and preview
function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.style.maxWidth = '100%';
        preview.style.maxHeight = '150px'; // Adjust height as needed
        document.getElementById('chat-activity').appendChild(preview);
    };

    reader.readAsDataURL(file);
}

// Attachment button event listener
document.getElementById('attachBtn').addEventListener('click', function () {
    document.getElementById('fileInput').click(); // Simulate click on hidden file input
});

// File input change event listener
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// Function to add a new message or activity log to the chat
function addChatActivity(content, sender, type) {
    const chatActivity = document.getElementById('chat-activity');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-container');
    if (type === 'message') {
        messageDiv.classList.add(sender === 'You' ? 'right' : 'left');
        const bubbleClass = sender === 'You' ? 'right' : 'left';
        messageDiv.innerHTML = `
            <div class="message-bubble ${bubbleClass}">
              ${content}
            </div>
              <span class="text-muted float-end">${new Date().toLocaleTimeString()}</span>
          `;
    } else if (type === 'activity') {
        messageDiv.innerHTML = `
            <em>${content}</em>
            <span class="text-muted float-end">${new Date().toLocaleTimeString()}</span>
          `;
    }
    chatActivity.appendChild(messageDiv);
    chatActivity.scrollTop = chatActivity.scrollHeight; // Scroll to bottom
}

// Event listener for Send button
document.getElementById('sendBtn').addEventListener('click', function () {
    const message = document.getElementById('messageInput').value.trim();
    if (message !== '') {
        addChatActivity(message, 'You', 'message');
        document.getElementById('messageInput').value = ''; // Clear input field
    }
});

// Example usage
addChatActivity('User1 joined the chat', '', 'activity');
addChatActivity('User2 changed their name to John', '', 'activity');
addChatActivity('Hello there!', 'User1', 'message');
addChatActivity('Hi! How can I help you?', 'User2', 'message');
















function BackToList(){
debugger;
//    var queryString = "?moduleID=" + ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "dashbord"

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}

