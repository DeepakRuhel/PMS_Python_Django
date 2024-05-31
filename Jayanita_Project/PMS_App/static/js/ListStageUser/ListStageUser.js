//.....##############################.....spaceList module js code........#########################################

// Parse query parameters from URL
debugger;
var queryParams = new URLSearchParams(window.location.search);
var SPCLID = queryParams.get("SPLID");
var STGID = queryParams.get("StId");
var ModuleID = queryParams.get("M");


let editbutton=document.getElementById('editbutton');
var selectedRowData;
var gridOptions;


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
    // Check if a row is selected
    if (selectedRowData) {

         // Pre-fill the edit form fields with the selected row data
        $('#IId').val(selectedRowData.Id);
        $('#UserName').val(selectedRowData.userId);
         console.log("selectedRowData.isManager:", selectedRowData.isManager);
        // Set the value of the select element
        $('#IsManager').val(selectedRowData.isManager);

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
    $('#liststageuserForm input[type=text]').val("");
    $('#liststageuserForm input[type=number]').val(null);
    $('#liststageuserForm input[type=radio]').prop('checked', 0);
     $('#liststageuserForm input[type=select]').prop('checked', 0);
    $('#liststageuserForm input[type=checkbox]').prop('checked', 0);

    // Set dropdown to default option
    $('#UserName').prop('selectedIndex', 0);
    $('#IsManger').prop('selectedIndex', 0);
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
    url = '/pms/StageUsers?SpaceListId='+encodeURIComponent(SPCLID)+'&StageId='+encodeURIComponent(STGID)+'&Id=0'
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
                { headerName: 'UserName', field: 'userName', filter: true },
                { headerName: 'IsManager', field: 'isManager', filter: true },


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
 $('#liststageuserForm').submit(function (e) {
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
                   EditListStageUser(e);
               } else {
                   // If selectedRowData does not exist, call the add method
                   addListStageUser(e);
               }
        }
 });
function addListStageUser(e){
    debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "spaceListId":encodeURIComponent(SPCLID),
        "stageId":encodeURIComponent(STGID),
        "userId":$('#UserName').val(),
        "isManager":$('#IsManager').val(),

        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddStageUsers/', {
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
function EditListStageUser(e){
debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "id":selectedRowData.Id,
       "spaceListId":encodeURIComponent(SPCLID),
       "stageId":encodeURIComponent(STGID),
        "userId":$('#UserName').val(),
        "isManager":$('#IsManager').val(),



        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };


    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddStageUsers/', {
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


 //Function to fetchSpaceListTypeDropdown
function fetchUserNameDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Users', options)
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
fetchUserNameDropdown('UserName', null)
fetchUserNameDropdown('UserName', $('#UserName').val())


function BackToStages(){
debugger;
    var queryString = "?id=" + SPCLID + "&M="+ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "selectStage" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}