//.....##############################.....spaceList module js code........#########################################
let editbutton=document.getElementById('editbutton');
var selectedRowData;
var gridOptions;
var spaceListStageData;
// Function to handle row click event in AG Grid
function onRowClicked(event) {
debugger;
    // Get the selected row data
    selectedRowData = event.data;
    console.log(selectedRowData);

    // Initialize spaceListStageData with the selected row data
    spaceListStageData = {
        "SubSpaceDataId": selectedRowData.id,
    };
}

    // Function to open the edit modal and pre-fill fields with selected row data
function openEditModal() {
    debugger;
    $('#optionalFields3').hide();
    // Check if a row is selected
    if (selectedRowData) {
        // Pre-fill the edit form fields with the selected row data
        $('#IId').val(selectedRowData.id);
        $('#Code').val(selectedRowData.code);
        $('#colNoInRow').val(selectedRowData.colNoInRow);
        $('#Description').val(selectedRowData.description);
        $('#icon').val(selectedRowData.iconUrl);
        $('#SubspaceName').val(selectedRowData.name);
        $('#spaceId').val(selectedRowData.spaceId);
        $('#Type').val(selectedRowData.typeId);
        $('#IsLinkToTask').prop('checked', selectedRowData.isLinkToTask);
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
    $('#AddEditListForm input[type=text], #moduleForm textarea').val('');
    $('#AddEditListForm input[type=radio]').prop('checked', 0);

    // Set dropdown to default option
    $('#spaceId').prop('selectedIndex', 0);
    $('#Type').prop('selectedIndex', 0);
    $('#icon').prop('selectedIndex', 0);
}

function openAddModal(){
debugger;
  clearFormFields()
  $('#optionalFields3').show();
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
    fetch('/pms/SpaceLists?SpaceId=0&id=0', options)
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
        // Set new row data to the existing grid
        gridOptions.api.setRowData(data);
    })
    .catch(error => {
        console.error('Error fetching or setting data:', error);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AG Grid
    const gridDiv = document.querySelector('#myLead_master');
    gridOptions = {
        columnDefs: [
                { headerName: 'Name', field: 'name',filter: true },
                { headerName: 'Descriptions', field: 'description',filter: true },
                { headerName: 'IconUrl', field: 'iconUrl', filter: true },
                { headerName: 'IsLinkToTask', field: 'isLinkToTask', filter: true },
                { headerName: 'SpaceName', field: 'spaceName', filter: true },
                { headerName: 'CustomName', field: 'customName', filter: true },
                { headerName: 'TypeName', field: 'typeName', filter: true},
                { headerName: 'ColNoInRow', field: 'colNoInRow', filter: true },
                { headerName: 'Created By', field: 'createdByName',filter: true },
                { headerName: 'Created On', field: 'createdOn', filter: true },
                { headerName: 'Updated By', field: 'updatedByName', filter: true },
                { headerName: 'Updated On', field: 'updatedOn', filter: true },
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
        rowSelection: 'multiple',
        animateRows: true,
        onRowClicked: onRowClicked // Attach row click event handler
    };
    new agGrid.Grid(gridDiv, gridOptions);

    // Call the function to fetch data and initialize AG Grid
    fetchDataAndUpdateGrid();
});

// Event listener for form submission
 $('#AddEditListForm').submit(function (e) {
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
        "code":$('#Code').val(),
        "name":$('#SubspaceName').val(),
        "description":$('#Description').val(),
        "iconUrl":$('#icon').val(),
        "spaceId":$('#spaceId').val(),
        "isLinkToTask":$('#isLinkToTask').val(),
        "customName":$('#customName').val,
        "typeId":$('#Type').val(),
        "colNoInRow":$('#colNoInRow').val(),
        "customName":$('#customName').val(),
        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddEditSpaceLists/', {
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
        "code":$('#Code').val(),
        "name":$('#SubspaceName').val(),
        "description":$('#Description').val(),
        "iconUrl":$('#icon').val(),
        "spaceId":$('#spaceId').val(),
        "isLinkToTask":$('#IsLinkToTask').is(':checked'),
        "typeId":$('#Type').val(),
        "colNoInRow":$('#colNoInRow').val(),
        "customName":$('#customName').val(),
        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };


    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/AddEditSpaceLists/', {
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


// Function to fetchControlTypeDropdown
function fetchSpaceDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/Spaces/', options)
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
fetchSpaceDropdown('spaceId', null)
fetchSpaceDropdown('spaceId', $('#spaceId').val())


// Function to fetchControlTypeDropdown
function fetchTypeDropdown(selectId, selectedCode) {
    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/LookupData/?type=LSTTYPE', options)
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
fetchTypeDropdown('Type', null)
fetchTypeDropdown('Type', $('#Type').val())


// Function to populate the dropdown options
function populateDropdown(selectId, selectedCode) {
    fetch('/pms/LookupData/?type=FaFaIcon')
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
            option.value = item.code;
            option.text = item.code;
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
populateDropdown('icon', null);
populateDropdown('icon', $('#icon').val());


function openSelectChange(){
debugger;
  if(selectedRowData){
     // Construct the query string with the spaceListStageData values
    var queryString = "?id=" + encodeURIComponent(spaceListStageData.SubSpaceDataId);

    // Append the query string to the URL of the other page
    var nextPageUrl = "selectStage" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
  }
  else{
    alert("Please Select any row..! ")
  }
}