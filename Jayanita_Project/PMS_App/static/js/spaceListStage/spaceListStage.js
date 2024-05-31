//.....##############################.....spaceList module js code........#########################################

// Parse query parameters from URL
var queryParams = new URLSearchParams(window.location.search);
var SubSpaceDataId = queryParams.get("id");
var ModuleID = queryParams.get("M");


let editbutton=document.getElementById('editbutton');
var selectedRowData;
var gridOptions;
var SpaceListStageData;

// Function to handle row click event in AG Grid
function onRowClicked(event) {
debugger;
    // Get the selected row data
    selectedRowData = event.data;
    console.log(selectedRowData);
    // Initialize spaceListStageData with the selected row data
    SpaceListStageData = {
        "SpaceListId": selectedRowData.spaceListId,
        "StageId": selectedRowData.stageId,
    };
}

    // Function to open the edit modal and pre-fill fields with selected row data
function openEditModal() {
    debugger;
    // Check if a row is selected
    if (selectedRowData) {

        // Pre-fill the edit form fields with the selected row data
        $('#IId').val(selectedRowData.id);
        $('#SpaceListId').val(selectedRowData.spaceListId);
        $('#InOrder').val(selectedRowData.inOrder);
        $('#StageId').val(selectedRowData.stageId);
        $('#Remark').val(selectedRowData.remark);
        $('#TemplateId').val(selectedRowData.templateId);
        $('#IsLinkToTask').prop('checked', selectedRowData.isLinkToTask);
        $('#IsTaskStage').prop('checked', selectedRowData.is_TaskStage);

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
    $('#AddEditSpaceListStage input[type=text]').val("");
    $('#AddEditSpaceListStage input[type=number]').val(null);
    $('#AddEditSpaceListStage input[type=radio]').prop('checked', 0);
    $('#AddEditSpaceListStage input[type=checkbox]').prop('checked', 0);

    // Set dropdown to default option
    $('#StageId').prop('selectedIndex', 0);
    $('#SpaceListId').prop('selectedIndex', 0);
    $('#TemplateId').prop('selectedIndex', 0);
    $('#SpaceListId').val(SubSpaceDataId);
}

function openAddModal(){
debugger;
  clearFormFields()

}

// Function to fetch data and update AG Grid
function fetchDataAndUpdateGrid() {
    // Make an AJAX request to fetch the data from your API
    debugger;
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    url = '/pms/SpcLstStg/?spaceListId='+ encodeURIComponent(SubSpaceDataId)+'&spaceListStageId=0'
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
                { headerName: 'SpaceListName', field: 'spaceListName',filter: true },
                { headerName: 'StageName', field: 'stageName',filter: true },
                { headerName: 'InOrder', field: 'inOrder', filter: true },
                { headerName: 'Remark', field: 'remark', filter: true },
                { headerName: 'TemplateName', field: 'templateName', filter: true },
                { headerName: 'IsLinkToTask', field: 'isLinkToTask', filter: true },
                { headerName: 'IsTaskStage', field: 'is_TaskStage', filter: true},

                { headerName: 'Created By', field: 'createdByName',filter: true },
                { headerName: 'Created On', field: 'createdOn', filter: true ,cellRenderer: formatDate },
                { headerName: 'Updated By', field: 'updatedByName', filter: true },
                { headerName: 'Updated On', field: 'updatedOn', filter: true ,cellRenderer: formatDate },
                { headerName: 'Active', field: 'isActive',filter: true }
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
 $('#AddEditSpaceListStage').submit(function (e) {
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
                   EditSubList(e);
               } else {
                   // If selectedRowData does not exist, call the add method
                   addSubList(e);
               }
        }
 });
function addSubList(e){
    debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "spaceListId":$('#SpaceListId').val(),
        "isLinkToTask":$('#IsLinkToTask').prop('checked'),
        "inOrder":$('#InOrder').val(),
        "stageId":$('#StageId').val(),
        "remark":$('#Remark').val(),
        "templateId":$('#TemplateId').val(),
        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddEditSpcLstStg/', {
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
function EditSubList(e){
debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "id":selectedRowData.id,
        "spaceListId":$('#SpaceListId').val(),
        "isLinkToTask":$('#IsLinkToTask').prop('checked'),
        "inOrder":$('#InOrder').val(),
        "stageId":$('#StageId').val(),
        "remark":$('#Remark').val(),
        "templateId":$('#TemplateId').val(),
        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };


    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/EditSpcLstStg/', {
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
function fetchSpaceListTypeDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/SpaceLists?SpaceId=0&id=0', options)
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
fetchSpaceListTypeDropdown('SpaceListId', null)
fetchSpaceListTypeDropdown('SpaceListId', $('#SpaceListId').val())


//Function to fetchStageTypeDropdown
function fetchStageTypeDropdown(selectId, selectedCode) {
    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Stages/', options)
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
fetchStageTypeDropdown('StageId', null)
fetchStageTypeDropdown('StageId', $('#StageId').val())


// Function to fetchTemplateDropdown
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
fetchTemplateDropdown('TemplateId', null);
fetchTemplateDropdown('TemplateId', $('#TemplateId').val());



//----------###############------ set spaceListStageData in card-------#####################-------------


var SubSpaceName = document.getElementById("SubSpaceName");
var SubSpaceCode = document.getElementById("SubSpaceCode");
var SubSpaceDiscription = document.getElementById("SubSpaceDiscription");

function fetchData() {

    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };

    // Add the id as a query parameter to filter the data
    let url = '/pms/SpaceLists?SpaceId=0&id=' + encodeURIComponent(SubSpaceDataId);

    fetch(url, options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Log the fetched data to the console
        console.log(data);
        // Set text content in elements
        SubSpaceName.textContent = data[0].name;
        SubSpaceCode.textContent = data[0].code;
        SubSpaceDiscription.textContent = data[0].description;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}
fetchData();

function OpenAddUser(){
  debugger;
  if(selectedRowData){
     // Construct the query string with the spaceListStageData values
    var queryString = "?SPLID=" + encodeURIComponent(SpaceListStageData.SpaceListId) + "&StId=" + encodeURIComponent(SpaceListStageData.StageId) +"&M="+ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "ListStageUser" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
  }
  else{
    alert("Please Select any row..! ")
  }
}

function BackToList(){
debugger;
    var queryString = "?moduleID=" + ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "sub-space" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}