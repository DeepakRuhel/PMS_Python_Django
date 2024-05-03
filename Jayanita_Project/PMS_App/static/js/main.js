   //.....##############################.....selectStage module js code........#########################################
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
        $('#id').val(selectedRowData.id);
        $('#EUsername').val(selectedRowData.name);
        $('#EuserId').val(selectedRowData.userId);
        $('#EempCode').val(selectedRowData.EmpCode);
        $('#Eaddress').val(selectedRowData.address);
        $('#ERoleId').val(selectedRowData.roleId);
        $('#EPassword').val('');
        $('#EisUserLDAP').prop('checked', selectedRowData.isUserLDAP);
         // Pre-select the checkbox based on the value of "isActive"
        $('#activeOrder').prop('checked', selectedRowData.isActive);
        $('#inactiveOrder').prop('checked', !selectedRowData.isActive);
        // Open the edit modal
        $('.myMOdalOpenEdit').modal('show');
        hideFields()
    }
    else {
        alert('Please select a row to edit.');
    }
}

// Function to clear form fields after saving data
function clearFormFields() {
    // Clear form fields for adding data
    $('#UserForm input[type=text], #moduleForm textarea').val('');
    $('#UserForm input[type=checkbox]').prop('checked', false);

    // Clear form fields for editing data
    $('#EditUserForm input[type=text], #EditmoduleForm textarea').val('');
    $('#EditUserForm input[type=checkbox]').prop('checked', false);

    // Set dropdown to default option
    $('#ARoleId').prop('selectedIndex', 0);
      // Uncheck radio button
    $('#AisUserLDAP').prop('checked', false);


}

function openAddModal(){
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
    fetch('/Uers', options)
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
                { headerName: 'Name', field: 'name' },
                { headerName: 'EmpCode', field: 'EmpCode' },
                { headerName: 'UserId', field: 'userId' },
                { headerName: 'Address', field: 'address' },
                { headerName: 'roleName', field: 'roleName' },
                { headerName: 'IsUserLDAP_User', field: 'isUserLDAP' },
                { headerName: 'UserImagePath', field: 'userImagePath' },
                { headerName: 'Created By', field: 'createdByName' },
                { headerName: 'Created On', field: 'createdOn' },
                { headerName: 'Updated By', field: 'updatedByName' },
                { headerName: 'Updated On', field: 'updatedOn' },
                { headerName: 'Active', field: 'isActive' }
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
$('#UserForm').submit(function (e) {
    debugger;
    //Check if the form is valid
    if (!this.checkValidity()) {
        e.preventDefault(); // Prevent form submission if it's not valid
        e.stopPropagation();
    this.classList.add('was-validated');
    } else {
        addUser(e)
    }

});
function addUser(e){
    debugger;
    e.preventDefault();
    const radioOOO = $('#AisUserLDAP').val();
    alert(radioOOO);
    var localStorageData = JSON.parse(localStorage.getItem('id'));
    var currentDate = new Date().toISOString();
    const payload = {
        "name":$('#AUsername').val(),
        "empCode":$('#AempCode').val(),
        "userId":$('#AuserId').val(),
        "address":$('#Aaddress').val(),
        "roleId":$('#ARoleId').val(),
        "password":$('#Apassword').val(),
        "isUserLDAP":$('#AisUserLDAP').val(),
        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive": true
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('AddUsers/', {
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

// Event listener for edit form submission
$('#EditUserForm').submit(function (e) {
debugger;
    //Check if the form is valid
    if (!this.checkValidity()) {
        e.preventDefault(); // Prevent form submission if it's not valid
        e.stopPropagation();
    this.classList.add('was-validated');
    } else {
        EditUser(e)
    }

});
function EditUser(e){
debugger;
    e.preventDefault();
    var currentDate = new Date().toISOString();
    const payload = {
        "id":selectedRowData.id,
        "name": $('#EUsername').val(),
        "empCode": $('#EempCode').val(),
        "userId": $('#EuserId').val(),
        "address": $('#Eaddress').val(),
        "roleId": $('#ERoleId').val(),
        "isUserLDAP": $('#EisUserLDAP').prop('checked'),
        "password":$('#EPassword').val(),
        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };
    // If the password field is not empty, include it in the payload
    const newPassword = $('#EPassword').val().trim();
    if (newPassword) {
        payload.password = newPassword;
    }

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('AddUsers/', {
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
function fetchRoleDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
       headers: {
            'Content-Type': 'application/json',
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/Roles/', options)
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
fetchRoleDropdown('ARoleId', null)
fetchRoleDropdown('ERoleId', $('#ERoleId').val())


 // Get reference to radio button and password field
    const radioBtn = document.getElementById('AisUserLDAP');
    const passwordField = document.getElementById('Apassword');
    // Add event listener for radio button change
    radioBtn.addEventListener('change', function() {
        // Check if radio button is checked
        if (this.checked) {
            // Hide password field
            passwordField.classList.add('hidden');
        } else {
            // Show password field
            passwordField.classList.remove('hidden');
        }
    });

 function hideFields(){
   const radioBtn = document.getElementById('EisUserLDAP');
    const passwordField = document.getElementById('EPassword');
    // Add event listener for radio button change
    radioBtn.addEventListener('change', function() {
        // Check if radio button is checked
        if (this.checked) {
            // Hide password field
            passwordField.classList.add('hidden');
        } else {
            // Show password field
            passwordField.classList.remove('hidden');
        }
    });
 }













// Function to fetch data for the icon dropdown
function fetchIconDataAndPopulateDropdown() {
    // Make an AJAX request to fetch the data from your API
    fetch('/LookupData/?type=FaFaIcon')
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
        let selectElement = document.getElementById('addl');

        // Clear existing options
        selectElement.innerHTML = '<option value="">Select Option</option>';

        // Populate dropdown with fetched data
        data.forEach(item => {
            let option = document.createElement('option');
            option.value = item.code; // Set the value attribute to the code value
            option.text = item.code; // Set the text content of the option to the code value
            selectElement.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching icon data:', error);
    });
}
fetchIconDataAndPopulateDropdown();

// Function to populate the dropdown options
function populateDropdown(selectId, selectedCode) {
    fetch('/LookupData/?type=FaFaIcon')
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
// Call the function to populate the add dropdown
populateDropdown('addl', null);
// Call the function to populate the edit dropdown with a selected code
populateDropdown('eddl', $('#addl').val()); // Pass the selected code if needed