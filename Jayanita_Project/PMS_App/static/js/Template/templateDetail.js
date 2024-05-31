//.....##############################.....spaceList module js code........#########################################
debugger;
let editbutton=document.getElementById('editbutton');
let Addbutton=document.getElementById('Addbutton');
var RoleId = localStorage.getItem('roleId');
var selectedRowData;
var gridOptions;
var queryParams = new URLSearchParams(window.location.search);
var selectedTemplateId = queryParams.get("id");
var ModuleID = queryParams.get("M");

function ModuleActionRight(){

    debugger;
       // Make an AJAX request to fetch the data from your API
        debugger;
        let options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem('token_') // Include token in the request headers
            },
        };
        fetch('/pms/api/Users/ModuleAction?roleId='+RoleId+'&moduleId='+ModuleID, options)
        .then(response => {

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {

            // Check if data is empty or null
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            console.log(data);
            data.forEach(item => {

              console.log("item",item)
              if (item.Code=="E" && item.IsApplicable!=true){
                editbutton.style.display="none"
              }
              else if(item.Code=="A" && item.IsApplicable!=true){
                Addbutton.style.display="none"
              }
            })
        })
        .catch(error => {
            console.error('Error fetching or setting data:', error);
            alert(error.message); // Show the error message in an alert
        });
    }
ModuleActionRight()



// Function to handle row click event in AG Grid
function onRowClicked(event) {
debugger;
    // Get the selected row data
    selectedRowData = event.data;
    console.log(selectedRowData);
}

    // Function to open the edit modal and pre-fill fields with selected row data
function openEditModal() {
    debugger;
    // Ensure the element exists before trying to hide it
    var statusField = document.getElementById('StatusField');
    if (statusField) {
        $(statusField).show(); // Using jQuery to hide the element
    }
    // Check if a row is selected
    if (selectedRowData) {

        // Pre-fill the edit form fields with the selected row data
        $('#IId').val(selectedRowData.id);
        $('#TemplateId').val(selectedRowData.templateId);
        $('#ControlId').val(selectedRowData.controlId);
        $('#ValueTypeId').val(selectedRowData.valueTypeId);
        $('#LabelName').val(selectedRowData.labelName);
        $('#Width').val(selectedRowData.width);
        $('#IsEnable').prop('checked', selectedRowData.isEnable);
        $('#IsVisible').prop('checked', selectedRowData.isVisible);
        $('#IsRequired').prop('checked', selectedRowData.isRequired);
        $('#DefaultValue').val(selectedRowData.defaultValue);
        $('#InOrder').val(selectedRowData.inOrder);
        $('#RoleIdVisibleId').val(selectedRowData.roleIdVisible);

         // Pre-select the checkbox based on the value of "isActive"
        $('#activeOrder').prop('checked', selectedRowData.isActive);
        $('#inactiveOrder').prop('checked', !selectedRowData.isActive);
        // Open the edit modal
        $('.myMOdalOpenAddEdit').modal('show');

    }
    else {
        alert('Please select a row to edit.');
    }
}

// Function to clear form fields after saving data
function clearFormFields() {
debugger;
    // Clear form fields for adding data
//    $('#AddEditSpaceListStage input[type=text], #moduleForm textarea').val()="";
    $('#templateDetailForm input[type=text]').val("");
    $('#templateDetailForm input[type=number]').val(null);
    $('#templateDetailForm input[type=radio]').prop('checked', 0);
    $('#templateDetailForm input[type=checkbox]').prop('checked', 0);

    // Set dropdown to default option
    $('#ControlId').prop('selectedIndex', 0);
    $('#ValueTypeId').prop('selectedIndex', 0);
    $('#TemplateId').prop('selectedIndex', 0);
    $('#RoleIdVisibleId').prop('selectedIndex', 0);
    $('#TemplateId').val(selectedTemplateId);
    $('.myMOdalOpenAddEdit').modal('show');
}

function openAddModal(){
debugger;
  clearFormFields()
  // Ensure the element exists before trying to hide it
  var statusField = document.getElementById('StatusField');
  if (statusField) {
        $(statusField).hide(); // Using jQuery to hide the element
  }
}

// Function to fetch data and update AG Grid
function fetchDataAndUpdateGrid() {
//  var queryParams = new URLSearchParams(window.location.search);
//  var templateId = queryParams.get("id");
    // Make an AJAX request to fetch the data from your API
    debugger;
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    // Add the id as a query parameter to filter the data
    let url = '/pms/TpltDtls?templateId=' + encodeURIComponent(selectedTemplateId);
    fetch(url, options)

    .then(response => {
        if (!response.ok) {
            // If response is not OK (status code other than 2xx), handle error
            return response.json().then(errorResponse => {
                throw new Error(errorResponse.Msg); // Throw an error with the message from the API response
            });
        }
        console.log(response);
        return response.json();
    })
    .then(data => {
        // Check if data is empty or null
        if (!data || data.length === 0) {
            console.error('Fetched data is empty or null.');
            return;
        }
        // Set new row data to the existing grid
        gridOptions.api.setRowData(data);
    })
    .catch(error => {
        console.error('Error fetching or setting data:', error);
        alert(error.message); // Show the error message in an alert
    });
}
 // Function to format date to YYYY-MM-DD
    function formatDate(params) {
        if (params.value) {
            const date = new Date(params.value);
            return date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        }
        return '';
    }


document.addEventListener('DOMContentLoaded', function() {
    // Initialize AG Grid
    const gridDiv = document.querySelector('#myLead_master');
    gridOptions = {
        columnDefs: [
                { headerName: 'TemplatetName', field: 'templatetName',filter: true },
                { headerName: 'ControlIdName', field: 'controlIdName',filter: true },
                { headerName: 'InOrder', field: 'inOrder', filter: true },
                { headerName: 'LabelName', field: 'labelName', filter: true },
                { headerName: 'ValueType', field: 'valueType', filter: true },
                { headerName: 'Width', field: 'width', filter: true },
                { headerName: 'IsEnable', field: 'isEnable', filter: true},
                { headerName: 'IsVisible', field: 'isVisible', filter: true},
                { headerName: 'IsRequired', field: 'isRequired', filter: true},
                { headerName: 'RoleVisible', field: 'roleVisible', filter: true},
                { headerName: 'DefaultValue', field: 'defaultValue', filter: true},

                { headerName: 'Created By', field: 'createdByName',filter: true },
                { headerName: 'Created On', field: 'createdOn', filter: true ,cellRenderer: formatDate },
                { headerName: 'Updated By', field: 'updatedByName', filter: true },
                { headerName: 'Updated On', field: 'updatedOn', filter: true ,cellRenderer: formatDate },
                { headerName: 'Active', field: 'isActive',filter: true },
                { headerName: 'LstValue', field: 'listValue',filter: true },
                { headerName: 'SqlQuery', field: 'sqlQuery',filter: true }
        ],
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

// Event listener for form submission
 $('#templateDetailForm').submit(function (e) {
         debugger;
        //Check if the form is valid
        if (!this.checkValidity()) {
            e.preventDefault(); // Prevent form submission if it's not valid
            e.stopPropagation();
        this.classList.add('was-validated');
        } else {
               let a =$('#IId').val()
               console.log()
               if ($('#IId').val()!="") {
                   // If selectedRowData exists, call the edit method
                   EdittemplateDetail(e);
               } else {
                   // If selectedRowData does not exist, call the add method
                   addtemplateDetail(e);
               }
        }
 });
function addtemplateDetail(e){
    debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();

    const payload = {
        "templateId":$('#TemplateId').val(),
        "controlId":$('#ControlId').val(),
        "valueTypeId":$('#ValueTypeId').val(),
        "sqlQuery":$('#SqlQuery').val(),
        "listValue":$('#ListValue').val(),
        "isEnable":$('#IsEnable').prop('checked'),
        "isVisible":$('#IsVisible').prop('checked'),
        "isRequired":$('#IsRequired').prop('checked'),
        "inOrder":$('#InOrder').val(),
        "labelName":$('#LabelName').val(),
        "width":$('#Width').val(),
        "defaultValue":$('#DefaultValue').val(),
        "roleIdVisible":$('#RoleIdVisibleId').val(),
        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive":true
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddTpltDtls/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        alert(jsonData.Msg);
        console.log(jsonData.Msg);
        console.log('Updating AG Grid...');
        // Update the AG Grid after successful save
        fetchDataAndUpdateGrid();
    })
    .catch(function(error) {
        console.error('Error submitting form:', error);
    });
}
function EdittemplateDetail(e){
debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "id":selectedRowData.id,
        "templateId":$('#TemplateId').val(),
        "controlId":$('#ControlId').val(),
        "valueTypeId":$('#ValueTypeId').val(),
        "sqlQuery":$('#SqlQuery').val(),
        "listValue":$('#ListValue').val(),
        "isEnable":$('#IsEnable').prop('checked'),
        "isVisible":$('#IsVisible').prop('checked'),
        "isRequired":$('#IsRequired').prop('checked'),
        "inOrder":$('#InOrder').val(),
        "labelName":$('#LabelName').val(),
        "width":$('#Width').val(),
        "defaultValue":$('#DefaultValue').val(),
        "roleIdVisible":$('#RoleIdVisibleId').val(),
        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };


    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/UpdateTpltDtls/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(jsonData) {
        console.log('Response Data:', jsonData); // Log the response data
        alert(jsonData.Msg);
        console.log(jsonData.Msg);

        // Update the AG Grid after successful edit
        fetchDataAndUpdateGrid();
    })
    .catch(function(error) {
        console.error('Error submitting edit form:', error);
    });
}


// Function to fetchSpaceListTypeDropdown
function fetchTemplateDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Template/', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if data is empty or null
            console.log(data);
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            let selectElement = document.getElementById(selectId);
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Clear existing options
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Populate dropdown with fetched data
            data.forEach(item1 => {
                let option = document.createElement('option');
                option.value = item1.id; // Set the value attribute to the code value
                option.text = item1.name; // Set the text content of the option to the code value
                if (item1.id == selectedCode) { // Check if current option matches selectedCode
                    option.selected = true; // Set the selected attribute
                }
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching icon data:', error);
        });
}
fetchTemplateDropdown('TemplateId', null)
fetchTemplateDropdown('TemplateId', $('#TemplateId').val())


//Function to fetchStageTypeDropdown
function fetchControlTypeDropdown(selectId, selectedCode) {
    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Controls', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if data is empty or null
            console.log(data);
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            let selectElement = document.getElementById(selectId);
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Clear existing options
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Populate dropdown with fetched data
            data.forEach(item1 => {
                let option = document.createElement('option');
                option.value = item1.id; // Set the value attribute to the code value
                option.text = item1.controlName; // Set the text content of the option to the code value
                if (item1.id == selectedCode) { // Check if current option matches selectedCode
                    option.selected = true; // Set the selected attribute
                }
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching icon data:', error);
        });
}
fetchControlTypeDropdown('ControlId', null)
fetchControlTypeDropdown('ControlId', $('#ControlId').val())


 //Function to fetchValueTypeDropdown
function fetchValueTypeDropdown(selectId, selectedCode) {
    fetch('/pms/LookupData/?type=VALUETYPE')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (!data || data.length === 0) {
            console.error('Fetched data is empty or null.');
            return;
        }
        let selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '<option value="">Select Option</option>';

        data.forEach(item => {
            let option = document.createElement('option');
            option.value = item.id;
            option.text = item.name;
            selectElement.appendChild(option);
        });

        if (selectedCode) {
            selectElement.value = selectedCode;
        }
    })
    .catch(error => {
        console.error('Error fetching icon data:', error);
    });
}
fetchValueTypeDropdown('ValueTypeId', null);
fetchValueTypeDropdown('ValueTypeId', $('#ValueTypeId').val());

// Function to fetchVisibleRoleDropdown
function fetchVisibleRoleDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Roles/', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if data is empty or null
            console.log(data);
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            let selectElement = document.getElementById(selectId);
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Clear existing options
            selectElement.innerHTML = '<option value="">Select Option</option>';

            // Populate dropdown with fetched data
            data.forEach(item1 => {
                let option = document.createElement('option');
                option.value = item1.id; // Set the value attribute to the code value
                option.text = item1.roleName; // Set the text content of the option to the code value
                if (item1.id == selectedCode) { // Check if current option matches selectedCode
                    option.selected = true; // Set the selected attribute
                }
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching icon data:', error);
        });
}
fetchVisibleRoleDropdown('RoleIdVisibleId', null)
fetchVisibleRoleDropdown('RoleIdVisibleId', $('#RoleIdVisibleId').val())

function BackTotemplates(){
debugger;
    var queryString = "?moduleID=" + ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "templates" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}


