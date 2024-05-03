//.....##############################.....role module js code........#########################################
    let editbutton=document.getElementById('editbutton');
    var selectedRowData;
    var gridOptions;
    var RoleId;
    // Function to handle row click event in AG Grid
    function onRowClicked(event) {
    debugger;
        // Get the selected row data
        selectedRowData = event.data;
        console.log(selectedRowData);
        RoleId=selectedRowData.id;
    }

    // Function to open the edit modal and pre-fill fields with selected row data
    function openEditModal() {
    debugger;
        // Check if a row is selected
        if (selectedRowData) {
            // Pre-fill the edit form fields with the selected row data
            $('#id').val(selectedRowData.id);
            $('#EroleName').val(selectedRowData.roleName);

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
        $('#addRoleForm input[type=text], #moduleForm textarea').val('');
        $('#addRoleForm input[type=checkbox]').prop('checked', false);

        // Clear form fields for editing data
        $('#editRoleForm input[type=text], #EditmoduleForm textarea').val('');
        $('#editRoleForm input[type=checkbox]').prop('checked', false);

        // Set dropdown to default option
        $('#AStageGroup').prop('selectedIndex', 0);
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
        fetch('/pms/Roles', options)
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
                    { headerName: 'Name', field: 'roleName' },
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
    $('#addRoleForm').submit(function (e) {
        debugger;
        //Check if the form is valid
        if (!this.checkValidity()) {
            e.preventDefault(); // Prevent form submission if it's not valid
            e.stopPropagation();
        this.classList.add('was-validated');
        } else {

            addRole(e)
        }

    });
    function addRole(e){
        debugger;
        e.preventDefault();
        var localStorageData = JSON.parse(localStorage.getItem('id'));
        var currentDate = new Date().toISOString();
        const payload = {
            "roleName":$('#AroleName').val(),

            "createdBy": localStorage.getItem('id'),
            "createdOn": currentDate,
            "isActive": false
        };

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        // Make fetch request
        fetch('/pms/AddRoles/', {
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
    $('#editRoleForm').submit(function (e) {
    debugger;
        //Check if the form is valid
        if (!this.checkValidity()) {
            e.preventDefault(); // Prevent form submission if it's not valid
            e.stopPropagation();
        this.classList.add('was-validated');
        } else {
            editRole(e)
        }

    });

    function editRole(e){
        e.preventDefault();
        var currentDate = new Date().toISOString();
        const payload = {
            "id":selectedRowData.id,
            "roleName": $('#EroleName').val(),

            "updatedBy": localStorage.getItem('id'),
            "updatedOn": currentDate,
            "isActive":$('input[name="inOrder"]:checked').val() === 'active',
        };

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        // Make fetch request
        fetch('/pms/AddRoles/', {
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
        })
        .catch(function(error) {
            console.error('Error submitting edit form:', error);
        });
    }

    function OpenRolePermission(){
          debugger;
          if(selectedRowData){
             // Construct the query string with the spaceListStageData values
            var queryString = "?id=" + encodeURIComponent(RoleId);

            // Append the query string to the URL of the other page
            var nextPageUrl = "RolePermission" + queryString;

            // Redirect to the other page with the query parameters
            window.location.href = nextPageUrl;
          }
          else{
            alert("Please Select any row..! ")
          }
    }