//.....##############################.....Controlmodule js code........#########################################
 debugger;
 const urlParams = new URLSearchParams(window.location.search);
 const SpclId = urlParams.get('id');
 var ModuleID = urlParams.get("M");
    let editbutton=document.getElementById('editbutton');
    let Addbutton=document.getElementById('Addbutton');
    var RoleId = localStorage.getItem('roleId');

    var selectedRowData;
    var gridOptions;

//    function ModuleActionRight(){
//    debugger;
//       // Make an AJAX request to fetch the data from your API
//        debugger;
//        let options = {
//            method: "GET",
//            headers: {
//                "Content-Type": "application/json",
//                "Authorization": localStorage.getItem('token_') // Include token in the request headers
//            },
//        };
//        fetch('/pms/api/Users/ModuleAction?roleId='+RoleId+'&moduleId='+ModuleID, options)
//        .then(response => {
//            if (!response.ok) {
//                throw new Error('Network response was not ok');
//            }
//            return response.json();
//        })
//        .then(data => {
//            // Check if data is empty or null
//            if (!data || data.length === 0) {
//                console.error('Fetched data is empty or null.');
//                return;
//            }
//            console.log(data);
//            data.forEach(item => {
//              console.log("item",item)
//              if (item.Code=="E" && item.IsApplicable!=true){
//                editbutton.style.display="none"
//              }
//              else if(item.Code=="A" && item.IsApplicable!=true){
//                Addbutton.style.display="none"
//              }
//            })
//        })
//        .catch(error => {
//            console.error('Error fetching or setting data:', error);
//            alert(error.message); // Show the error message in an alert
//        });
//    }
//    ModuleActionRight()


    function onRowClicked(event) {
    debugger;
        // Get the selected row data
        selectedRowData = event.data;
        console.log(selectedRowData);
    }

    // Function to open the edit modal and pre-fill fields with selected row data
    function openEditModal() {
    debugger;
        var NameField = document.getElementById('NameField');
        var ValueTypeField = document.getElementById('ValueTypeField');
         $(NameField).hide();
         $(ValueTypeField).hide();


        // Check if a row is selected
        if (selectedRowData) {
            // Pre-fill the edit form fields with the selected row data
            $('#IId').val(selectedRowData.id);
            $('#SpaceListId').val(selectedRowData.spaceListId);
            $('#TypeID').val(selectedRowData.typeId);
            $('#ValueTypeId').val(selectedRowData.valueTypeId);
            $('#Name').val(selectedRowData.name).hide();
            $('#Lable').val(selectedRowData.lable);
            $('#Width').val(selectedRowData.width);
            $('#ValSize').val(selectedRowData.valSize).hide();
            $('#ListValue').val(selectedRowData.listValue);
            $('#SeqNo').val(selectedRowData.seqNo);
            $('#IsfromLookUp').prop('checked', selectedRowData.isfromLookUp);
            $('#IsShowInKanban').prop('checked', selectedRowData.isShowInKanban);
            $('#IsRequired').prop('checked', selectedRowData.isRequired);

             // Pre-select the checkbox based on the value of "isActive"
            $('#activeOrder').prop('checked', selectedRowData.isActive);
            $('#inactiveOrder').prop('checked', !selectedRowData.isActive);

            // Open the edit modal
            $('.myMOdalOpenAddEdit').modal('show');
        } else {
            alert('Please select a row to edit.');
        }
    }

    // Function to clear form fields after saving data
    function clearFormFields() {
         debugger;
        // Clear form fields for adding data
        $('#AddEditCustomFldForm input[type=text], #moduleForm textarea').val('');
        $('#AddEditCustomFldForm input[type=checkbox]').prop('checked', false);

         // Set dropdowns to default option
        $('#SpaceListId, #TypeID, #ValueTypeId').val('');
        $('#IsfromLookUp, #IsShowInKanban, #IsRequired').prop('checked', false);

        // Clear radio buttons
        $('input[name="inOrder"]').prop('checked', false);

    }

    function openAddModal(){
    var NameField = document.getElementById('NameField');
    var ValueTypeField = document.getElementById('ValueTypeField');
    $(NameField).show();
    $(ValueTypeField).show();
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
        fetch('/pms/api/ListCustomeFields?SpaceListId='+SpclId+'&Id=0', options)
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
             console.log(data)

            // Check if data is empty or null
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                alert("Fetched data is empty or null.");
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

                    { headerName: 'SpaceListName', field: 'spaceListName' },
                    { headerName: 'Control Type', field: 'typename' },
                    { headerName: 'Value Type', field: 'valueType' },
                    { headerName: 'Lable', field: 'lable' },
                    { headerName: 'Name', field: 'name' },
                    { headerName: 'Width', field: 'width' },
                    { headerName: 'Value Size', field: 'valSize' },
                    { headerName: 'IsRequired', field: 'isRequired' },
                    { headerName: 'InOrder', field: 'seqNo' },
                    { headerName: 'IsFromLookUp', field: 'isfromLookUp' },
                    { headerName: 'IsShowInKanban', field: 'isShowInKanban' },
                    { headerName: 'Created By', field: 'createdByName' },
                    { headerName: 'Created On', field: 'createdOn',cellRenderer: formatDate  },
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
 $('#AddEditCustomFldForm').submit(function (e) {
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
        "typeId":$('#TypeID').val(),
        "valueTypeId":$('#ValueTypeId').val(),
        "name":$('#Name').val(),
        "lable":$('#Lable').val(),
        "width":$('#Width').val(),
        "valSize":$('#ValSize').val(),
        "listValue":$('#ListValue').val(),
        "seqNo":$('#SeqNo').val(),
        "isfromLookUp":$('#IsfromLookUp').is(':checked'),
        "isShowInKanban":$('#IsShowInKanban').is(':checked'),
        "isRequired":$('#IsRequired').is(':checked'),
        "createdBy": localStorage.getItem('id'),
        "createdOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/api/InsertListCustomeFields', {
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
        "typeId":$('#TypeID').val(),
        "valueTypeId":$('#ValueTypeId').val(),
        "name":$('#Name').val(),
        "lable":$('#Lable').val(),
        "width":$('#Width').val(),
        "valSize":$('#ValSize').val(),
        "listValue":$('#ListValue').val(),
        "seqNo":$('#SeqNo').val(),
        "isfromLookUp":$('#IsfromLookUp').is(':checked'),
        "isShowInKanban":$('#IsShowInKanban').is(':checked'),
        "isRequired":$('#IsRequired').is(':checked'),
        "updatedBy": localStorage.getItem('id'),
        "updatedOn": currentDate,
        "isActive":$('input[name="inOrder"]:checked').val() === 'active',
    };


    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // Make fetch request
    fetch('/pms/api/UpdateListCustomeFields', {
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
fetchControlTypeDropdown('TypeID', null);
fetchControlTypeDropdown('TypeID', $('#TypeID').val());

// Function to fetchValueTypeDropdown
function fetchValueTypeDropdown(selectId, selectedCode) {

    debugger;
    // Make an AJAX request to fetch the data from your API
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_') // Include token in the request headers
        },
    };
    fetch('/pms/LookupData/?type=VALUETYPE', options)
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
fetchValueTypeDropdown('ValueTypeId', null);
fetchValueTypeDropdown('ValueTypeId', $('#ValueTypeId').val());

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


function BackToList(){
debugger;
    var queryString = "?moduleID=" + ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "sub-space" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}