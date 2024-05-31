 //.....##############################.....Controlmodule js code........#########################################
 debugger;
 const urlParams = new URLSearchParams(window.location.search);
 const ModuleID = urlParams.get('moduleID');
    let editbutton=document.getElementById('editbutton');
    let Addbutton=document.getElementById('Addbutton');
    var RoleId = localStorage.getItem('roleId');

    var selectedRowData;
    var gridOptions;

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
            $('#EcontrolName').val(selectedRowData.controlName);
            $('#EControlType').val(selectedRowData.typeId);

             // Pre-select the checkbox based on the value of "isActive"
            $('#activeOrder').prop('checked', selectedRowData.isActive);
            $('#inactiveOrder').prop('checked', !selectedRowData.isActive);
            // Open the edit modal
            $('.myMOdalOpenEdit').modal('show');
        } else {
            alert('Please select a row to edit.');
        }
    }

    // Function to clear form fields after saving data
    function clearFormFields() {
        // Clear form fields for adding data
        $('#ControlForm input[type=text], #moduleForm textarea').val('');
        $('#ControlForm input[type=checkbox]').prop('checked', false);

        // Clear form fields for editing data
        $('#editControlForm input[type=text], #EditmoduleForm textarea').val('');
        $('#editControlForm input[type=checkbox]').prop('checked', false);

        // Set dropdown to default option
        $('#eddl').prop('selectedIndex', 0);
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
        fetch('/pms/Controls', options)
        .then(response => {
                if (!response.ok) {
                     // If response is not OK (status code other than 2xx), handle error
                     return response.json().then(errorResponse => {
                    throw new Error(errorResponse.Msg); // Throw an error with the message from the API response
                });
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

                    { headerName: 'Name', field: 'controlName' },
                    { headerName: 'Control Type', field: 'type' },
                    { headerName: 'Created By', field: 'createdByName' },
                    { headerName: 'Created On', field: 'createdOn' ,cellRenderer: formatDate },
                    { headerName: 'Updated By', field: 'updatedByName' },
                    { headerName: 'Updated On', field: 'updatedOn' ,cellRenderer: formatDate },
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
            rowSelection: 'single',
            animateRows: true,
            onRowClicked: onRowClicked // Attach row click event handler
        };
        new agGrid.Grid(gridDiv, gridOptions);

        // Call the function to fetch data and initialize AG Grid
        fetchDataAndUpdateGrid();
    });

    // Event listener for form submission
    $('#ControlForm').submit(function (e) {
         debugger;
        //Check if the form is valid
        if (!this.checkValidity()) {
            e.preventDefault(); // Prevent form submission if it's not valid
            e.stopPropagation();
        this.classList.add('was-validated');
        } else {
            addControler(e)
        }
    });
    function addControler(e){
        debugger;
        e.preventDefault(e);
        var localStorageData = JSON.parse(localStorage.getItem('id'));
        var currentDate = new Date().toISOString();
        const payload = {
            "controlName":$('#AcontrolName').val(),
            "typeId":$('#AControlType').val(),

            "createdBy": localStorage.getItem('id'),
            "createdOn": currentDate,
            "isActive": false
        };

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        // Make fetch request
        fetch('/pms/AddControls/', {
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
    $('#editControlForm').submit(function (e) {
         debugger;
        //Check if the form is valid
        if (!this.checkValidity()) {
            e.preventDefault(); // Prevent form submission if it's not valid
            e.stopPropagation();
        this.classList.add('was-validated');
        } else {
            editControl(e)
        }
    });
    function editControl(e){
        debugger;
        e.preventDefault();
        var currentDate = new Date().toISOString();
        const payload = {
            "id":selectedRowData.id,
            "controlName": $('#EcontrolName').val(),
            "typeId": $('#EControlType').val(),

            "updatedBy": localStorage.getItem('id'),
            "updatedOn": currentDate,
            "isActive":$('input[name="inOrder"]:checked').val() === 'active',
        };

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        // Make fetch request
        fetch('/pms/AddControls/', {
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

            // Update the AG Grid after successful edit
            fetchDataAndUpdateGrid();
            fetchModuleCategoryDropdown($('#moduleCategoryID').val());
        })
        .catch(function(error) {
            console.error('Error submitting edit form:', error);
        });
    }

    // Function to fetchControlTypeDropdown
function fetchControlTypeDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/LookupData/?type=CTRL', options)
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

fetchControlTypeDropdown('AControlType', null);
fetchControlTypeDropdown('EControlType', $('#EControlType').val());