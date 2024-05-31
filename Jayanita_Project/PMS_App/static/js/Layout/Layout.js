
//----------#####----fetchModulePermissionData()-------#########----------
function fetchModulePermissionData() {
    debugger;
    // Retrieve token from local storage
    const token = localStorage.getItem('token_');
    const userId = localStorage.getItem('userId');

    // Check if token is available
    if (!token) {
        console.error('Token not found in local storage.');
        return;
    }

    // Prepare fetch options
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token // Include token in the request headers
        }
    };

    // Call the API using fetch
    fetch('/pms/api/Users/ModuleRight?userId=' + userId, options)
        .then(response => {
            // Check if response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse response body as JSON
        })
        .then(data => {
            // Check if data is empty or null
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            // Handle the fetched data
            // console.log('Fetched data:', data);

            // Generate and append the sidebar using the fetched data
            generateSidebar(data);
            fetchSpace_ListMenu();
        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching data:', error);
            alert(error.message); // Show the error message in an alert
        });
}

// Function to generate the sidebar based on fetched data
function generateSidebar(apiData) {
    // Get the parent element where the sidebar will be appended
    const navbarNav = document.getElementById('navbar-nav');

    // Loop through the API data to generate sidebar items
    apiData.forEach(category => {
        // Create the main category item
        const mainCategoryItem = document.createElement('li');
        mainCategoryItem.className = 'nav-item';
        mainCategoryItem.innerHTML = `
            <a class="nav-link menu-link" href="#sidebar${category.ModuleCategory}" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebar${category.ModuleCategory}">
                <i class="${category.CategoryIconURL}"></i> <span data-key="t-dashboards" id="ModuleCategoryHeader">${category.ModuleCategory}</span>
            </a>
            <div class="collapse menu-dropdown" id="sidebar${category.ModuleCategory}">
                <ul class="nav nav-sm flex-column"></ul>
            </div>
        `;

        // Append the main category item to the parent element
        navbarNav.appendChild(mainCategoryItem);

        // Get the child ul element to append module items
        const moduleList = mainCategoryItem.querySelector('ul');

        // Loop through modules of the category
        category.Modules.forEach(module => {
            // Create module item

            const moduleItem = document.createElement('li');
            moduleItem.className = 'nav-item';
            moduleItem.innerHTML = `
                <a href="/pms${module.routingpage}?moduleID=${module.moduleid}" class="nav-link" data-key="${module.module}">
                    <i class="${module.iconurl}"></i>${module.module}
                </a>`;
            // Append module item to the module list
            moduleList.appendChild(moduleItem);
        });
    });
}



//---------------fetchSpace_ListMenu---------------------
function fetchSpace_ListMenu() {
    debugger;
    console.log("fetchSpace_ListMenu called");
    // Retrieve token from local storage
    const token = localStorage.getItem('token_');

    // Check if token is available
    if (!token) {
        console.error('Token not found in local storage.');
        return;
    }

    // Prepare fetch options
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token // Include token in the request headers
        }
    };

    // Call the API using fetch
    fetch('/pms/api/Spc&ListMenu/', options)
        .then(response => {
            // Check if response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse response body as JSON
        })
        .then(data => {
            // Check if data is empty or null
            if (!data || data.length === 0) {
                console.error('Fetched data is empty or null.');
                return;
            }
            // Handle the fetched data
//            console.log('Spc&ListMenu:', data);

            // Generate and append the sidebar using the fetched data
            generateSpace_ListMenu(data);
        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching data:', error);
            alert(error.message); // Show the error message in an alert
        });
}

// Function to generate the sidebar based on fetched data
function generateSpace_ListMenu(apiData) {
    // Get the parent element where the sidebar will be appended
    const navbarNav = document.getElementById('navbar-nav');

    // Loop through the API data to generate sidebar items
    apiData.forEach((item, index) => {
        // Create unique ID for the dropdown based on space name and index
        const dropdownId = `sidebar${item.SpaceName.replace(/\s/g, '_')}_${index}`;

        // Create the main category item
        const mainCategoryItem = document.createElement('li');
        mainCategoryItem.className = 'nav-item';
        mainCategoryItem.innerHTML = `
            <a class="nav-link menu-link" href="#${dropdownId}" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="${dropdownId}">
                <i class="${item.SpaceIcon}"></i> <span data-key="t-dashboards" id="ModuleCategoryHeader">${item.SpaceName}</span>
            </a>
            <div class="collapse menu-dropdown" id="${dropdownId}">
                <ul class="nav nav-sm flex-column"></ul>
            </div>
        `;

        // Append the main category item to the parent element
        navbarNav.appendChild(mainCategoryItem);

        // Get the child ul element to append module items
        const moduleList = mainCategoryItem.querySelector('ul');

        // Loop through modules of the category
        item.Sup_Spaces.forEach(Spc => {
            // Create module item
            const moduleItem = document.createElement('li');
            moduleItem.className = 'nav-item';
            moduleItem.innerHTML = `
                <a href="/pms${Spc.routingPage}" class="nav-link" data-key="${Spc.SpaceListName}">
                    <i class="${Spc.SpaceListIcon}"></i>${Spc.SpaceListName}
                </a>`;
            // Append module item to the module list
            moduleList.appendChild(moduleItem);


        });
    });
}

// Call fetchModulePermissionData to start the process
fetchModulePermissionData();









function logoutFunction(){
       // Clear all items from localStorage
        localStorage.clear();

        Cookies.remove('token_');
        Cookies.remove('id');
        Cookies.remove('userId');
        Cookies.remove('name');
        Cookies.remove('roleId');
        Cookies.remove('roleName');
        Cookies.remove('userImage');
        Cookies.remove('name1');
        Cookies.remove('userImage1');

        // Redirect the user to the logout URL
        window.location.href = "logout";

    }
    debugger;
    var username = localStorage.getItem("name");
    var userImage = localStorage.getItem("userImage");

    //If You want to get data from Cookies
<!--    debugger;-->
<!--    var Username1 = getCookie("name1");-->
<!--    var UserImage1 = getCookie("userImage1");-->


    var usernamePlaceholder = document.getElementById("username-placeholder");
    var usernamePlaceholder1 = document.getElementById("username-placeholder1");

    usernamePlaceholder.textContent = username;
    usernamePlaceholder1.textContent = username;

    var userImageElement = document.getElementById("user_Image");
    userImageElement.src = userImage;



//abhishek_kumar1@sislinfotech.com



//fetchModulePermissionData(setSidebarData)

//var testData = ["Deepak", "rakesh", "avaneesh" ];
//
//var ModuleCatList = document.getElementById("ModuleCatList");
//
//testData.forEach(item => {
//    var ModuleCategoryHeaderA = document.createElement("a");
//    ModuleCategoryHeaderA.className = "nav-link menu-link";
//    ModuleCategoryHeaderA.href = "#sidebarDashboards";
//    ModuleCategoryHeaderA.setAttribute("data-bs-toggle", "collapse");
//    ModuleCategoryHeaderA.setAttribute("role", "button");
//    ModuleCategoryHeaderA.setAttribute("aria-expanded", "false");
//    ModuleCategoryHeaderA.setAttribute("aria-controls", "sidebarDashboards");
//
//    var I_tag = document.createElement("i");
//    I_tag.className = "ri-dashboard-2-line";
//
//    var CreateSpan = document.createElement("span");
//    CreateSpan.setAttribute("data-key", "t-dashboards");
//    CreateSpan.textContent = item;
//
//    ModuleCategoryHeaderA.appendChild(I_tag);
//    ModuleCategoryHeaderA.appendChild(CreateSpan);
//
//    ModuleCatList.appendChild(ModuleCategoryHeaderA);
//});






