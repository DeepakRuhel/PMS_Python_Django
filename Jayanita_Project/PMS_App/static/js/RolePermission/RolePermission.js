var queryParams = new URLSearchParams(window.location.search);
var selectedRoleId = queryParams.get("id");

function fetchRolePermissionData() {
    var RoleId = localStorage.getItem("roleId");
    let options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('token_')
        },
    };
    fetch('/pms/api/RolePrmsion?roleId=' + encodeURIComponent(selectedRoleId), options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
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
                    const moduleCard = document.createElement('div');
                    moduleCard.className = 'card';

                    const moduleHeader = document.createElement('div');
                    moduleHeader.className = 'card-header pt-0 pb-0';
                    moduleHeader.textContent = module.ModuleName;

                    const moduleBody = document.createElement('div');
                    moduleBody.className = 'card-body pt-0 pb-0 permissionBody';

                    // Create a switch button for the module
                    const moduleSwitchDiv = document.createElement('div');
                    moduleSwitchDiv.className = 'mb-1 form-check form-switch';

                    const moduleSwitchLabel = document.createElement('label');
                    moduleSwitchLabel.className = 'form-check-label';
                    moduleSwitchLabel.textContent = 'All Functions';

                    const moduleSwitchCheckbox = document.createElement('input');
                    moduleSwitchCheckbox.className = 'form-check-input';
                    moduleSwitchCheckbox.type = 'checkbox';
                    moduleSwitchCheckbox.id = `Module-${module.ModuleId}-switch`;

                    moduleSwitchDiv.appendChild(moduleSwitchLabel);
                    moduleSwitchDiv.appendChild(moduleSwitchCheckbox);
                    moduleBody.appendChild(moduleSwitchDiv);

                    module.Functions.forEach(func => {
                        const funcDiv = document.createElement('div');
                        funcDiv.className = 'mb-1 form-check form-switch';

                        const funcLabel = document.createElement('label');
                        funcLabel.className = 'form-check-label';
                        funcLabel.textContent = func.FunctionName;

                        const funcCheckbox = document.createElement('input');
                        funcCheckbox.className = 'form-check-input';
                        funcCheckbox.type = 'checkbox';
                        funcCheckbox.id = `${func.FunctionName}-${func.FunctionId}`;
                        funcCheckbox.checked = func.RMF[0].IsApplicable;

                        funcDiv.appendChild(funcLabel);
                        funcDiv.appendChild(funcCheckbox);
                        moduleBody.appendChild(funcDiv);

                        // Listen for changes in function checkboxes to update the module switch
                        funcCheckbox.addEventListener('change', function () {
                            const allFuncCheckboxes = moduleBody.querySelectorAll('.form-check-input');
                            moduleSwitchCheckbox.checked = Array.from(allFuncCheckboxes).every(cb => cb.checked);
                        });
                    });

                    // Listen for changes in module switch to update all function checkboxes
                    moduleSwitchCheckbox.addEventListener('change', function () {
                        const allFuncCheckboxes = moduleBody.querySelectorAll('.form-check-input');
                        allFuncCheckboxes.forEach(cb => cb.checked = moduleSwitchCheckbox.checked);
                    });

                    moduleCard.appendChild(moduleHeader);
                    moduleCard.appendChild(moduleBody);
                    cardBody.appendChild(moduleCard);
                });

                const cardFooter = document.createElement('div');
                cardFooter.className = 'card-footer';

                const saveButton = document.createElement('button');
                saveButton.className = 'btn btn-sm btn-success';
                saveButton.textContent = 'Save';

                cardFooter.appendChild(saveButton);

                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                card.appendChild(cardFooter);

                mainContent.appendChild(card);

                // Attach event listener to save button
                saveButton.addEventListener('click', function () {
                    saveRolePermissions(role.Modules);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching role permissions:', error);
        });
}

function saveRolePermissions(modules) {
debugger;
    const rolePermissions = [];

    modules.forEach(module => {
        module.Functions.forEach(func => {
            const functionId = func.FunctionId;
            const switchButton = document.getElementById(`${func.FunctionName}-${functionId}`);
            const isApplicable = switchButton.checked;


             // Update the permission object directly in the rolePermissions array
            const permission = rolePermissions.find(perm => perm.id === func.RMF[0].RoleModuleFunctionId);
            if (permission) {
                permission.isApplicable = isApplicable;
            } else {
                const functionPermission = {
                    id: func.RMF[0].RoleModuleFunctionId,
                    roleId: selectedRoleId,
                    isApplicable: isApplicable
                };
                console.log("functionPermission",functionPermission)
                rolePermissions.push(functionPermission);
            }
        });
    });

    // Now, you can proceed to send rolePermissions to the server
    console.log("Updated rolePermissions:", rolePermissions);

    // Example of sending rolePermissions to the server (replace this with your actual API call)
    // fetch('/pms/api/RolesPermissions/updateRolePermissons', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': localStorage.getItem('token_')
    //     },
    //     body: JSON.stringify(rolePermissions)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log(data);
    // })
    // .catch(error => {
    //     console.error('Error saving role permissions:', error);
    // });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchRolePermissionData();
});
