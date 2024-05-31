var queryParams = new URLSearchParams(window.location.search);
var selectedRoleId = queryParams.get("id");
var ModuleID = queryParams.get("M");
var roleId = localStorage.getItem("roleId");

function fetchRolePermissionData() {
    debugger;

    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_')
        },
    };
    fetch('/pms/api/RolePrmsion?roleId=' + selectedRoleId, options)
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
            renderRolePermissions(data);
        })
        .catch(error => {
            console.error('Error fetching or setting data:', error.message); // Log the error message
            alert(error.message); // Show the error message in an alert
        });
}

function renderRolePermissions(data) {
    const mainContent = document.getElementById('main_content');
    data.forEach(role => {
        const card = document.createElement('div');
        card.className = 'card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.textContent = role.RoleName;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-1';

        role.Modules.forEach(module => {
            const moduleCard = createModuleCard(module);
            cardBody.appendChild(moduleCard);
        });

        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer';

        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-sm btn-success';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', function () {
            saveRolePermissions(role.Modules);
        });

        cardFooter.appendChild(saveButton);

        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        card.appendChild(cardFooter);

        mainContent.appendChild(card);
    });
}

function createModuleCard(module) {
    const moduleCard = document.createElement('div');
    moduleCard.className = 'card';

    const moduleHeader = document.createElement('div');
    moduleHeader.className = 'card-header pt-0 pb-0';
    moduleHeader.textContent = module.ModuleName;

    const moduleBody = document.createElement('div');
    moduleBody.className = 'card-body pt-0 pb-0 permissionBody';

    const allFunctionsDiv = document.createElement('div'); // Create a separate div for "All Functions"
    allFunctionsDiv.className = 'mb-1'; // Add margin-bottom class

    const moduleSwitchDiv = createSwitchDiv('All Functions', 'all-functions');
    const allFunctionsCheckbox = moduleSwitchDiv.querySelector('input');

    // Event listener for "All Functions" switch button
    allFunctionsCheckbox.addEventListener('change', function () {
        const functionCheckboxes = moduleBody.querySelectorAll('.function-switch'); // Get all function checkboxes
        functionCheckboxes.forEach(checkbox => {
            checkbox.checked = allFunctionsCheckbox.checked; // Set state of all function checkboxes based on "All Functions" checkbox
        });
    });

    allFunctionsDiv.appendChild(moduleSwitchDiv); // Append "All Functions" switch to its own div

    module.Functions.forEach(func => {
        const funcDiv = createSwitchDiv(func.FunctionName, func.RMF[0].RoleModuleFunctionId);
        const funcCheckbox = funcDiv.querySelector('input');
        funcCheckbox.checked = func.RMF[0].IsApplicable;
        funcCheckbox.classList.add('function-switch'); // Add a class to function switches

        moduleBody.appendChild(funcDiv);
    });

    moduleBody.appendChild(allFunctionsDiv); // Append the "All Functions" div to module body

    moduleCard.appendChild(moduleHeader);
    moduleCard.appendChild(moduleBody);

    return moduleCard;
}

function createSwitchDiv(labelText, funcId) {
    const switchDiv = document.createElement('div');
    switchDiv.className = 'mb-1 form-check form-switch';

    const switchLabel = document.createElement('label');
    switchLabel.className = 'form-check-label';
    switchLabel.textContent = labelText;

    const switchCheckbox = document.createElement('input');
    switchCheckbox.className = 'form-check-input';
    switchCheckbox.type = 'checkbox';
    switchCheckbox.id = `${labelText}-${funcId}`; // Set unique ID for each switch button

    // Add event listener to capture switch button change
    switchCheckbox.addEventListener('change', function () {
        console.log(`${labelText} switch button changed. New value:`, switchCheckbox.checked);
    });

    switchDiv.appendChild(switchLabel);
    switchDiv.appendChild(switchCheckbox);

    return switchDiv;
}

function saveRolePermissions(modules) {
    const rolePermissionsArray = [];

    // Iterate over each module
    modules.forEach(module => {
        // Iterate over each function within the current module
        module.Functions.forEach(func => {
            const funcId = func.RMF[0].RoleModuleFunctionId;
            const checkboxId = `${func.FunctionName}-${funcId}`;
            const funcCheckbox = document.getElementById(checkboxId);

            if (funcCheckbox) {
                const isApplicable = funcCheckbox.checked;

                const rolePermission = {
                    id: funcId,
                    roleId: selectedRoleId,
                    isApplicable: isApplicable
                };
//                console.log("rolePermission",rolePermission)
                rolePermissionsArray.push(rolePermission);
//                console.log("rolePermissionsArray",rolePermissionsArray)
            } else {
                console.error(`Checkbox element with ID "${checkboxId}" not found.`);
            }
        });
    });

    // Send the updated data to the server to save the changes
    fetch('/pms/api/RolesPermissions/updateRolePermissons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token_')
        },
        body: JSON.stringify(rolePermissionsArray)
    })
    .then(response => response.json())
    .then(data => {
    alert(data.Msg)
        console.log(data);
    })
    .catch(error => {
        console.error('Error saving role permissions:', error);
    });

}

document.addEventListener('DOMContentLoaded', function () {
    fetchRolePermissionData();
});

function BackToRoles(){
debugger;
    var queryString = "?moduleID="+ModuleID;

    // Append the query string to the URL of the other page
    var nextPageUrl = "roles" + queryString;

    // Redirect to the other page with the query parameters
    window.location.href = nextPageUrl;
}
